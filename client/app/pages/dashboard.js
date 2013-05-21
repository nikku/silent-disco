ngDefine('disco.pages', [
  'angular'
], function(module, angular) {

  var Controller = function ($scope) {

  };

  Controller.$inject = [ '$scope' ];

  var RouteConfig = function($routeProvider) {
    $routeProvider.when('/dashboard', {
      templateUrl:'pages/dashboard.html',
      controller: Controller
    });
  };

  RouteConfig.$inject = ['$routeProvider'];

  module
    .config(RouteConfig);

});
