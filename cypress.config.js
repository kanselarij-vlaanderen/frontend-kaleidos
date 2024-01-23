/* global require, module */

const { defineConfig } = require('cypress')

module.exports = defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000,
  requestTimeout: 20000,
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
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:4200',
  },
})
