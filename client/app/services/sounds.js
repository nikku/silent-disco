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

      play: function(track, callback) {
        var self = this;

        var options = {

          onloaded: function() {
            var sound = this;

            $rootScope.$apply(function() {
              track.duration = sound.duration;
            });
          },

          whileplaying: function() {
            var sound = this;

            $rootScope.$apply(function() {
              track.position = sound.position;
            });
          },
          onfinish: function() {
            console.log("finished playing ", this);
            $rootScope.$apply(function() {
              track.position = 0;
              track.status = null;
            });
          },
          onstop: function() {
            console.log("stopped playing ", this);
            $rootScope.$apply(function() {
              track.position = 0;
              track.status = null;
            });
          }
        };

        SC.stream("/tracks/" + track.id, options, function(sound) {
          self.stop();

          sound.play();

          self.playing = { track: track, sound: sound };

          if (callback) {
            callback.apply(self, [ sound ]);
          }
          $rootScope.$apply();
        });
      },

      toggleMute: function() {
        if (this.playing) {
          if (this.playing.muted == true) {
            this.playing.sound.unmute();
            this.playing.muted = false;
          } else {
            this.playing.sound.mute();
            this.playing.muted = true;
          }
        }
      },

      togglePause: function() {
        if (this.playing) {
          if (this.playing.paused == true) {
            this.playing.sound.play();
            this.playing.paused = false;
          } else {
            this.playing.sound.pause();
            this.playing.paused = true;
          }
        }
      },

      stop: function() {
        var playing = this.playing;

        if (playing) {
          var sound = playing.sound;

          sound.stop();
          sound.destruct();

          this.playing = null;
        }
      }
    });

    return new service();
  });
});