/* global cy, Cypress */
/// <reference types="Cypress" />
import 'cypress-file-upload';

Cypress.Commands.add('verifyAlertSuccess', verifyAlertSuccess);
/**
 * @description Watch if the verification alert popup appears on successful network calls
 * use in a .then() of the sent request
 * @name verifyAlertSuccess
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} tabName The name of the tab to click on, case sensitive
 */
function verifyAlertSuccess() {
  cy.log('verifyAlertSuccess');
  cy.get('.toasts-container', { timeout: 12000 }).contains('Gelukt').should('be.visible');
  cy.log('/verifyAlertSuccess');
}
