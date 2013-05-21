ngDefine('disco.pages', [
  'angular'
], function(module, angular) {

  var ChatController = function($scope, Sounds) {

    var messages = $scope.messages;
    var tracks = $scope.tracks;

    $scope.room.on('text', function(text) {
      $scope.messages.push(text);
    });

    $scope.send = function(input) {
      if (!input) {
        return;
      }

      if (/^\s*http(s)*:\/\/soundcloud.com\//.test(input)) {
        Sounds.resolve(input, function(track) {
          Sounds.play(track);

          tracks.push(track);
        });
      }

      var msg = { message: input, author: 'you' };

      $scope.messages.push(msg);

      $scope.room.emit('text', msg);
    };
  };

  ChatController.$inject = [ '$scope', 'Sounds' ];

  var RoomController = function (params, $scope, socket, Sounds) {

    $scope.connected = false;
    $scope.roomId = params['id'];

    var messages = $scope.messages = [];
    var tracks = $scope.tracks = [];

    var room = $scope.room = socket.getSocket($scope.roomId);

    $scope.$on("$destroy", function (event, next) {
      socket.closeSocket($scope.roomId);
    });

    $scope.join = function(name) {
      if (!name) {
        return;
      }

      room.emit('channelJoin', { participantName: name });
    };

    room.on('channelJoined', function(data) {
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

  RoomController.$inject = [ '$routeParams', '$scope', 'socket', 'Sounds'];

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
