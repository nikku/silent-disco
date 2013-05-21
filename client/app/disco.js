ngDefine('disco', [
  'jquery',
  'module:ng',
  'module:ngResource',
  'module:disco.pages:./pages/main',
  'module:disco.services:./services/main',
  'module:common.web.uri:web-common/services/uri',
  'module:common.web.if:web-common/directives/if',
  'module:common.web.scrollable:web-common/directives/scrollable'
], function(module, $) {

  var Controller = function ($scope) {

  };

  Controller.$inject = [ '$scope' ];

  var ModuleConfig = function($routeProvider, UriProvider) {
    $routeProvider.otherwise({ redirectTo: '/dashboard' });

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