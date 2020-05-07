/*global cy, Cypress*/
/// <reference types="Cypress" />

import modal from '../../selectors/modal.selectors';
import actionModal from '../../selectors/action-modal.selectors';

Cypress.Commands.add('openActionModal', openActionModal);
Cypress.Commands.add('openSettingsModal', openSettingsModal);
Cypress.Commands.add('closeSettingsModal', closeSettingsModal);

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name openSettingsModal
 * @function
 * @param selector: selector that needs to be used.
 */
function openSettingsModal(selector) {
  cy.get(selector).click();
  cy.get(modal.baseModal.dialogWindow).should('be.visible');
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name closeSettingsModal
 * @function
 */
function closeSettingsModal() {
  cy.get(modal.baseModal.close).click();
  cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
}

/**
 * Open the action modal of the agenda page
 * @memberOf Cypress.Chainable#
 * @name openActionModal
 * @function
 */
function openActionModal() {

  const BE_VISIBLE = 'be.visible';

  cy.get(actionModal.showActionOptions).should('be.visible').click();
  cy.get(actionModal.navigatetosubcases).should(BE_VISIBLE);
  cy.get(actionModal.announcement).should(BE_VISIBLE);
  cy.get(actionModal.navigatetodecisions).should(BE_VISIBLE);
  cy.get(actionModal.navigatetonewsletter).should(BE_VISIBLE);
  cy.get(actionModal.navigatetonotes).should(BE_VISIBLE);
  cy.get(actionModal.navigatetopressagenda).should(BE_VISIBLE);
  cy.get(actionModal.toggleeditingsession).should(BE_VISIBLE);
  cy.get(actionModal.selectsignature).should(BE_VISIBLE);
  // cy.get(downloadddocuments).should(BE_VISIBLE); // TODO reenable when feature is fixed
  cy.get(actionModal.agendaHeaderDeleteAgenda).should(BE_VISIBLE);
}
