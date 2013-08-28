define([
  'angular',
  './helper.js',
  'disco/services/socket'
], function(angular, helper) {

  // extend current context with helper methods
  angular.extend(this, helper);

  var ROOM_NAME = "test-room-" + Math.random();
  var WEBSOCKET_LOCATION = "localhost:8080/" + ROOM_NAME;
  
  log("Using " + WEBSOCKET_LOCATION + " as backend websocket endpoint");

  var TRACK_1 = {
    id: '111', 
    artwork_url: '', 
    permalink_url: '', 
    title: '111', 
    duration: 60000, 
    user: { username: 'aaa', permalink_url: '' }
  };

  var TRACK_2 = { 
    id: '222', 
    artwork_url: '', 
    permalink_url: '', 
    title: '222', 
    duration: 40000, 
    user: { username: 'bbb', permalink_url: '' }
  };

  var TRACK_3 = { 
    id: '333', 
    artwork_url: '', 
    permalink_url: '', 
    title: '333', 
    duration: 30000, 
    user: { username: 'ccc', permalink_url: '' }
  };

  return describe("disco", function() {

    var socket1, socket2, socket3;

    // configure test module
    beforeEach(function () {
      angular.module('testmodule', [ 'disco.services.socket' ]);
    });

    // load test module
    beforeEach(module('testmodule'));
    
    // close sockets after end of test
    afterEach(inject(function(socket) {
      closeAll([socket1, socket2, socket3]);
    }));

    it("should pass move tests", inject(function(socket) {


      /////////////// create all sockets ///////////////////

      runs(function() {
        socket1 = createSocket(socket, WEBSOCKET_LOCATION);
      });

      runs(function() {
        socket2 = createSocket(socket, WEBSOCKET_LOCATION);
      });

      runs(function() {
        socket3 = createSocket(socket, WEBSOCKET_LOCATION);
      });


      /////////////// connect sockets to room ///////////////////

      runs(function() {
        connectToRoom(socket1, 'socket1', ROOM_NAME);
      });

      runs(function() {
        connectToRoom(socket2, 'socket2', ROOM_NAME);
      });


      /////////////// add test tracks ///////////////

      runs(function() {
        addTrack(socket1, [socket1, socket2], TRACK_1, function(track) { TRACK_1 = track; });
        addTrack(socket1, [socket1, socket2], TRACK_2, function(track) { TRACK_2 = track; });
        addTrack(socket1, [socket1, socket2], TRACK_3, function(track) { TRACK_3 = track; });
      });


      /////////////// reverse track positions ///////////////////

      var moveTrackPosition;

      //// move track1 : 0 -> 1 ////
      
      runs(function() {

        var trackMoved;

        moveTrackPosition = { trackId: TRACK_1.trackId, from: { position: 0 }, to: { position: 1 } };

        socket2.once('trackMoved', function(data) {
          expect(data.trackId).toEqual(TRACK_1.trackId);

          expect(data.user).toBeDefined();
          expect(data.to).toBeDefined();
          expect(data.to.position).toEqual(1);

          if (data.undo) {
            log('INFO', 'Backend implementation supports UNDO of move');
          }

          trackMoved = data;
        });

        runs(function() {
          socket1.emit('moveTrack', moveTrackPosition);
        });

        waitsFor(function() {
          return trackMoved;
        }, "trackMoved to be received");
      });


      //// move track3 : 2 -> 0 ////
      
      runs(function() {

        var trackMoved;

        moveTrackPosition = { trackId: TRACK_3.trackId, from: { position: 2 }, to: { position: 0 } };

        socket1.once('trackMoved', function(data) {
          expect(data.trackId).toEqual(TRACK_3.trackId);

          expect(data.user).toBeDefined();
          expect(data.to).toBeDefined();
          expect(data.to.position).toEqual(0);

          trackMoved = data;
        });

        runs(function() {
          socket2.emit('moveTrack', moveTrackPosition);
        });

        waitsFor(function() {
          return trackMoved;
        }, "trackMoved to be received");
      });


      /////////////// third participant joins ///////////////////

      ///// expected track order --> 3, 2, 1 ////
      
      runs(function() {
        
        var connectSuccess;

        connectToRoom(socket3, 'socket3', ROOM_NAME, function(roomData) {
          connectSuccess = true;

          var tracks = roomData.tracks;

          // three tracks added
          expect(tracks.length).toBe(3);

          // previously moved tracks are contained in the correct order
          expect(tracks[0]).toEqual(TRACK_3);
          expect(tracks[1]).toEqual(TRACK_2);
          expect(tracks[2]).toEqual(TRACK_1);
        });
      });

      runs(function() {
        console.log("END");
      });
    }));
  });
});