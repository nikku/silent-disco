ngDefine('disco', [
  'jquery',
  'module:ng',
  'module:ngSanitize:angular-sanitize',
  'module:ngRoute:angular-route',
  'module:ngTouch:angular-touch',
  'module:ngAnimate:angular-animate',
  'module:disco.pages:./pages/main',
  'module:disco.services:./services/main',
  'module:common.web.uri:web-common/services/uri',
  'module:ui.sortable:angular-ui/sortable',
  'module:ui.bootstrap:ui-bootstrap'
], function(module, $) {

  var DefaultController = [ '$scope', '$rootScope', function($scope, $rootScope) {

    $rootScope.$watch('room', function(newValue) {
      $scope.roomId = newValue ? newValue.id : null;
    });
  }];

  var NavigationController = [ '$scope', '$dialog', 'Sounds', 'Notifications', 
                      function ($scope, $dialog, Sounds, Notifications) {

    $scope.openAbout = function() {
      var dialog = $dialog.dialog({
        dialogFade: true, 
        backdropFade: true,
        templateUrl: 'common/about.html',
        controller: [ '$scope', 'dialog', function($scope, dialog) { 
          
          $scope.dialog = dialog;

          $scope.close = function() {
            dialog.close();
          };
        }]
      });

      dialog.open();
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
  }];

  var ModuleConfig = [ '$routeProvider', 'UriProvider', 
    function($routeProvider, UriProvider) {

    $routeProvider.otherwise({ redirectTo: '/room/lobby' });

    function getUri(id) {
      if (!id) {
        throw new Error("Uri base for " + id + " could not be resolved");
      }
      var uri = $("base").attr(id);

      if (!uri) { // not configured, try to use app host
        var hostname = document.location.hostname;
        var port = document.location.port.length > 0 ? ":"+document.location.port : ""
        return "ws://" + hostname + port + "/";
      }

      return uri;
    };

    UriProvider.replace('ws://', getUri("ws-base"));
  }];

  module
    .config(ModuleConfig)
    .controller('DefaultController', DefaultController)
    .controller('NavigationController', NavigationController);
});