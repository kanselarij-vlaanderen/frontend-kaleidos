/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import settings from "../../../../selectors/settings.selectors";
import toolbar from "../../../../selectors/toolbar.selectors";
import modal from "../../../../selectors/modal.selectors";

context('Manage ISE codes tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should open the model behind manage ISE codes', () => {
    cy.get(toolbar.settings).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(settings.manageIseCodes).click();
    cy.get(modal.modalManager.add).should('be.visible');
  });

  it('Should open the model behind manage ISE codes and close it', () => {
    cy.get(toolbar.settings).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(settings.manageIseCodes).click();
    cy.wait(200);
    cy.get(modal.modalManager.add).should('be.visible');
    cy.get(modal.modalManager.close).click();
    cy.get(modal.modalManager.add).should('not.be.visible');
  });
});
