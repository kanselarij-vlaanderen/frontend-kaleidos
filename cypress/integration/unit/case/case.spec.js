/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import cases from '../../../selectors/case.selectors';
import route from '../../../selectors/route.selectors';

context('Create case as Admin user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-abbreviated

  it('Create a case with confidentiality and short title', () => {
    cy.visit('/dossiers');
    const caseTitle = 'Dit is een dossier met confidentiality en een korte titel';
    cy.createCase(true, caseTitle).then((result) => {
      // automatic transition
      cy.url().should('contain', `dossiers/${result.caseId}/deeldossiers`);
    });
    // title is visible in header
    cy.get(cases.subcaseOverviewHeader.titleContainer).within(() => {
      cy.contains(caseTitle);
    });
    // case confidentiality is passed on to subcase
    cy.addSubcase('Nota', 'Check confidential', '', null, null);
    cy.openSubcase(0);
    cy.get(route.subcaseOverview.confidentialityCheckBox).should('be.checked');
  });

  it('Hitting cancel or close should hide the model and not remember state', () => {
    cy.visit('/dossiers');
    cy.get(cases.casesHeader.addCase).click();
    // TODO KAS-2693 type a title 'Gibberish'
    // toggle confidential
    cy.get(cases.newCase.cancel).click();
    // TODO KAS-2693 open modal again with addCase.
    // TODO search for 'Gibberish'
    // check if toggle is reset
    // TODO KAS-2693 type a title 'Gibberish'
    // toggle confidential
    // close modal
    // open modal again
    // TODO search for 'Gibberish'
    // check if toggle is reset
  });

  it('Copy of remark subcase should not result in a new remark subcase', () => {
    const newShortTitle = 'Dit is de korte titel';
    cy.route('POST', '/subcases').as('createNewSubcase');
    cy.visit('/dossiers');
    cy.createCase(false, newShortTitle);
    cy.addSubcase('Mededeling', newShortTitle, '', null, null);
    cy.openSubcase(0);
    // check confidentiality is not already checked when case is not confidential
    cy.get(route.subcaseOverview.confidentialityCheckBox).should('not.be.checked');
    // ensure type is correct
    cy.get(cases.subcaseTitlesView.type).contains('Mededeling');
    cy.navigateBack();
    // ensure type is the same after copy to new subcase
    cy.get(cases.subcaseOverviewHeader.createSubcase).click();
    cy.get(cases.newSubcase.clonePreviousSubcase).click();
    cy.wait('@createNewSubcase');
    cy.openSubcase(0);
    cy.get(cases.subcaseTitlesView.type).contains('Mededeling');
  });

  it('Een dossier maken zonder korte titel geeft een error', () => {
    cy.route('POST', '/subcases').as('addSubcase-createNewSubcase');
    cy.visit('/dossiers');

    cy.get(cases.casesHeader.addCase).click();
    // TODO KAS-2693 testselector
    cy.get('button').contains('Dossier aanmaken')
      .click();
    cy.get(cases.newCase.shorttitleError).should('be.visible')
      .contains('Kijk het formulier na');
  });
});
