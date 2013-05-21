ngDefine('disco', [
  'jquery',
  'module:ng',
  'module:ngResource',
  'module:disco.pages:./pages/main',
  'module:disco.services:./services/main',
  'module:disco.services:./services/sounds',
  'module:common.web.uri:web-common/services/uri',
  'module:common.web.if:web-common/directives/if',
  'module:common.web.scrollable:web-common/directives/scrollable'
], function(module, $) {

  var Controller = function ($scope, $rootScope, Sounds) {
    $scope.participants = [];

    $scope.mute = function () {
      Sounds.toggleMute();
    };

    $scope.pause = function () {
      Sounds.togglePause();
    };

    $scope.getParticipantInfo = function (participants) {
      angular.forEach(participants, function (name){
        SC.get("/users/"+name, function (user) {
          $scope.$apply(function () {
            $scope.participants.push(user);
          });
        });
      });
    };

    $scope.$on("channelJoined", function (event, data) {
      $scope.getParticipantInfo([data.name].concat(data.participants));
    });

    $scope.$on("participantJoined", function (event, data) {
      $scope.getParticipantInfo([data.name]);
    });

    $scope.addFavorites = function (participant) {
      SC.get("/users/"+participant.id+"/favorites", function (favorites) {
        $scope.$apply(function () {
          angular.forEach(favorites, function (fav) {
            $rootScope.$broadcast("addTrack", fav.permalink_url);
          });
        });
      });
    };

  };

  Controller.$inject = [ '$scope', '$rootScope', 'Sounds'];

  var ModuleConfig = function($routeProvider, UriProvider) {
    $routeProvider.otherwise({ redirectTo: '/room/lobby' });

    function getUri(id) {
      var uri = $("base").attr(id);
      if (!id) {
        throw new Error("Uri base for " + id + " could not be resolved");
      }

      return uri;
    }

    UriProvider.replace('ws://', getUri("ws-base"));
  };

  ModuleConfig.$inject = ['$routeProvider', 'UriProvider'];

  module
    .config(ModuleConfig)
    .controller('DefaultController', Controller);
});