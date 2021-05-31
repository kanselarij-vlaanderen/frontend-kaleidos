/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import toolbar from '../../../../selectors/toolbar.selectors';
import modal from '../../../../selectors/modal.selectors';

context('Manage alerts tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
  });

  it('Should open the model behind manage alerts', () => {
    cy.get(settings.manageAlerts).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.get(settings.manageAlerts).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(modal.baseModal.close).click();
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
  });
});
