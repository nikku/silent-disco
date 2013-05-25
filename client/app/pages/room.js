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

  /**
   * Root controller of a room
   */
  var RoomController = function ($scope, $routeParams, socket, Sounds) {

    var room = $scope.room = {
      id: $routeParams['id'],
      connected: false,
      participants: [],
      messages: [],
      tracks: []
    };

    room.socket = socket.getSocket(room.id);

    $scope.$on('$destroy', function (event, next) {
      socket.closeSocket(room.id);
      room.socket = null;
    });

    $scope.fmtTime = function(time) {

      var h = Math.floor(time / 1000 / 60 / 60) % 24;
      var min =  $scope.leadingZero(Math.floor(time / 1000 / 60) % 60);
      var s = $scope.leadingZero(Math.floor(time / 1000) % 60);

      return (h ? (h + ":") : "") + min + ":" + s;
    };

    $scope.leadingZero = function(number) {
      return number < 10 ? "0" + number :  number;
    };

    $scope.addTrack = function(track) {
      var trk = cp(track, [ 'id', 'artwork_url', 'permalink_url', 'title', 'duration']);
      trk.user = cp(track.user, [ 'username', 'permalink_url' ]);

      room.socket.emit('addTrack', { track: trk });
    };

    function addParticipant(name) {
      SC.get('/users/' + name, function(user, error) {
        if (error && error.message.indexOf('404') != -1) {
          user = { username: name, sc: false };
        } else {
          user.sc = true;
        }

        $scope.$apply(function () {
          room.participants.push(user);
        });
      });
    }

    function removeParticipant(name) {
      var participants = room.participants;
      var idx = -1;

      for (var i = 0, p; !!(p = participants[i]); i++) {
        if (p.username == name) {
          idx = i;
          break;
        }
      }

      if (idx != -1) {
        participants.splice(idx, 1);
      }
    }

    room.socket.on('channelJoined', function(data) {
      room.connected = true;
      room.messages.push({ message: 'You joined the room as <' + data.name + '>'});

      angular.forEach(data.tracks, function(track) {
        room.tracks.unshift(track);
      });

      angular.forEach(data.participants, function(participant) {
        addParticipant(participant);
      });

      addParticipant(data.name);
    });

    room.socket.on('participantJoined', function(data) {
      room.messages.push({ message: 'Participant <' + data.name + '> joined the room'});
      addParticipant(data.name);
    });

    room.socket.on('participantLeft', function(data) {
      removeParticipant(data.name);
      room.messages.push({ message: 'Participant <' + data.name + '> left the room'});
    });
  };

  RoomController.$inject = [ '$scope', '$routeParams', 'socket', 'Sounds'];


  /**
   * Controller that handles the input field and 
   * chat area.
   */
  var ChatController = function($scope, Sounds) {

    var room = $scope.room;
    var messages = $scope.messages = room.messages;

    room.socket.on('text', function(text) {
      messages.push(text);
    });

    $scope.send = function(input) {
      if (!input) {
        return;
      }

      var msg = { message: input, author: 'you' };

      if (/^\s*http(s)*:\/\/soundcloud.com\//.test(input)) {
        Sounds.resolve(input, function(track) {
          if (track && track.kind == 'track') {
            $scope.addTrack(track);
          }
        });
      } else {
        messages.push(msg);
      }

      room.socket.emit('text', msg);
      $scope.input = input = '';
    };

    $scope.isEnter = function(e) {
      return e.keyCode == '13' && !e.shiftKey;
    };
  };

  ChatController.$inject = [ '$scope', 'Sounds' ];


  /**
   * Controller that handles the track list
   */
  var TrackListController = function TrackListController($scope, Sounds) {

    var room = $scope.room;
    var tracks = $scope.tracks = $scope.room.tracks;

    room.socket.on('trackAdded', function(trackAdded) {
      var track = trackAdded.track;

      room.tracks.unshift(track);
    });

    $scope.startTrack = function(track) {
      Sounds.playTrack(track);
    };

    $scope.isPlaying = function(track) {
      return track.duration && Sounds.isPlaying(track);
    };
  };

  TrackListController.$inject = [ '$scope', 'Sounds' ];


  /**
   * Controller that handles the list of participants
   */
  var ParticipantListController = function ParticipantListController($scope) {

    var room = $scope.room;
    var participants = $scope.participants = room.participants;

    $scope.addFavourites = function(user) {
      SC.get('/users/' + user.id + '/favorites', function (favorites, error) {
        room.messages.push({ message: 'Adding ' + favorites.length + ' favorites of ' + user.username });

        if (error) {
          console.log('error occured', error);
          return;
        }

        $scope.$apply(function () {
          angular.forEach(favorites, function (fav) {
           if (fav.kind == 'track') {
              $scope.addTrack(fav);
            }
          });
        });
      });
    };
  };

  ParticipantListController.$inject = [ '$scope' ];


  /**
   * Controller that handles joining a room
   */
  var JoinRoomController = function JoinRoomController($scope) {

    var room = $scope.room;

    $scope.join = function() {
      if (!$scope.name) {
        return;
      }

      room.socket.emit('channelJoin', { participantName: $scope.name });
    };
  };

  JoinRoomController.$inject = [ '$scope' ];


  var RouteConfig = function($routeProvider) {
    $routeProvider.when('/room/:id', {
      templateUrl: 'pages/room.html',
      controller: RoomController
    });
  };

  RouteConfig.$inject = [ '$routeProvider' ];

  module
    .config(RouteConfig)
    .controller('ChatController', ChatController)
    .controller('JoinRoomController', JoinRoomController)
    .controller('TrackListController', TrackListController)
    .controller('ParticipantListController', ParticipantListController);

});