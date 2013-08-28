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

    it("should pass basic tests", inject(function(socket) {


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
        connectToRoom(socket1, 'socket1', ROOM_NAME, function(roomData) {
          var participants = roomData.participants, 
              tracks = roomData.tracks,
              room = roomData.room,
              time = roomData.time;

          // room participants exclude new member
          expect(participants).toBeDefined();
          expect(participants.length).toBe(0);
        });
      });

      runs(function() {
        connectToRoom(socket2, 'socket2', ROOM_NAME, function(roomData) {
          var participants = roomData.participants, 
              tracks = roomData.tracks,
              room = roomData.room,
              time = roomData.time;

          // room participants exclude new member
          // and include previously connected participant
          expect(participants).toBeDefined();
          expect(participants.length).toBe(1);
          expect(participants[0].name).toBe('socket1');
        });
      });


      /////////////// propagation of add track ///////////////////

      var track1Id, track2Id;

      ////// add first track ///////

      runs(function() {

        addTrack(socket1, [socket1, socket2], TRACK_1, function(track) {

          // update some fields so that equality works
          TRACK_1.trackId = track.trackId;
          TRACK_1.added = track.added;
          TRACK_1.roomName = track.roomName;

          // expect equality
          expect(track).toEqual(TRACK_1);

          expect(track.trackId).toBeDefined();

          track1Id = track.trackId;
        });
      });

      ////// add second track ///////

      runs(function() {
        addTrack(socket2, [socket1, socket2], TRACK_2, function(track) {
          
          // update some fields so that equality works
          TRACK_2.trackId = track.trackId;
          TRACK_2.added = track.added;
          TRACK_2.roomName = track.roomName;

          // expect equality
          expect(track).toEqual(TRACK_2);

          expect(track.trackId).toBeDefined();
          
          track2Id = track.trackId;
        });
      });


      /////////////// start track1 ///////////////////

      var startTrackPosition;

      runs(function() {

        startTrackPosition = { trackId: TRACK_2.trackId, position: 2000 };
        
        startTrack(socket1, [ socket2 ], startTrackPosition, function(data) {
          expect(data.trackId).toEqual(startTrackPosition.trackId);
          expect(data.position).toEqual(startTrackPosition.position);
        });
      });

      /////////////// third participant joins ///////////////////

      var participant3Id;

      runs(function() {

        var participantJoined1, participantJoined2;

        /////// expect particpant joined on socket 1 ////////

        socket1.once('participantJoined', function(data) {
          expect(data.user.name).toBe('socket3');
          participantJoined1 = data.user.id;
        });

        /////// expect particpant joined on socket 1 ////////
        
        socket2.once('participantJoined', function(data) {
          expect(data.user.name).toBe('socket3');
          participantJoined2 = data.user.id;
        });
        
        connectToRoom(socket3, 'socket3', ROOM_NAME, function(roomData) {
          var participants = roomData.participants, 
              tracks = roomData.tracks,
              room = roomData.room,
              time = roomData.time;

          // two tracks added
          expect(tracks.length).toBe(2);

          // previously added tracks are contained
          expect(tracks).toContain(TRACK_1);
          expect(tracks).toContain(TRACK_2);

          // room participants exclude new member, 
          // include two old members
          expect(participants).toBeDefined();
          expect(participants.length).toBe(2);

          // joined playing room ... expect position to be send
          expect(room.position.position).toBe(startTrackPosition.position);
          expect(room.position.trackId).toBe(startTrackPosition.trackId);
          expect(room.position.status).toBe("PLAYING");
        });

        /////// particpantsJoined received? ////////
        
        waitsFor(function() {
          return participantJoined1 && participantJoined2;
        }, "participantJoined received from connected sockets");

        runs(function() {
          expect(participantJoined1).toEqual(participantJoined2);
          participant3Id = participantJoined1;
        })
      });


      /////////////// third participant leaves ///////////////////

      runs(function() {

        var participantLeft1, participantLeft3;

        /////// expect participant left on socket1 ///////
        
        socket1.once('participantLeft', function(data) {
          expect(data.userId).toEqual(participant3Id);
          participantLeft1 = data.userId;
        });
        
        /////// expect participant left on socket2 ///////
                
        socket2.once('participantLeft', function(data) {
          expect(data.userId).toEqual(participant3Id);
          participantLeft2 = data.userId;
        });

        socket3.close();

        waitsFor(function() {
          return participantLeft1 && participantLeft2;
        }, "participantLeft received from remaining connected sockets")
      });

      runs(function() {
        console.log("END");
      });
    }));
  });
});