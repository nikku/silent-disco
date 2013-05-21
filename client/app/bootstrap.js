/**
 * bootstrap script of the cockpit application
 */

(function(document, require) {

  var APP_NAME = 'disco';

  require({
    baseUrl: '../',
    paths: {
      'ngDefine' : 'assets/vendor/requirejs-angular-define/ngDefine',
      'domReady' : 'assets/vendor/require/domReady',
      'jquery' : 'assets/vendor/jquery/jquery-1.9.1.min',
      'jquery-mousewheel' : 'assets/vendor/jquery/mousewheel/jquery.mousewheel',
      'jquery-custom-scrollbar' : 'assets/vendor/jquery/custom-scrollbar/js/jquery.mCustomScrollbar',
      'angular' : 'assets/vendor/angular/angular',
      'angular-resource' : 'assets/vendor/angular/angular-resource',
      'sound-cloud' : 'http://connect.soundcloud.com/sdk',
      'sound-cloud-client' : 'app/soundcloud/client'
    },
    shim: {
      'angular' : { deps: [ 'jquery' ], exports: 'angular' },
      'angular-resource': { deps: [ 'angular' ] },
      'sound-cloud': { exports: 'SC' },
      'jquery-mousewheel' : { deps: [ 'jquery' ] },
      'jquery-custom-scrollbar' : { deps: [ 'jquery-mousewheel' ] }
    },
    packages: [
      { name: 'disco', location: 'app', main: 'disco' },
      { name: 'web-common', location: 'assets/vendor/web-common' }
    ]
  });

  require([ 'angular', 'sound-cloud-client', 'angular-resource', 'ngDefine' ], function(angular, SC) {

    require([ APP_NAME, 'domReady!' ], function() {
      angular.bootstrap(document, [ APP_NAME ]);
    });
  });

})(document, require);