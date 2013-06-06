ngDefine('disco.services', [
  'angular',
  'sound-cloud'
], function(module, angular, SC) {

  module.factory('Sounds', function($rootScope, $timeout) {

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
        } else {
          stream.unmute();
        }

        this.current = sound;

        if (callback) {
          callback.apply(this, [ stream ]);
        }
      },

      playTrack: function(track, position, callback) {
        var self = this;
        var current = this.current;

        if (current && current.stream && current.track == track) {
          this.setPosition(track, position, callback);
        } else {
          this.loadAndPlayTrack(track, function(stream) {
            self.setPosition(track, position, callback);
          });
        }
      },

      /**
       * Sets position of a stream, taking into account the preloading 
       * time that may be required.
       */
      setPosition: function(track, position, callback) {
        var self = this,
            current = this.current,
            stream = current ? current.stream : null;

        // set track.loading to the position to be loaded
        // and check regularily whether the position is still up to date 
        // and loading should continue

        function changed() {
          return current != self.current ||
                 position != track.loading;
        }

        function done() {
          track.loading = null;

          if (!self.__muted) {
            stream.unmute();
          }

          if (callback) {
            callback.apply(null, [ stream ]);
          }
        }

        // save target position to recognize changes
        // (parallel skips)
        track.loading = position;

        if (changed()) {
          return;
        }

        // mute stream while loading
        stream.mute();

        if (!position) {
          done();
        } else {
          skipTo(position);
        }

        function skipTo(pos) {

          if (changed()) {
            return;
          }

          stream.setPosition(pos);

          if (Math.abs(stream.position - pos) < 3000) {
            done();
          } else {
            $timeout(function() {
              skipTo(pos + 2000);
            }, 2000);
          }
        }
      },

      loadAndPlayTrack: function(track, callback) {
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