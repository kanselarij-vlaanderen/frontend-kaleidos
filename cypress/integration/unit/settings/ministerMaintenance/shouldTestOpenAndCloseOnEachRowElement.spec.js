/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />


import {
  manageMinistersSelector,
  mandateeEditSelector,
  ministerAddSelector,
  sortableGroupRowSelector,
  sortableGroupSelector
} from "../../../../selectors/settings/settingsSelectors";
import {modalDialogCloseModalSelector} from "../../../../selectors/models/modelSelectors";
import {settingsSelector} from "../../../../selectors/toolbar/toolbarSelectors";


context('Settings: Maintain ministers', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/');
    cy.get(settingsSelector).click();
    cy.get(manageMinistersSelector).click();
    cy.url().should('include','instellingen/ministers');
  });


  it('Should open the edit window on each element and close it', () => {
    cy.get(ministerAddSelector).should('be.visible');
    cy.get(sortableGroupSelector).should('be.visible');
    cy.get(sortableGroupRowSelector).should('have.length',9);
    for(let index = 0; index < 9; index++) {
      cy.get(sortableGroupRowSelector).eq(index).get(mandateeEditSelector).eq(index).should('be.visible').click();
      cy.get(modalDialogCloseModalSelector).should('be.visible').click();
    }
  });

});
