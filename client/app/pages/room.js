ngDefine('disco.pages', [
  'angular'
], function(module, angular) {

  var cp = function(obj, attrs) {
    var copy = {};

    angular.forEach(attrs, function(key) {
      copy[key] = obj[key];
    });

    return copy;
  };

  var ChatController = function($scope, Sounds) {

    var messages = $scope.messages;
    var tracks = $scope.tracks;

    $scope.room.on('text', function(text) {
      $scope.messages.push(text);
    });

    $scope.room.on('trackAdded', function(trackAdded) {
      var track = trackAdded.track;

      $scope.tracks.unshift(track);
    });

    $scope.send = function(input) {
      if (!input) {
        return;
      }

      var msg = { message: input, author: 'you' };

      $scope.messages.push(msg);

      if (/^\s*http(s)*:\/\/soundcloud.com\//.test(input)) {
        Sounds.resolve(input, function(track) {

          if (track && track.kind == 'track') {
            var trk = cp(track, ['artwork_url', 'permalink_url', 'title', 'duration']);
            trk.user = cp(track.user, ['username', 'permalink_url']);

            $scope.room.emit('addTrack', { track: trk });
          }
        });
      }

      $scope.room.emit('text', msg);
    };

    $scope.$on("addTrack", function (event, data) {
      $scope.send(data);
    });
  };

  ChatController.$inject = [ '$scope', 'Sounds' ];

  var RoomController = function (params, $scope, $rootScope, socket, Sounds) {

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

        angular.forEach(data.tracks, function(track) {
          $scope.tracks.push(track);
        });

        $rootScope.$broadcast('channelJoined', data);
      }
    });

    room.on('participantJoined', function(data) {
      $scope.messages.push({ message: 'Participant ' + data.name + ' joined the channel'});
      $rootScope.$broadcast('participantJoined', data);
    });

    room.on('participantLeft', function(data) {
      $scope.messages.push({ message: 'Participant ' + data.name + ' left the channel'});
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
    };
  };

  RoomController.$inject = [ '$routeParams', '$scope', '$rootScope', 'socket', 'Sounds'];

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
