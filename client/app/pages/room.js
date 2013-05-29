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

    $scope.addTrack = function(track) {
      var trk = cp(track, [ 'id', 'artwork_url', 'permalink_url', 'title', 'duration']);
      trk.user = cp(track.user, [ 'username', 'permalink_url' ]);

      room.socket.emit('addTrack', { track: trk });
    };

    function addParticipant(name) {
      room.participants.push({ name: name, sc: false });
    }

    function removeParticipant(name) {
      var participants = room.participants;
      var idx = -1;

      for (var i = 0, p; !!(p = participants[i]); i++) {
        if (p.name == name) {
          idx = i;
          break;
        }
      }

      if (idx != -1) {
        participants.splice(idx, 1);
      }
    }

    room.socket.on('__open', function() {

      console.log("SOCKET OPENED");
    });

    room.socket.on('__openTimeout', function() {
      console.log("OPEN TIMED OUT");
    });

    room.socket.on('__close', function() {
      console.log("SOCKET CLOSED");
    });

    room.socket.on('__error', function(e) {
      console.log("SOCKET ERROR", e);
    });

    room.socket.on('channelJoined', function(data) {
      room.connected = true;
      room.messages.push({ message: 'You joined the room as <' + data.name + '>'});

      angular.forEach(data.tracks, function(track) {
        room.tracks.push(track);
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
  var ChatController = function($scope, Sounds, Notifications) {

    var room = $scope.room;
    var messages = $scope.messages = room.messages;

    room.socket.on('text', function(text) {
      messages.push(text);

      Notifications.create(null, text.author + ' says', text.message);
    });

    $scope.send = function(input, event) {
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

      event.preventDefault();
      event.stopPropagation();
    };

    $scope.isEnter = function(e) {
      return e.keyCode == '13' && !e.shiftKey;
    };

    $scope.$watch('messages.length', function(newValue) {
      var lastMsg = $(".chat").find(".message:last-child");
      if (!lastMsg.length) {
        return;
      }

      $(".messages").animate({
         scrollTop: lastMsg.offset().top
      }, 200);
    });
  };

  ChatController.$inject = [ '$scope', 'Sounds', 'Notifications' ];


  /**
   * Controller that handles the track list
   */
  var TrackListController = function TrackListController($scope, $filter, Sounds, Notifications) {

    var room = $scope.room;
    var tracks = $scope.tracks = $scope.room.tracks;

    function findTrack(pattern) {
      return $filter('filter')(tracks, pattern)[0];
    }

    function insertTrack(track, position) {

      var oldTrackIdx = tracks.indexOf(track);

      var before = position.before ? findTrack({ trackId: position.before }) : null;
      var after = position.after ? findTrack({ trackId: position.after }) : null;

      if (before || after) {
        // remove track
        if (oldTrackIdx != -1) {
          room.tracks.splice(trackIdx, 1);
        }

        var newPos = tracks.indexOf(after) || tracks.indexOf(before) + 1;
        room.tracks.splice(newPos, 0, track);
      } else
      // make sure track is added even if before or 
      // after tracks have not been found
      if (oldTrackIdx == -1) {
        room.tracks.push(track);
      }
    }

    function startTrack(track, position) {
      Sounds.playTrack(track, position || 0);
      $scope.current = track;
    }

    function stopTrack(track) {
      Sounds.stop(track);
      $scope.current = null;
    }

    function publishMessage(title, message) {
      room.messages.push({ message: message });

      Notifications.create(null, title, message);
    }

    room.socket.on('trackAdded', function(trackAdded) {
      var track = trackAdded.track;
      var position = trackAdded.position;

      if (!position) {
        room.tracks.push(track);
      } else {
        insertTrack(track, position);
      }

      publishMessage('Track added', '<' + message.user + '> added track ' + track.title);
    });

    room.socket.on('trackStarted', function(message) {
      var trackId = message.trackId;

      var track = findTrack({ trackId: trackId });
      if (track) {
        startTrack(track, message.position);
      }

      publishMessage('Track started', '<' + message.user + '> started track ' + track.title);
    });

    room.socket.on('trackStopped', function(message) {
      var trackId = message.trackId;

      var track = findTrack({ trackId: trackId });
      if (Sounds.isPlaying(track)) {
        stopTrack(track);
      }

      publishMessage('Track stopped', '<' + message.user + '> stopped track ' + track.title);
    });

    room.socket.on('trackMoved', function(message) {
      var trackId = message.trackId;
      var position = message.position;

      var track = findTrack({ trackId: trackId });
      if (track) {
        insertTrack(track, position);
      }

      publishMessage('Track moved', '<' + message.user + '> moved track ' + track.title);
    });

    $scope.skip = function(track, e) {
      var percent = e.offsetX / $(e.currentTarget).width();
      var position = Math.round(percent * track.duration);

      startTrack(track, position);

      room.socket.emit('startTrack', { trackId: track.trackId, position: position });
    };

    $scope.start = function(track) {
      startTrack(track);
      room.socket.emit('startTrack', { trackId: track.trackId, position: 0 });
    };

    $scope.stop = function(track) {
      stopTrack(track);
      room.socket.emit('stopTrack', { trackId: track.trackId });
    };

    $scope.isPlaying = function(track) {
      return $scope.current == track;
    };

    $scope.$on('sounds.finished', function(e, track) {
      $scope.current = null;

      var idx = tracks.indexOf(track);
      if (idx == -1) {
        return;
      }

      var nextTrack = tracks[idx + 1];

      if (nextTrack) {
        startTrack(nextTrack);
      }
    });
  };

  TrackListController.$inject = [ '$scope', '$filter', 'Sounds', 'Notifications' ];


  /**
   * Controller that handles the list of participants
   */
  var ParticipantListController = function ParticipantListController($scope) {

    var room = $scope.room;
    var participants = $scope.participants = room.participants;


    $scope.connectToSoundCloud = function(user) {

      SC.get('/users/' + user.name, function(usr, error) {
        if (error && error.message.indexOf('404') != -1) {
          // well, no user ...
        } else {
          angular.extend(user, usr, { sc: true });
        }

        $scope.$apply();
      });
    };

    $scope.addFavorites = function(user) {
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
  var JoinRoomController = function JoinRoomController($scope, $location) {

    var room = $scope.room;

    $scope.join = function() {
      if (!$scope.name) {
        return;
      }

      room.socket.emit('channelJoin', { participantName: $scope.name });
    };

    // shortcut to join channel with a given name
    $scope.name = $location.search().user;

    if ($scope.name) {
      $scope.join();
    }
  };

  JoinRoomController.$inject = [ '$scope', '$location' ];


  var RouteConfig = function($routeProvider) {
    $routeProvider.when('/room/:id', {
      templateUrl: 'pages/room.html',
      controller: RoomController
    });
  };

  var timeFilter = function() {

    function leadingZero(number) {
      return number < 10 ? "0" + number : number;
    }

    function fmtTime(time) {
      time = time || 0;

      var h = Math.floor(time / 1000 / 60 / 60);
      var min =  Math.floor(time / 1000 / 60) % 60;
      var s = Math.floor(time / 1000) % 60;

      return (h ? (h + ":") : "") + leadingZero(min) + ":" + leadingZero(s);
    }

    return function(input, uppercase) {
      var out = fmtTime(input);
      return out;
    };
  };

  RouteConfig.$inject = [ '$routeProvider' ];

  module
    .config(RouteConfig)
    .filter('time', timeFilter)
    .controller('ChatController', ChatController)
    .controller('JoinRoomController', JoinRoomController)
    .controller('TrackListController', TrackListController)
    .controller('ParticipantListController', ParticipantListController);

});