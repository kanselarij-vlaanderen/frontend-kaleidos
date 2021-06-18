/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import utils from '../../../../selectors/utils.selectors';

context('Manage document tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should open the model behind manage document types', () => {
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageDocumentTypes).click();
    cy.get(utils.vlModal.dialogWindow).should('be.visible');
  });

  it('Should open the model behind manage document types and close it', () => {
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageDocumentTypes).click();
    cy.get(utils.vlModal.dialogWindow).should('be.visible');
    cy.get(utils.vlModal.close).click();
    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
  });
});
