/* eslint-disable no-undef */
/// <reference types="Cypress" />

import {
  manageSignaturesSelector,
  manageSubcaseTypesSelector,
} from "../../../selectors/settings/settingsSelectors";
import {settingsSelector} from "../../../selectors/toolbar/toolbarSelectors";
import {modalDialogCloseModalSelector, modalDialogSelector} from "../../../selectors/models/modelSelectors";

context('Manage signatures tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should open the model behind manage signatures', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageSignaturesSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
  });

  it('Should open the model behind manage signatures and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageSignaturesSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get(modalDialogCloseModalSelector).click();
    cy.get(modalDialogSelector).should('not.be.visible');
  });
});
