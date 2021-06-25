/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import cases from '../../../selectors/case.selectors';
import route from '../../../selectors/route.selectors';
import utils from '../../../selectors/utils.selectors';

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
    const shorttitle = 'Gibberish';
    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.shorttitle).type(shorttitle);
    cy.get(cases.newCase.toggleConfidential).click();
    cy.get(cases.newCase.cancel).click();
    // check if data is cleared after cancel
    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.shorttitle).should('not.contain', shorttitle);
    cy.get(cases.newCase.toggleConfidential).within(() => {
      cy.get(utils.vlToggle.input).should('not.be', 'checked');
    });
    cy.get(cases.newCase.shorttitle).type(shorttitle);
    cy.get(cases.newCase.toggleConfidential).click();
    cy.get(utils.vlModal.close).click();
    // check if data is cleared after close
    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.shorttitle).should('not.contain', shorttitle);
    cy.get(cases.newCase.toggleConfidential).within(() => {
      cy.get(utils.vlToggle.input).should('not.be', 'checked');
    });
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
    cy.visit('/dossiers');

    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.save).click();
    cy.get(cases.newCase.shorttitleError).should('be.visible')
      .contains('Kijk het formulier na');
  });
});
