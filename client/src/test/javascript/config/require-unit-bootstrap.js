/**
 * test bootstrap script
 */

(function(document, window, require) {

  require({
    baseUrl: '/base/',

    paths: {
      'ngDefine' : 'main/webapp/assets/vendor/requirejs-angular-define/ngDefine',
      'jquery' : 'main/webapp/assets/vendor/jquery/jquery-1.10.2.min',
      'ui-bootstrap' : 'main/webapp/assets/vendor/ui-bootstrap/ui-bootstrap-tpls-0.5.0',
      'jquery-ui' : 'main/webapp/assets/vendor/jquery-ui/js/jquery-ui-1.10.3.custom',
      'bootstrap' : 'main/webapp/assets/vendor/bootstrap/js/bootstrap',
      'angular' : 'main/webapp/assets/vendor/angular/angular',
      'angular-animate' : 'main/webapp/assets/vendor/angular/angular-animate',
      'angular-route' : 'main/webapp/assets/vendor/angular/angular-route',
      'angular-sanitize' : 'main/webapp/assets/vendor/angular/angular-sanitize',
      'angular-mocks' : 'test/javascript/lib/angular/angular-mocks',
      'angular-touch' : 'main/webapp/assets/vendor/angular/angular-touch',
      'sound-cloud' : 'http://connect.soundcloud.com/sdk',
      'sound-cloud-client' : 'main/webapp/app/soundcloud/client'
    },
    shim: {
      'angular' : { deps: [ 'jquery' ], exports: 'angular' },
      'angular-animate': { deps: [ 'angular' ] },
      'angular-route': { deps: [ 'angular' ] },
      'angular-touch': { deps: [ 'angular' ] },
      'angular-mocks': { deps: [ 'angular' ] },
      'angular-sanitize': { deps: [ 'angular' ] },
      'sound-cloud': { exports: 'SC' },
      'jquery-ui' : { deps: [ 'jquery' ] },
      'ui-bootstrap' : { deps: [ 'jquery' ] }
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
    'ngDefine'
  ], function(angular) {
    
    window._jQuery = $;
    window._jqLiteMode = false;

    tests.unshift('/base/test/javascript/unit/testabilityPatch.js');

    require(tests, function() {
      window.__karma__.start();
    });
  });

})(document, window, require);