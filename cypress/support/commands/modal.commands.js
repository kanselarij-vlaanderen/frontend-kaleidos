/* global cy, Cypress */
// / <reference types="Cypress" />

import modal from '../../selectors/modal.selectors';

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
  cy.get(modal.baseModal.dialogWindow).should('be.visible');
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
  cy.get(modal.baseModal.close).click();
  cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
  cy.log('/closeSettingsModal');
}

Cypress.Commands.add('openSettingsModal', openSettingsModal);
Cypress.Commands.add('closeSettingsModal', closeSettingsModal);
