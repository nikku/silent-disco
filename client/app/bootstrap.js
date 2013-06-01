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
      'domReady' : 'assets/vendor/require/domReady',
      'jquery' : 'assets/vendor/jquery/jquery-1.9.1.min',
      'jquery-ui' : 'assets/vendor/jquery-ui/js/jquery-ui-1.10.3.custom' + MINIFIED,
      'jquery-mousewheel' : 'assets/vendor/jquery/mousewheel/jquery.mousewheel' + MINIFIED,
      'bootstrap' : 'assets/vendor/bootstrap/js/bootstrap-modal' + MINIFIED,
      'angular' : 'assets/vendor/angular/angular' + MINIFIED,
      'angular-resource' : 'assets/vendor/angular/angular-resource' + MINIFIED,
      'angular-sanitize' : 'assets/vendor/angular/angular-sanitize' + MINIFIED,
      'angular-bootstrap' : 'assets/vendor/angular/angular-bootstrap' + MINIFIED,
      'sound-cloud' : 'http://connect.soundcloud.com/sdk',
      'sound-cloud-client' : 'app/soundcloud/client'
    },
    shim: {
      'angular' : { deps: [ 'jquery' ], exports: 'angular' },
      'angular-resource': { deps: [ 'angular' ] },
      'angular-bootstrap': { deps: [ 'angular' ] },
      'angular-sanitize': { deps: [ 'angular' ] },
      'sound-cloud': { exports: 'SC' },
      'jquery-mousewheel' : { deps: [ 'jquery' ] },
      'jquery-custom-scrollbar' : { deps: [ 'jquery-mousewheel' ] },
      'jquery-ui' : { deps: [ 'jquery' ] },
      'bootstrap' : { deps: [ 'jquery' ] }
    },
    packages: [
      { name: 'disco', location: 'app', main: 'disco' },
      { name: 'angular-ui', location: 'assets/vendor/angular-ui' },
      { name: 'web-common', location: 'assets/vendor/web-common' }
    ]
  });

  require([ 'angular', 'bootstrap', 'sound-cloud-client', 'ngDefine' ], function(angular, SC) {

    require([ APP_NAME, 'domReady!' ], function() {
      angular.bootstrap(document, [ APP_NAME ]);
    });
  });

})(document, require);