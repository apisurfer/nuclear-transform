module.exports = function(config) {
  config.set({
    basePath: './',
    browsers: ['PhantomJS'],
    frameworks: ['jasmine', 'browserify'],
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-browserify',
    ],
    files: [
      'tests/tests.js',
    ],
    preprocessors: {
      'tests/tests.js': ['browserify'],
    },
  });
};