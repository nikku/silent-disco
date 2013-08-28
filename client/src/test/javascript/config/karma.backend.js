module.exports = function(config) {
  config.set({
    // base path, that will be used to
    // resolve files and exclude

    // we use /silent-disco/client/src
    basePath: '../../../',
    frameworks: ['jasmine', 'requirejs' ],

    files: [
      { pattern: 'main/webapp/**/*.js', included: false },
      { pattern: 'test/javascript/backend/**/*.js', included: false },
      { pattern: 'test/javascript/lib/**/*.js', included: false },
      { pattern: 'test/javascript/unit/testabilityPatch.js', included: false },

      'test/javascript/config/require-unit-bootstrap.js'
    ],

    browsers: ['Chrome', 'Firefox'], // 'Chrome', 'Firefox', 'PhantomJS'

    autoWatch: true,

    junitReporter: {
      outputFile: '../../../../target/failsafe-reports/js-unit.xml',
      suite: 'backend'
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-requirejs'
    ]
  });
};