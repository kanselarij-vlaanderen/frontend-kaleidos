/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />


import {
   manageIseCodesSelector
} from "../../../selectors/settings/settingsSelectors";
import {settingsSelector} from "../../../selectors/toolbar/toolbarSelectors";
import {modalDialogCloseModalSelector, modalDialogSelector} from "../../../selectors/models/modelSelectors";

context('Manage ISE codes tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should open the model behind manage ISE codes', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageIseCodesSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
  });

  it('Should open the model behind manage ISE codes and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageIseCodesSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get(modalDialogCloseModalSelector).click();
    cy.get(modalDialogSelector).should('not.be.visible');
  });
});
