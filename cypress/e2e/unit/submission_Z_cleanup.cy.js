/* global context, it, cy*/

// / <reference types="Cypress" />
import settings from '../../selectors/settings.selectors';


context('cleanup mandatees from organisation', () => {
  it('remove mandatees from organisation', () => {
    cy.login('Admin');
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    // unlink first mandatee
    cy.intercept('PATCH', '/user-organizations/**').as('patchorgs');
    cy.get(settings.organization.technicalInfo.row.unlinkMandatee)
      .eq(0)
      .click();
    cy.get(settings.organization.confirm.unlinkMandatee)
      .click()
      .wait('@patchorgs');
    // unlink second mandatee
    // cy.get(settings.organization.technicalInfo.row.unlinkMandatee).eq(0)
    //   .click();
    // cy.get(settings.organization.confirm.unlinkMandatee).click()
    //   .wait('@patchorgs');
    // cy.get(settings.organization.technicalInfo.row.mandatee).should('not.exist');
    cy.logout();
  });
});
