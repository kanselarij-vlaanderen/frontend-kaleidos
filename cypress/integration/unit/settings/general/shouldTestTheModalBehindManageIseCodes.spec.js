/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import utils from '../../../../selectors/utils.selectors';

context('Manage ISE codes tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should open the model behind manage ISE codes', () => {
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageIseCodes).click();
    cy.get(settings.manageIseCodes.add).should('be.visible');
  });

  it('Should open the model behind manage ISE codes and close it', () => {
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageIseCodes).click();
    cy.wait(200);
    cy.get(settings.manageIseCodes.add).should('be.visible');
    cy.get(utils.vlModal.close).click();
    cy.get(settings.manageIseCodes.add).should('not.be.visible');
  });
});
