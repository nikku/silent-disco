ngDefine('disco.pages', [
  'angular'
], function(module, angular) {

  var ChatController = function($scope, socket, Sounds) {

    var messages = $scope.messages;
    var tracks = $scope.tracks;

    socket.on('text', function(text) {
      $scope.messages.push(text);
    });

    $scope.send = function(input) {
      if (!input) {
        return;
      }

      if (/^\s*https:\/\/soundcloud.com\//.test(input)) {
        Sounds.resolve(input, function(track) {
          Sounds.play(track);

          tracks.push(track);
        });
      }

      var msg = { message: input, author: 'you' };

      $scope.messages.push(msg);

      socket.emit('text', msg);
    };
  };

  ChatController.$inject = [ '$scope', 'socket', 'Sounds' ];

  var RoomController = function ($scope, socket, Sounds) {

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
      return Sounds.playing && Sounds.playing.track.id == track.id;
    };

    $scope.startTrack = function (track) {
      Sounds.play(track);
    };

    $scope.fmtTime = function(time) {

      var h = Math.floor(time / 1000 / 60 / 60) % 24;
      var min =  $scope.leadingZero(Math.floor(time / 1000 / 60) % 60);
      var s = $scope.leadingZero(Math.floor(time / 1000) % 60);

      return (h ? (h + ":") : "") + min + ":" + s;
    };

    $scope.leadingZero = function(number) {
      return number < 10 ? "0" + number :  number;
    }
  };

  RoomController.$inject = [ '$scope', 'socket', 'Sounds'];

  var RouteConfig = function($routeProvider) {
    $routeProvider.when('/room/:id', {
      templateUrl: 'pages/room.html',
      controller: RoomController
    });
  };

  RouteConfig.$inject = [ '$routeProvider' ];

  module
    .config(RouteConfig)
    .controller('ChatController', ChatController);

});
