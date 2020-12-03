/* eslint-disable */

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
import './commands/commands'
import './commands/agenda-commands'
import './commands/case-commands'
import './commands/subcase-commands'
import './commands/document-commands'
import './commands/utility-commands'
import './commands/datepicker.commands'
import './commands/modal.commands'
import './commands/select.commands'
import './commands/navigation.commands'
import './commands/authorizationAuthentication.commands'
import './commands/reset-database.commands'
import './commands/publication-commands'
import 'cypress-wait-until';

Cypress.on('uncaught:exception', (err) => {
  return !err.message.includes('calling set on destroyed object')
});

Cypress.Commands.overwrite("type", (originalFn, subject, text, options) => {
  if(!options){
    options = {};
  }
  if(!options.delay){
    options.delay = 1;
  }
  return originalFn(subject, text, options);
});



// workaround for issue DOES NOT WORK!!
// CypressError: Timed out after waiting '60000ms' for your remote page to load.
// Your page did not fire its 'load' event within '60000ms'.
Cypress.on('window:before:load', function (win) {
  const original = win.EventTarget.prototype.addEventListener
  win.EventTarget.prototype.addEventListener = function () {
    if (arguments && arguments[0] === 'beforeunload') {
      return
    }
    return original.apply(this, arguments)
  }

  Object.defineProperty(win, 'onbeforeunload', {
    get: function () { },
    set: function () { }
  })
})

// Alternatively you can use CommonJS syntax:
// require('./commands')
