/* global cy, Cypress */
// / <reference types="Cypress" />

import utils from '../../selectors/utils.selectors';

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name openSettingsModal
 * @function
 * @param selector: selector that needs to be used.
 */
function openSettingsModal(selector) {
  cy.log('openSettingsModal');
  cy.get(selector).click();
  cy.get(utils.vlModal.dialogWindow).should('be.visible');
  cy.log('/openSettingsModal');
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name closeSettingsModal
 * @function
 */
function closeSettingsModal() {
  cy.log('closeSettingsModal');
  cy.get(utils.vlModal.close).click();
  cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
  cy.log('/closeSettingsModal');
}

Cypress.Commands.add('openSettingsModal', openSettingsModal);
Cypress.Commands.add('closeSettingsModal', closeSettingsModal);
