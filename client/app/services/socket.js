ngDefine('disco.services', [
  'angular'
], function(module, angular) {

  module.factory('socket', function($rootScope, Uri) {

    var Socket;

    (function() {

      var callbacks = {},
          connection = null,
          outgoing = [],
          opened = false;

      function createWebSocket(uri) {
        var WS = window.WebSocket || window.MozWebSocket;

        return new WS(uri);
      }

      function send(data) {
        if (!opened) {
          outgoing.push(data);
        } else {
          var str = JSON.stringify(data);

          connection.send(str);
        }
      }

      function receiveObj(obj, e) {


        for (var key in obj) {

          var typeCallbacks = getCallbacks(key);
          var message = obj[key];

          for (var i = 0; i < typeCallbacks.length; i++) {
            typeCallbacks[i].apply(null, [ message, e, key ]);
          }
        }
      }

      function receive(data, e) {

        var envelope = JSON.parse(data);
        receiveObj(envelope, e);
      }

      function getCallbacks(type) {
        var typeCallbacks = callbacks[type];
        if (!typeCallbacks) {
          typeCallbacks = callbacks[type] = [];
        }

        return typeCallbacks;
      }

      function initSocket(socket, connection) {

        connection.onopen = function(e) {
          opened = true;

          $rootScope.$apply(function() {
            receiveObj({ '__open' : { } }, e);
          });

          while (outgoing.length) {
            var envelope = outgoing.shift();
            send(envelope);
          }
        };

        // Log errors
        connection.onerror = function(e) {
          $rootScope.$apply(function() {
            receiveObj({ '__error' : { } }, e);
          });
        };

        connection.onclose = function(e) {
          // was previously opened?
          var closed = opened;

          opened = false;

          $rootScope.$apply(function() {
            var envelope = {};
            envelope[closed ? '__close' : '__openTimeout'] = {};

            receiveObj(envelope, e);
          });
        };

        // Log messages from the server
        connection.onmessage = function (e) {
          $rootScope.$apply(function() {
            receive(e.data);
          });
        };
      }

      Socket = function(uri) {
        connection = createWebSocket(uri);
        callbacks = {};
        outgoing = [];

        initSocket(this, connection);
      };

      angular.extend(Socket.prototype, {
        emit: function(type, message) {
          var envelope = {};
          envelope[type] = message;

          send(envelope);
        },

        on: function(type, callback) {
          getCallbacks(type).push(callback);
        },

        close: function () {
          connection.close();
        }
      });
    })();

    return {
      sockets : {},

      getSocket : function (prefix) {
        if (!this.sockets[prefix]) {
          this.sockets[prefix] = new Socket(Uri.appUri('ws://'+prefix+'/websocket'));
        }
        return this.sockets[prefix];
      },

      closeSocket : function (socketId) {
        this.sockets[socketId].close();
        delete this.sockets[socketId];
      }
    };
  });
});