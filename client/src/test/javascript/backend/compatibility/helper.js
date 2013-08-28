define(function() {

  //////////////// utilities ///////////////////
  
  function toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike, 0);
  }

  function log() {
    window.console.log.apply(window.console, toArray(arguments));
  }

  function expectAllEqual(array) {
    var reference = array[0];

    for (var i = 1; i < array.length; i++) {
      expect(array[i]).toEqual(reference);
    }
  }

  function collectResponses(sockets, message, transformFn) {

    var responses = new Array(sockets.length);

    for (var i = 0, s; !!(s = sockets[i]); i++) {
      (function(socket, idx) {
        socket.once(message, function(response) {
          responses[idx] = transformFn ? transformFn(response) : response;
        });
      })(s, i);
    }

    return responses;
  }

  function all(array, fn) {
    var match = true;

    for (var i = 0; i < array.length; i++) {
      if (!fn(array[i])) {
        match = false;
        break;
      }
    }

    return match;
  }

  //////////////// test helpers /////////////////
  
  function closeAll(sockets) {

    for (var i = 0, s; !!(s = sockets[i]); i++) {
      try {
        s.close();
      } catch (e) {
        log('WARN', 'Failed to close socket', e);
      }
    }
  }

  function createSocket(socket, location) {

    var s = socket.createSocket(location);
    s.debugging = true;

    var connected;

    runs(function() {

      s.on('__open', function() {
        connected = true;
      });
    });

    waitsFor(function() {
      return connected;
    }, "socket connected");

    return s;
  }

  function connectToRoom(socket, name, roomName, fn) {

    var connected;

    runs(function() {
      socket.emit('channelJoin', { participantName: name });
      socket.once('channelJoined', function(data) {

        // tracks, room and time are defined
        expect(data.tracks).toBeDefined();
        expect(data.room).toBeDefined();
        expect(data.room.name).toBe(roomName);
        expect(data.time).toBeDefined();

        if (fn) {
          fn(data);
        }
        connected = true;
      });
    });

    waitsFor(function() {
      return connected;
    }, "receive channelJoined on " + name);
  }

  function addTrack(socket, allSockets, track, fn) {

    var trackAdded;
    
    runs(function() {

      socket.emit('addTrack', { track: track });

      trackAdded = collectResponses(allSockets, 'trackAdded', function(result) { return result.track });
    });

    waitsFor(function() {
      return all(trackAdded, function(e) { return !!e; });
    }, "track added received on both sockets");

    runs(function() {
      var reference = trackAdded[0];
      
      expectAllEqual(trackAdded);

      if (fn) {
        fn(reference);
      }
    });
  }

  function startTrack(socket, allSockets, message, fn) {

    var trackStarted;

    var startTrack = message;

    trackStarted = collectResponses(allSockets, 'trackStarted');

    runs(function() {
      socket.emit('startTrack', startTrack);
    });

    waitsFor(function() {
      return all(trackStarted, function(e) { return !!e; });
    }, "track started received from all sockets");

    runs(function() {
      var reference = trackStarted[0];
      
      expectAllEqual(trackStarted);

      if (fn) {
        fn(reference);
      }
    });
  }

  function removeTrack(socket, allSockets, trackId, fn) {

    var trackRemoved;

    var removeTrack = { trackId: trackId };

    trackRemoved = collectResponses(allSockets, 'trackRemoved');

    runs(function() {
      socket.emit('removeTrack', removeTrack);
    });

    waitsFor(function() {
      return all(trackRemoved, function(e) { return !!e; });
    }, "track removed received from all sockets");

    runs(function() {
      var reference = trackRemoved[0];
      
      expectAllEqual(trackRemoved);

      if (fn) {
        fn(reference);
      }
    });
  }

  //////////////// external module definition /////////////////
  
  return {
    log: log,
    closeAll: closeAll,
    connectToRoom: connectToRoom, 
    addTrack: addTrack, 
    startTrack: startTrack,
    removeTrack: removeTrack,
    createSocket: createSocket
  };
});