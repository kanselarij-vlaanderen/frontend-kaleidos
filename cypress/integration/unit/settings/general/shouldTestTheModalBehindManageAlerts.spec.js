/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import utils from '../../../../selectors/utils.selectors';

context('Manage alerts tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
  });

  it('Should open the model behind manage alerts', () => {
    cy.get(settings.overview.manageAlerts).click();
    cy.get(utils.vlModal.dialogWindow).should('be.visible')
      .should('contain', 'Systeemberichten beheer');
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.get(settings.overview.manageAlerts).click();
    cy.get(utils.vlModal.dialogWindow).should('be.visible')
      .should('contain', 'Systeemberichten beheer');
    cy.get(utils.vlModal.close).click();
    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
  });
});
