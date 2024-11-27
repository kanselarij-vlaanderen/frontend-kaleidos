/* global require, module */

const { defineConfig } = require('cypress')
const browserify = require('@cypress/browserify-preprocessor')

module.exports = defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 60000,
  requestTimeout: 60000,
  env: {
    KALEIDOS_PROJECT: '../kaleidos-project',
    CI: false,
  },
  viewportHeight: 720,
  viewportWidth: 1280,
  video: false,
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 10,
  pageLoadTimeout: 1200000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      const options = {
        crypto: require.resolve('crypto'),
      }
      return require('./cypress/plugins/index.js')(on('file:preprocessor', browserify(options)), config)
    },
    baseUrl: 'http://localhost:4200',
    testIsolation: true, // default true,
  },
})
