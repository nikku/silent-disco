ngDefine('disco.services', [
  'angular',
  'sound-cloud'
], function(module, angular, SC) {

  module.factory('Sounds', function($rootScope) {

    var service = function() { };

    angular.extend(service.prototype, {

      resolve: function(url, callback) {
        SC.get('/resolve', { url: url }, callback);
      },

      play: function(sound, callback) {

        var stream = sound.stream;
        var track = sound.track;

        var current = this.current;

        if (current) {
          this.stop();
        }

        stream.play();
        if (this.__muted) {
          stream.mute();
        }

        if (callback) {
          callback.apply(this, [ stream ]);
        }

        this.current = sound;
      },

      playTrack: function(track, callback) {
        var self = this;

        var options = {

          onloaded: function() { },

          whileplaying: function() {
            var stream = this;

            track.position = stream.position;

            try {
              $rootScope.$digest();
            } catch (e) { /* YEA */ }
          },

          onfinish: function() {
            $rootScope.$apply(function() {
              track.position = 0;
              track.status = null;

              $rootScope.$broadcast('sounds.finished', track);
            });
          },

          onstop: function() {
            track.position = 0;
            track.status = null;

            $rootScope.$broadcast('sounds.stopped', track);
          }
        };

        SC.stream("/tracks/" + track.id, options, function(stream) {
          self.play({ track: track, stream: stream }, callback);
        });
      },

      toggleMute: function() {
        this.__muted = !this.__muted;

        if (this.current) {
          if (this.__muted) {
            this.current.stream.mute();
          } else {
            this.current.stream.unmute();
          }
        }
      },

      muted: function() {
        return this.__muted;
      },

      isPlaying: function(track) {
        return !!(this.current && this.current.track.id == track.id);
      },

      stop: function() {
        var current = this.current;

        if (current) {
          var stream = current.stream;

          if (stream) {
            stream.stop();
            stream.destruct();
          }

          this.current = null;
        }
      }
    });

    return new service();
  });
});