ngDefine('disco', [
  'jquery',
  'module:ng',
  'module:ngResource:angular-resource',
  'module:ngSanitize:angular-sanitize',
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

  var NavigationController = function NavigationController($scope, Sounds, Notifications) {

    $scope.openAbout = function() {
      console.log($("#about-box"));

      $("#about-box").modal('show');
    };

    $scope.toggleMute = function () {
      Sounds.toggleMute();
    };

    $scope.isMuted = function() {
      return Sounds.muted();
    };

    $scope.toggleNotifications = function () {
      Notifications.toggle();
    };

    $scope.isNotificationsEnabled = function() {
      return Notifications.enabled();
    };
  };

  NavigationController.$inject = [ '$scope', 'Sounds', 'Notifications' ];

  var ModuleConfig = function($routeProvider, UriProvider) {
    $routeProvider.otherwise({ redirectTo: '/room/lobby' });

    function getUri(id) {
      if (!id) {
        throw new Error("Uri base for " + id + " could not be resolved");
      }
      var uri = $("base").attr(id);

      if (!uri) { // not configured, try to use app host
        var hostname = document.location.hostname;
        var port = document.location.port.length > 0 ? ":"+document.location.port : ""
        return "ws://"+hostname+port+"/";
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