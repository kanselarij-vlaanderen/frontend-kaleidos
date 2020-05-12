/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import settings from "../../../../selectors/settings.selectors";
import toolbar from "../../../../selectors/toolbar.selectors";
import modal from "../../../../selectors/modal.selectors";

context('Manage Sub codes tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.visit('/');
  });

  it('Should open the model behind manage subcase types', () => {
    cy.get(toolbar.settings).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(settings.manageSubcaseTypes).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
  });

  it('Should open the model behind manage subcase types and close it', () => {
    cy.get(toolbar.settings).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(settings.manageSubcaseTypes).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(modal.baseModal.close).click();
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
  });
});
