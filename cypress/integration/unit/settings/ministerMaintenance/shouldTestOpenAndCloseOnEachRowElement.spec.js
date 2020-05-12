/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import settings from "../../../../selectors/settings.selectors";
import toolbar from "../../../../selectors/toolbar.selectors";


context('Settings: Maintain ministers', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.visit('/');
    cy.route('/');
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
  });


  it('Should open the edit window on each element and close it', () => {
    cy.get(settings.addMinister).should('be.visible');
    // TODO all of this is data dependant, the default selection filters out old ministers so this list is blank with current data set
    // cy.get(sortableGroupSelector).should('be.visible');
    // cy.get(sortableGroupRowSelector).should('have.length',9);
    // for(let index = 0; index < 9; index++) {
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeEditSelector).eq(index).should('be.visible').click();
    //   cy.get(modalDialogCloseModalSelector).should('be.visible').click();
    // }
  });

});
