define(function() {

  //////////////// utilities ///////////////////
  
  function toArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike, 0);
  }

  function log() {
    window.console.log.apply(window.console, toArray(arguments));
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

    var trackAdded = new Array(allSockets.length);
    
    runs(function() {

      socket.emit('addTrack', { track: track });

      for (var i = 0, s; !!(s = allSockets[i]); i++) {
        (function(socket, idx) {
          socket.once('trackAdded', function(message) {
            trackAdded[idx] = message.track;
          });
        })(s, i);
      }
    });

    waitsFor(function() {
      var allAdded = true;

      for (var i = 0; i < allSockets.length; i++) {
        if (!trackAdded[i]) {
          allAdded = false;
          break;
        }
      }

      return allAdded;
    }, "track added received on both sockets");

    runs(function() {
      var reference = trackAdded[0];
      
      for (var i = 1; i < allSockets.length; i++) {
        expect(trackAdded[i]).toEqual(reference);
      }

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
    createSocket: createSocket
  };
});