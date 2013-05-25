ngDefine('disco', [
  'jquery',
  'module:ng',
  'module:ngResource:angular-resource',
  'module:bootstrap:angular-bootstrap',
  'module:disco.pages:./pages/main',
  'module:disco.services:./services/main',
  'module:disco.services:./services/sounds',
  'module:common.web.uri:web-common/services/uri',
  'module:common.web.if:web-common/directives/if',
  'module:ui.sortable:angular-ui/sortable'
], function(module, $) {

  var DefaultController = function DefaultController($scope) {

  };

  DefaultController.$inject = [ '$scope' ];

  var NavigationController = function NavigationController($scope, Sounds) {

    $scope.toggleMute = function () {
      Sounds.toggleMute();
    };

    $scope.isMuted = function() {
      return Sounds.muted();
    };
  };

  NavigationController.$inject = [ '$scope', 'Sounds'];

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
    .controller('DefaultController', DefaultController)
    .controller('NavigationController', NavigationController);
});