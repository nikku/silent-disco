ngDefine('disco.pages', [
  'angular'
], function(module, angular) {

  var ChatController = function($scope, socket, Sounds) {

    var messages = $scope.messages;
    var tracks = $scope.tracks;

    var sounds = new Sounds();

    socket.on('text', function(text) {
      $scope.messages.push(text);
    });

    $scope.send = function(input) {
      if (!input) {
        return;
      }

      if (/^\s*https:\/\/soundcloud.com\//.test(input)) {
        sounds.resolve(input, function(track) {
          sounds.play(track);

          tracks.push(track);
        });
      }

      var msg = { message: input, author: 'you' };

      $scope.messages.push(msg);

      socket.emit('text', msg);
    };
  };

  ChatController.$inject = [ '$scope', 'socket', 'Sounds' ];

  var Controller = function ($scope, socket) {

    $scope.connected = false;

    var messages = $scope.messages = [];
    var tracks = $scope.tracks = [];

    $scope.join = function(name) {
      if (!name) {
        return;
      }

      socket.emit('channelJoin', { name: name });
    };

    socket.on('channelJoined', function(data) {
      if (data.name == $scope.name) {
        $scope.connected = true;
        $scope.messages.push({ message: 'You joined the channel '});
      }
    });

    $scope.isPlaying = function(track) {
      return track.position;
    };

    $scope.fmtTime = function(time) {

      var h = Math.floor(time / 1000 / 60 / 60) % 24;
      var min =  Math.floor(time / 1000 / 60) % 60;
      var s = Math.floor(time / 1000) % 60;

      return (h ? (h + ":") : "") + min + ":" + s;
    };
  };

  Controller.$inject = [ '$scope', 'socket' ];

  var RouteConfig = function($routeProvider) {
    $routeProvider.when('/room/:id', {
      templateUrl: 'pages/room.html',
      controller: Controller
    });
  };

  RouteConfig.$inject = [ '$routeProvider' ];

  module
    .config(RouteConfig)
    .controller('ChatController', ChatController);

});
