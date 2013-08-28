ngDefine('disco.services.socket', [
  'angular',
  'module:common.web.uri:web-common/services/uri'
], function(module, angular) {

  module.factory('socket', function($rootScope, Uri) {

    var nextId = 0;
    var debug = debug;

    function createWebSocket(uri) {
      var WS = window.WebSocket || window.MozWebSocket;

      return new WS(uri);
    }

    var Socket = function(id, uri) {

      var callbacks = {},
          connection = null,
          outgoing = [],
          opened = false;

      var self = this;

      this.id = id;
      this.uri = uri;

      function debug(direction, type, data) {
        if (self.debugging) {
          console.log("socket #" + id + " " + direction + " " + type);
        }
      }

      function send(data) {
        if (!opened) {
          outgoing.push(data);
        } else {
          var str = JSON.stringify(data);

          for (var key in data) {
            debug("SEND", key, data[key]);
          }

          connection.send(str);
        }
      }

      function receiveMessage(type, message, e) {
        debug("RECEIVE", type, message);

        var typeCallbacks = getCallbacks(type);

        for (var i = 0; i < typeCallbacks.length; i++) {
          typeCallbacks[i].apply(null, [ message, e, type ]);
        }
      }

      function receiveEnvelope(envelope, e) {
        for (var key in envelope) {
          receiveMessage(key, envelope[key], e);
        }
      }

      function receive(data, e) {

        var envelope = JSON.parse(data);
        receiveEnvelope(envelope, e);
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
            receiveMessage('__open', { }, e);
          });

          while (outgoing.length) {
            var envelope = outgoing.shift();
            send(envelope);
          }
        };

        // Log errors
        connection.onerror = function(e) {
          $rootScope.$apply(function() {
            receiveMessage('__error', { }, e);
          });
        };

        connection.onclose = function(e) {
          // was previously opened?
          var closed = opened;

          opened = false;

          $rootScope.$apply(function() {
            receiveMessage(closed ? '__close' : '__openTimeout', {}, e);
          });
        };

        // Log messages from the server
        connection.onmessage = function (e) {
          $rootScope.$apply(function() {
            receive(e.data);
          });
        };
      }

      connection = createWebSocket(uri);
      callbacks = {};
      outgoing = [];

      initSocket(this, connection);

      angular.extend(this, {
        emit: function(type, message) {
          var envelope = {};
          envelope[type] = message;

          send(envelope);
        },

        /**
         * Asynchronously dispatches event to listeners
         *
         * @param type {String} type of the message
         * @param message {Object} the message
         */
        fire: function(type, message) {
          setTimeout(function() {
            $rootScope.$apply(function() {
              receiveMessage(type, message);
            });
          }, 0);
        },

        /**
         * Registers a callback for a given message type
         *
         * @param type {string} the message type
         * @param callback {Function} the callback to be called with (message, type) 
         *                            when the message is being received
         */
        on: function(type, callback) {
          getCallbacks(type).push(callback);
        },

        /**
         * Registers a callback for a given message type that is
         * executed once only, i.e. gets removed when a message of 
         * the given type is received.
         *
         * @param type {string}
         * @param callback {Function}
         */
        once: function(type, callback) {

          var self = this;
          var fn = function(data, type) {
            self.off(type, fn);

            callback(data, type);
          }

          this.on(type, fn);
        },

        /**
         * Removes registration for messages by callback, callback + type or type
         */
        off: function(type, callback) {
          if (angular.isFunction(type)) {
            callback = type;
            type = null;
          }

          function removeFromArray(e, array) {
            var idx = array.indexOf(e);
            if (idx != -1) {
              array.splice(idx, 1);
            }
          }

          if (type) {
            var cbs = getCallbacks(type);

            if (callback) {
              removeFromArray(callback, cbs);
            } else {
              // empty callbacks
              cbs.length = 0;
            }
          } else {
            for (var i = 0, cbs; !!(cbs = callbacks[i]); i++) {
              removeFromArray(callback, cbs);
            }
          }
        },

        close: function () {
          connection.close();
        }
      });
    };

    return {
      sockets: {},

      createSocket: function(roomId) {
        return new Socket(nextId++, Uri.appUri('ws://' + roomId + '/websocket'));
      },

      getSocket: function(roomId) {
        if (!this.sockets[roomId]) {
          this.sockets[roomId] = this.createSocket(roomId);
        }
        return this.sockets[roomId];
      },

      closeSocket: function(roomId) {
        var socket = this.sockets[roomId];
        if (socket) {
          socket.close();
          delete this.sockets[roomId];
        }
      }
    };
  });
});