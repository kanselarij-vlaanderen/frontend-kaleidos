/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import toolbar from '../../../../selectors/toolbar.selectors';
import modal from '../../../../selectors/modal.selectors';

context('Manage goverment field tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should open the model behind manage goverment fields', () => {
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageGovermentFields).click();
    cy.get(modal.manageInSettingsModal.add).should('be.visible');
  });

  it('Should open the model behind manage goverment fields and close it', () => {
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageGovermentFields).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(modal.baseModal.close).click();
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
  });
});
