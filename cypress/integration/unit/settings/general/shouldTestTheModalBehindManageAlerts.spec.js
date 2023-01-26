/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import utils from '../../../../selectors/utils.selectors';
import auk from '../../../../selectors/auk.selectors';

context('Manage alerts tests', () => {
  beforeEach(() => {
    cy.login('Admin');
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen');
  });

  it('Should open the model behind manage alerts', () => {
    cy.get(settings.overview.manageAlerts).click();
    cy.get(auk.auModal.container).should('be.visible')
      .should('contain', 'Systeemberichten beheer');
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.get(settings.overview.manageAlerts).click();
    cy.get(auk.auModal.container).should('be.visible')
      .should('contain', 'Systeemberichten beheer');
    cy.get(auk.auModal.header.close).click();
    cy.get(auk.auModal.container).should('not.exist');
  });
});
