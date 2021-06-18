/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import toolbar from '../../../../selectors/toolbar.selectors';
import utils from '../../../../selectors/utils.selectors';

context('Manage goverment field tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should open the model behind manage goverment fields', () => {
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageGovermentFields).click();
    cy.get(settings.manageGovernmentFields.add).should('be.visible');
  });

  it('Should open the model behind manage goverment fields and close it', () => {
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageGovermentFields).click();
    cy.get(utils.vlModal.dialogWindow).should('be.visible');
    cy.get(utils.vlModal.close).click();
    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
  });
});
