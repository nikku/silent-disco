ngDefine('disco.pages', [
  'angular',
  'jquery'
], function(module, angular, $) {

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
  var RoomController = function($scope, $routeParams, $filter, socket, Sounds) {

    var room = $scope.room = {
      id: $routeParams['id'],
      connected: false,
      participants: [],
      messages: [],
      tracks: []
    };

    room.socket = socket.getSocket(room.id);

    $scope.$on('$destroy', function (event, next) {
      Sounds.stop(null);

      socket.closeSocket(room.id);
      room.socket = null;
    });

    $scope.addTrack = function(track) {
      if (!track.streamable) {
        room.messages.push({ message: "Not adding track " + track.title + ": Track is not streamable" });
        return;
      }

      var trk = cp(track, [ 'id', 'artwork_url', 'permalink_url', 'title', 'duration']);
      trk.user = cp(track.user, [ 'username', 'permalink_url' ]);

      room.socket.emit('addTrack', { track: trk });
    };

    $scope.undoAction = function(action) {

      var undo = action.undo;

      if (!undo) {
        return;
      }

      action.undo = null;
      room.socket.emit(undo.name, undo.message);
    };

    function findTrack(pattern) {
      return $filter('filter')(room.tracks, pattern)[0];
    }

    function resumePlaylist(trackId, diff) {

      var track = findTrack({ trackId: trackId });

      if (!track) {
        return;
      }

      var idx = room.tracks.indexOf(track);

      // skip through playlist until currently 
      // playing track is found
      while (diff > track.duration) {
        diff -= track.duration;
        track = room.tracks[++idx];

        if (!track) {
          return;
        }
      }

      room.socket.fire('trackStarted', { trackId: track.trackId, position: diff, user: room.identity.id });
    }

    function addParticipant(participant) {
      angular.extend(participant, { sc: false });
      room.participants.push(participant);
    }

    function removeParticipant(id) {
      var participants = room.participants;
      var participant;
      var idx = -1;

      for (var i = 0, p; !!(p = participants[i]); i++) {
        if (p.id == id) {
          idx = i;
          participant = p;
          break;
        }
      }

      if (idx != -1) {
        participants.splice(idx, 1);
      }

      return participant;
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
      room.identity = data.user;

      angular.forEach(data.tracks, function(track) {
        room.tracks.push(track);
      });

      angular.forEach(data.participants, function(participant) {
        addParticipant(participant);
      });

      addParticipant(data.user);

      room.messages.push({ message: 'You joined the room ' + room.id + ' as <' + data.user.name + '>'});

      var position = data.room.position;

      if (position && position.status == 'PLAYING') {
        var diff = data.time - position.date + position.position;
        resumePlaylist(position.trackId, diff);
      }
    });

    room.socket.on('participantJoined', function(data) {
      var user = data.user;

      addParticipant(user);

      room.messages.push({ message: 'Participant <' + user.name + '> joined the room'});
    });

    room.socket.on('participantLeft', function(data) {
      var participant = removeParticipant(data.userId);
      if (participant) {
        room.messages.push({ message: 'Participant <' + participant.name + '> left the room'});
      }
    });
  };

  RoomController.$inject = [ '$scope', '$routeParams', '$filter', 'socket', 'Sounds'];


  /**
   * Controller that handles the input field and 
   * chat area.
   */
  var ChatController = function($scope, $filter, Sounds, Notifications) {

    var room = $scope.room;
    var messages = $scope.messages = room.messages;

    function findParticipant(pattern) {
      return $filter('filter')(room.participants, pattern)[0];
    }

    room.socket.on('text', function(text) {

      var participant = findParticipant({ id: text.author });

      messages.push({ type: 'text', message: text.message, user: participant });

      Notifications.create(null, participant.name + ':', text.message);
    });

    $scope.clearMessages = function() {
      room.messages = messages = $scope.messages = [];
    };

    $scope.focusInput = function() {
      $("#chat-input").focus();
    };

    $scope.send = function(input, event) {
      if (!input) {
        return;
      }

      function postMessage() {
        room.socket.emit('text', { message: input });

        messages.push({ type: 'text', user: room.identity, message: input });
      }

      if (/^\s*http(s)*:\/\/soundcloud.com\//.test(input)) {
        Sounds.resolve(input, function(e) {
          if (e) {
            switch (e.kind) {
            case 'track':
              $scope.addTrack(e);
              return;
            case 'playlist':
              messages.push({ type: 'text', message: 'Adding tracks from playlist ' + e.title });
              angular.forEach(e.tracks, function(track) {
                $scope.addTrack(track);
              });
              return;
            }
          }

          postMessage();
        });
      } else {
        postMessage();
      }

      $scope.input = input = '';

      event.preventDefault();
      event.stopPropagation();
    };

    $scope.isCurrent = function(user) {
      return room.identity == user;
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
         scrollTop: $(".messages").prop("scrollHeight")
      }, 200);
    });
  };

  ChatController.$inject = [ '$scope', '$filter', 'Sounds', 'Notifications' ];


  /**
   * Controller that handles the track list
   */
  var TrackListController = function TrackListController($scope, $filter, Sounds, Notifications, $timeout) {

    var room = $scope.room;
    var tracks = $scope.tracks = $scope.room.tracks;

    var selected = null;

    function observeKeyPress(e) {
      // DEL key
      if (e.which == 46 && selected) {
        $scope.$apply(function() {
          $scope.removeTrack(selected);
        });
      }
    }

    $(".ctn-playlist").hover(function() {
      $(document).on('keyup', observeKeyPress);
    }, function() {
      $(document).off('keyup', observeKeyPress);
    });

    function findTrack(pattern) {
      return $filter('filter')(tracks, pattern)[0];
    }

    function findParticipant(pattern) {
      return $filter('filter')(room.participants, pattern)[0];
    }

    function insertTrack(track, position) {

      var idx = tracks.indexOf(track);
      if (idx != -1) {
        tracks.splice(idx, 1);
      }

      tracks.splice(position.position, 0, track);
    }

    function startTrack(track, position) {
      Sounds.playTrack(track, position || 0);
      $scope.current = track;
    }

    function stopTrack(track) {
      Sounds.stop(track);
      $scope.current = null;
    }

    function publishMessage(message, undo) {

      var title = message.title,
          track = message.track,
          participant = message.participant || findParticipant({ id: message.userId });

      var msg = { type: 'track', track: track, user: participant, message: title };

      room.messages.push(msg);

      if (undo) {
        msg.undo = undo;

        $timeout(function() {
          msg.undo = null;
        }, 20000);
      }

      var name = participant == room.identity ? 'you' : participant.name;

      Notifications.create(null, name, title + ' ' + track.title);
    }

    room.socket.on('trackAdded', function(message) {
      var track = message.track;
      var position = message.position;

      if (findTrack({ trackId: track.trackId })) {
        // track already added
        return;
      }

      if (!position) {
        room.tracks.push(track);
      } else {
        insertTrack(track, position);
      }

      publishMessage({ title: 'Added track', track: track, userId: message.user });
    });

    room.socket.on('trackStarted', function(message) {
      var trackId = message.trackId;

      var track = findTrack({ trackId: trackId });
      if (!track) {
        return;
      }

      startTrack(track, message.position);
      publishMessage({ title: 'Started track', track: track, userId: message.user });
    });

    room.socket.on('trackStopped', function(message) {
      var trackId = message.trackId;

      var track = findTrack({ trackId: trackId });
      if (Sounds.isPlaying(track)) {
        stopTrack(track);
        publishMessage({ title: 'Stopped track', track: track, userId: message.user });
      }
    });

    room.socket.on('trackMoved', function(message) {
      var trackId = message.trackId;
      var to = message.to;

      var track = findTrack({ trackId: trackId });
      if (!track) {
        return;
      }

      insertTrack(track, to);
      publishMessage({ title: 'Moved track', track: track, userId: message.user });
    });

    room.socket.on('trackRemoved', function(message) {
      var trackId = message.trackId;

      var track = findTrack({ trackId: trackId });
      if (!track) {
        return;
      }

      if ($scope.current == track) {
        stopTrack(track);
      }

      tracks.splice(tracks.indexOf(track), 1);
      publishMessage({ title: 'Removed track', track: track, userId: message.user}, message.undo);
    });

    $scope.select = function(track) {
      selected = track;
    };

    $scope.isSelected = function(track) {
      return track == selected;
    };

    $scope.removeTrack = function(track) {
      room.socket.emit('removeTrack', { trackId: track.trackId });
    };

    $scope.movedTrack = function(e, ui) {

      var from = ui.item.sortable.index;
      var to = ui.item.index();

      var track = tracks[to];

      room.socket.emit('moveTrack', {
        trackId: track.trackId,
        from: { position: from },
        to: { position: to },
        playlistPosition: $scope.current ? {
          trackId: $scope.current.trackId,
          position: $scope.current.position
        } : null
      });
    };

    $scope.skip = function(track, position) {
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

    $scope.showCurrentOnTop = function() {
      var current = $scope.current;
      if (!current) {
        return false;
      }

      var idx = tracks.indexOf(current);

      var element = $(".tracks .track").eq(idx);
      var parent = element.parent();

      function isScrolledIntoView(element, container) {
        var containerHeight = container.height();
        var containerScrollTop = container.scrollTop();
        var containerScrollBottom = containerHeight + container.scrollTop();

        var elementTop = element.position().top;
        var elementBottom = elementTop + element.height();

        var topInView = elementTop >= 0;
        var bottomInView = elementBottom <= containerHeight;

        return topInView && bottomInView;
      }

      return !isScrolledIntoView(element, parent);
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

  TrackListController.$inject = [ '$scope', '$filter', 'Sounds', 'Notifications', '$timeout' ];


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
    $scope.joining = false;

    $scope.join = function() {
      if (!$scope.name || $scope.joining) {
        return;
      }

      $scope.joining = true;
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


  module.filter('track', function($sanitize) {

    return function(track) {
      if (!track) {
        return '';
      }

      return '<a href="' + $sanitize(track.permalink_url) + '" target="_blank">' + $sanitize(track.title) + '</a>';
    };
  });

  module.directive('soundCloudTrack', function() {

    return {
      scope: {
        track: '=soundCloudTrack'
      },
      replace: true,
      template: '<a ng-href="{{ track.permalink_url }}" target="_blank">{{ track.title}}</a>'
    };
  });

  module.directive('soundCloudUser', function() {
    return {
      scope: {
        user: '=soundCloudUser'
      },
      replace: true,
      template: '<a ng-href="{{ user.permalink_url }}" target="_blank">{{ user.username }}</a>'
    };
  });

  module.directive('trackTitle', function() {
    return {
      scope: {
        track: '='
      },
      replace: true,
      template:
        '<div class="title" title="{{ track.user.username }} - {{ track.title }}">' +
        '  <a sound-cloud-user="track.user"></a>' +
        '  -' +
        '  <a sound-cloud-track="track"></a>' +
        '</div>'
    };
  });

  module.directive('focusable', function() {
    return {
      link: function(scope, element, attrs) {

        $(element)
          .attr('tabindex', 0)
          .disableSelection()
          .click(function() {
            $(this).focus();
          });
      }
    };
  });

  module.directive('currentTrack', function() {
    return {
      scope: {
        track: "=track",
        onSkip: "&",
        onStop: "&",
        onMute: "&"
      },
      replace: true,
      templateUrl: 'common/current-track.html',
      link: function(scope, element, attrs, trackList) {

        scope.stop = function() {
          scope.onStop();
        };

        scope.skip = function(e) {
          var track = scope.track;

          var target = $(e.currentTarget);

          // firefox compatibility (does not support offsetX)
          var offset = e.offsetX || e.pageX - target.offset().left;

          var percent = offset / target.width();
          var position = Math.round(percent * track.duration);

          scope.onSkip({ position: position });
        };

        scope.mute = function() {
          scope.onMute();
        };
      }
    };
  });

  module
    .config(RouteConfig)
    .filter('time', timeFilter)
    .controller('ChatController', ChatController)
    .controller('JoinRoomController', JoinRoomController)
    .controller('TrackListController', TrackListController)
    .controller('ParticipantListController', ParticipantListController);

});