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
import './commands/agenda-commands'
import './commands/authorizationAuthentication.commands'
import './commands/case-commands'
import './commands/document-commands'
import './commands/publication-commands'
import './commands/reset-database.commands'
import './commands/subcase-commands'
import './commands/utility-commands'
import dayjs from 'dayjs'

// support file
Cypress.dayjs = dayjs

// rdfa editor sometimes throws errors, but loads anyway
Cypress.on('uncaught:exception', (err) => {
  return !err.message.includes(`Cannot read property 'nodeType' of null`);
});
// when we try to set a variable like "isEditing" on a destroyed component
Cypress.on('uncaught:exception', (err) => {
  return !err.message.includes('calling set on destroyed object');
});
// workaround we used works but throws this error (is this rule still needed?)
Cypress.on('uncaught:exception', (err) => {
  return !err.message.includes('Cannot set property isSelected of #<DomainSelection> which has only a getter');s
});
// Approving agenda after showChanges throws this error, latest cypress is picking it up
Cypress.on('uncaught:exception', (err) => {
  return !err.message.includes(`TransitionAborted`);
});

Cypress.Commands.overwrite("type", (originalFn, subject, text, options) => {
  if(!options){
    options = {};
  }
  // default = 10
  // https://docs.cypress.io/api/commands/type#Arguments
  if(!options.delay){
    options.delay = 0;
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
