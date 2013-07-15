/**
 * test bootstrap script
 */

(function(document, window, require) {

  require({
    baseUrl: '/base/',

    paths: {
      'ngDefine' : 'main/webapp/assets/vendor/requirejs-angular-define/ngDefine',
      'domReady' : 'main/webapp/assets/vendor/require/domReady',
      'jquery' : 'main/webapp/assets/vendor/jquery/jquery-1.9.1.min',
      'jquery-ui' : 'main/webapp/assets/vendor/jquery-ui/js/jquery-ui-1.10.3.custom',
      'bootstrap' : 'main/webapp/assets/vendor/bootstrap/js/bootstrap-modal',
      'angular' : 'main/webapp/assets/vendor/angular/angular',
      'angular-resource' : 'main/webapp/assets/vendor/angular/angular-resource',
      'angular-sanitize' : 'main/webapp/assets/vendor/angular/angular-sanitize',
      'angular-bootstrap' : 'main/webapp/assets/vendor/angular/angular-bootstrap',
      'angular-mocks': 'test/javascript/lib/angular/angular-mocks',
      'sound-cloud' : 'http://connect.soundcloud.com/sdk',
      'sound-cloud-client' : 'main/webapp/app/soundcloud/client'
    },
    shim: {
      'angular' : { deps: [ 'jquery' ], exports: 'angular' },
      'angular-resource': { deps: [ 'angular' ] },
      'angular-bootstrap': { deps: [ 'angular' ] },
      'angular-sanitize': { deps: [ 'angular' ] },
      'angular-mocks': { deps: [ 'angular' ] },
      'sound-cloud': { exports: 'SC' },
      'jquery-ui' : { deps: [ 'jquery' ] },
      'bootstrap' : { deps: [ 'jquery' ] }
    },
    packages: [
      { name: 'disco', location: 'main/webapp/app', main: 'disco' },
      { name: 'angular-ui', location: 'main/webapp/assets/vendor/angular-ui' },
      { name: 'web-common', location: 'main/webapp/assets/vendor/web-common' }
    ]
  });

  var tests = [];
  for (var file in window.__karma__.files) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }

  require([
    'angular',
    'angular-mocks',
    'ngDefine',
    'bootstrap',
    'sound-cloud-client' 
  ], function(angular) {

    window._jQuery = $;
    window._jqLiteMode = false;

    tests.unshift('/base/test/javascript/unit/testabilityPatch.js');

    require(tests, function() {
      window.__karma__.start();
    });
  });

})(document, window, require);