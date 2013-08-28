ngDefine('disco.pages', [
  'angular',
  'jquery',
  'require'
], function(module, angular, $, require) {

  var cp = function(obj, attrs) {
    var copy = {};

    angular.forEach(attrs, function(key) {
      copy[key] = obj[key];
    });

    return copy;
  };

  var WORD_REGEXP = /^[\w-]+$/;
  var WORD_WITH_SPACES_REGEXP = /^[\w- ]+$/;

  /**
   * Root controller of a room
   */
  var RoomController = [ '$scope', '$filter', '$location', '$timeout', 'socket', 'Sounds', 'room',
                 function($scope, $filter, $location, $timeout, socket, Sounds, room) {


    $scope.room = room;

    room.socket = socket.getSocket(room.id);

    $scope.$watch('room.connected', function(connected) {
      $scope.page = connected ? 'pages/room/main.html' : 'pages/room/join.html';
    });

    $scope.$on('$destroy', function (event, next) {
      Sounds.stop(null);

      socket.closeSocket(room.id);
      room.socket = null;
    });

    $scope.addTrack = function(track) {
      if (!track.streamable) {
        room.messages.push({ message: 'Not adding track ' + track.title + ': Track is not streamable' });
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

      console.log('SOCKET OPENED');
    });

    room.socket.on('__openTimeout', function() {
      console.log('OPEN TIMED OUT');
    });

    room.socket.on('__close', function() {
      console.log('SOCKET CLOSED');
    });

    room.socket.on('__error', function(e) {
      console.log('SOCKET ERROR', e);
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

      var resumeDelay = 2000;

      if (position && position.status == 'PLAYING') {
        var diff = data.time - position.date + position.position + resumeDelay;

        $timeout(function() {
          resumePlaylist(position.trackId, diff);
        }, resumeDelay);
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
  }];


  /**
   * Controller that handles the input field and 
   * chat area.
   */
  var ChatController = [ '$scope', '$filter', '$window', 'Sounds', 'Notifications', 
                 function($scope, $filter, $window, Sounds, Notifications) {

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
      var selection = $window.getSelection();

      if (selection && selection.type == 'Range') {
        return;
      }

      $('#chat-input').focus();
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
      var lastMsg = $('.chat').find('.message:last-child');
      if (!lastMsg.length) {
        return;
      }

      $('.messages').animate({
         scrollTop: $('.messages').prop('scrollHeight')
      }, 200);
    });
  }];

  /**
   * Controller that handles the track list
   */
  var TrackListController = [ '$scope', '$filter', 'Sounds', 'Notifications', '$timeout', 
                     function ($scope, $filter, Sounds, Notifications, $timeout) {

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

    $('.ctn-playlist').hover(function() {
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

      var element = $('.tracks .track').eq(idx);
      var parent = element.parent();

      function isScrolledIntoView(element, container) {
        var containerHeight = container.height();
        var containerScrollTop = container.scrollTop();
        var containerScrollBottom = containerHeight + container.scrollTop();

        var elementTop = element.position().top;
        var elementBottom = elementTop + element.height();

        var topInView = elementTop >= -1;
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
  }];


  /**
   * Controller that handles the list of participants
   */
  var ParticipantListController = [ '$scope', function ParticipantListController($scope) {

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
  }];


  /**
   * Controller that handles joining a room
   */
  var JoinRoomController = [ '$scope', '$location', function($scope, $location) {

    var room = $scope.room;
    $scope.data = {
      joining: false
    };

    $scope.word = WORD_REGEXP;
    $scope.wordWithSpaces = WORD_WITH_SPACES_REGEXP;

    $scope.toggle = function(button) {
      var form;

      if ($scope._open) {

        form = $scope[$scope._open  + 'Form'];
        form.value.$setViewValue('');
        form.$setPristine();

        $scope.data[$scope._open] = null;
      }

      $scope._open = $scope.open == button ? null : button;
    };
    
    $scope.open = function(button) {
      return $scope._open == button;
    };

    $scope.join = function(name) {
      if ($scope.jumpForm && !$scope.joinForm.$valid) {
        return;
      }

      if ($scope.data.joining) {
        return;
      }

      $scope.data.joining = true;
      room.socket.emit('channelJoin', { participantName: name });
    };

    $scope.jump = function(differentRoom) {
      if (!$scope.jumpForm.$valid) {
        return;
      }

      $location.path('/room/' + differentRoom);
      $location.search('join', true);
    };

    function initFromSearch() {
      var search = $location.search(), 
          name = search.name, 
          join = search.join || name;

      angular.extend($scope.data, {
        name: name, 
        join: join
      });

      if (join) {
        $scope.toggle('join');  
      }

      if (name) {
        $scope.join(name);
      }
    }

    initFromSearch();
  }];


  var RouteConfig = function($routeProvider) {
    $routeProvider.when('/room/:id', {
      templateUrl: 'pages/room.html',
      controller: RoomController, 
      resolve: {
        room: [ '$rootScope', '$q', '$route', function($rootScope, $q, $route) {

          var roomId = $route.current.params.id;

          if (!WORD_REGEXP.test(roomId || '')) {
            $location.path('/');
            return $q.reject(new Error('invalid  room id'));
          }

          var room = $rootScope.room = {
            id: roomId,
            connected: false,
            participants: [],
            messages: [],
            tracks: []
          };

          return $q.when(room);
        }]
      }
    });
  };

  var timeFilter = function() {

    function leadingZero(number) {
      return number < 10 ? '0' + number : number;
    }

    function fmtTime(time) {
      time = time || 0;

      var h = Math.floor(time / 1000 / 60 / 60);
      var min =  Math.floor(time / 1000 / 60) % 60;
      var s = Math.floor(time / 1000) % 60;

      return (h ? (h + ':') : '') + leadingZero(min) + ':' + leadingZero(s);
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
      template: '<a ng-href="{{ track.permalink_url }}" tabindex="-1" target="_blank">{{ track.title}}</a>'
    };
  });

  module.directive('soundCloudUser', function() {
    return {
      scope: {
        user: '=soundCloudUser'
      },
      replace: true,
      template: '<a ng-href="{{ user.permalink_url }}" tabindex="-1" target="_blank">{{ user.username }}</a>'
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
        '  <div>' + 
        '    <a sound-cloud-user="track.user"></a>' +
        '    -' +
        '    <a sound-cloud-track="track"></a>' +
        '  </div>' + 
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
          })
          .focus(function(e) {
            if (attrs.ngFocus) {
              scope.$eval(attrs.ngFocus);
            }
          });
      }
    };
  });

  module.directive('currentTrack', function() {
    return {
      scope: {
        track: '=track',
        onSkip: '&',
        onStop: '&',
        onMute: '&'
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