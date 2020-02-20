// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

/*global Cypress*/
/// <reference types="Cypress" />

// Import commands.js using ES2015 syntax:
import './commands'
import './agenda-commands'
import './case-commands'
import './subcase-commands'
import './document-commands'
import './util/utility-commands'

Cypress.on('uncaught:exception', (err, runnable) => {
  return !err.message.includes('calling set on destroyed object')
});


// Alternatively you can use CommonJS syntax:
// require('./commands')
