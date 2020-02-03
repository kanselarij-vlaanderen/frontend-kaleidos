/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import {
  manageAlertsSelector
  } from "../../../selectors/settings/settingsSelectors";
import {settingsSelector} from "../../../selectors/toolbar/toolbarSelectors";
import {modalDialogCloseModalSelector, modalDialogSelector} from "../../../selectors/models/modelSelectors";

context('Manage alerts tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/');
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
  });

  it('Should open the model behind manage alerts', () => {
    cy.get(manageAlertsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.get(manageAlertsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get(modalDialogCloseModalSelector).click();
    cy.get(modalDialogSelector).should('not.be.visible');
  });
});
