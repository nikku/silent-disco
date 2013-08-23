/**
 * bootstrap script of the cockpit application
 */

(function(document, require) {

  var PROD = false;
  var MINIFIED = PROD ? '.min' : '';
  var APP_NAME = 'disco';

  require({
    baseUrl: '../',
    paths: {
      'ngDefine' : 'assets/vendor/requirejs-angular-define/ngDefine',
      'jquery' : 'assets/vendor/jquery/jquery-1.9.1.min',
      'ui-bootstrap' : 'assets/vendor/ui-bootstrap/ui-bootstrap-tpls-0.5.0' + MINIFIED,
      'jquery-ui' : 'assets/vendor/jquery-ui/js/jquery-ui-1.10.3.custom' + MINIFIED,
      'bootstrap' : 'assets/vendor/bootstrap/js/bootstrap' + MINIFIED,
      'angular' : 'assets/vendor/angular/angular' + MINIFIED,
      'angular-animate' : 'assets/vendor/angular/angular-animate' + MINIFIED,
      'angular-route' : 'assets/vendor/angular/angular-route' + MINIFIED,
      'angular-sanitize' : 'assets/vendor/angular/angular-sanitize' + MINIFIED,
      'angular-touch' : 'assets/vendor/angular/angular-touch' + MINIFIED,
      'sound-cloud' : 'http://connect.soundcloud.com/sdk',
      'sound-cloud-client' : 'app/soundcloud/client'
    },
    shim: {
      'angular' : { deps: [ 'jquery' ], exports: 'angular' },
      'angular-animate': { deps: [ 'angular' ] },
      'angular-route': { deps: [ 'angular' ] },
      'angular-touch': { deps: [ 'angular' ] },
      'angular-sanitize': { deps: [ 'angular' ] },
      'sound-cloud': { exports: 'SC' },
      'jquery-ui' : { deps: [ 'jquery' ] },
      'ui-bootstrap' : { deps: [ 'jquery' ] }
    },
    packages: [
      { name: 'disco', location: 'app', main: 'disco' },
      { name: 'angular-ui', location: 'assets/vendor/angular-ui' },
      { name: 'web-common', location: 'assets/vendor/web-common' }
    ]
  });

  require([ 'angular', 'sound-cloud-client', 'ngDefine' ], function(angular) {

    require([ APP_NAME ], function() {
      angular.bootstrap(document, [ APP_NAME ]);
    });
  });

})(document, require);