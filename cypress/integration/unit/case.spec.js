/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

context('Create case as Admin user', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-abbreviated

  it('Create a case with short title', () => {
    cy.visit('/dossiers');
    const caseTitle = 'Dit is een dossier met een korte titel';
    cy.createCase(caseTitle).then((result) => {
      // automatic transition
      cy.url().should('contain', `dossiers/${result.caseId}/deeldossiers`);
    });
    // title is visible in header
    cy.get(cases.subcaseOverviewHeader.titleContainer).within(() => {
      cy.contains(caseTitle);
    });
    // subcase confidentiality should be false by default
    cy.addSubcase('Nota', 'Check confidential', '', null, null).then((result) => {
      cy.openSubcase(0);
      cy.get(route.subcaseOverview.confidentialityCheckBox).should('not.be.checked');
      cy.url().should('contain', `/deeldossiers/${result.subcaseId}`);
    });
  });

  it('Hitting cancel or close should hide the model and not remember state', () => {
    cy.visit('/dossiers');
    const shorttitle = 'Gibberish';
    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.shorttitle).type(shorttitle);
    cy.get(cases.newCase.cancel).click();
    // check if data is cleared after cancel
    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.shorttitle).should('not.contain', shorttitle);
    cy.get(cases.newCase.shorttitle).type(shorttitle);
    cy.get(utils.vlModal.close).click();
    // check if data is cleared after close
    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.shorttitle).should('not.contain', shorttitle);
  });

  it('Copy of confidential remark subcase should result in a new confidential remark subcase', () => {
    const newShortTitle = 'Dit is de korte titel';
    cy.visit('/dossiers');
    cy.createCase(newShortTitle);
    cy.addSubcase('Mededeling', newShortTitle, '', null, null);
    cy.openSubcase(0);
    cy.changeSubcaseAccessLevel(true);
    cy.get(route.subcaseOverview.confidentialityCheckBox).should('be.checked');
    // TODO-BUG, saving and then moving away too soon (going back, closing browser) could leave the editor open
    // ensure type is correct
    cy.get(cases.subcaseTitlesView.type).contains('Mededeling');
    cy.get(auk.tab.hierarchicalBack).click();
    // ensure type is the same after copy to new subcase
    // ensure confidentiality is the same after copy to new subcase
    cy.intercept('POST', '/subcases').as('createNewSubcase');
    cy.intercept('POST', '/submission-activities').as('createSubmission');
    cy.get(cases.subcaseOverviewHeader.createSubcase).click();
    cy.get(cases.newSubcase.clonePreviousSubcase).click();
    cy.wait('@createNewSubcase');
    cy.wait('@createSubmission');
    cy.openSubcase(0);
    cy.get(cases.subcaseTitlesView.type).contains('Mededeling');
    cy.get(route.subcaseOverview.confidentialityCheckBox).should('be.checked');
  });

  it('Een dossier maken zonder korte titel geeft een error', () => {
    cy.visit('/dossiers');

    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.save).click();
    cy.get(cases.newCase.shorttitleError).should('be.visible')
      .contains('Kijk het formulier na');
  });
});
