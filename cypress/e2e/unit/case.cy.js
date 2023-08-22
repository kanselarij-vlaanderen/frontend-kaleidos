/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import route from '../../selectors/route.selectors';

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
    cy.get(auk.auModal.header.close).click();
    // check if data is cleared after close
    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.shorttitle).should('not.contain', shorttitle);
  });

  it('Copy of confidential remark subcase should result in a new confidential remark subcase', () => {
    const newShortTitle = 'Dit is de korte titel';
    cy.visit('/dossiers');
    cy.createCase(newShortTitle);
    cy.addSubcase('Mededeling', newShortTitle, '', null, null);
    cy.openSubcase(0, newShortTitle);
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

  it('Een dossier maken zonder korte titel kan niet', () => {
    cy.visit('/dossiers');

    cy.get(cases.casesHeader.addCase).click();
    cy.get(cases.newCase.save).should('be.disabled');
    cy.get(cases.newCase.shorttitle).type('Dossier X');
    cy.get(cases.newCase.save).should('not.be.disabled');
  });

  it('Archive and restore case', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    const caseTitle = `test verwijderen - ${randomInt}`;

    cy.visit('/dossiers');
    cy.createCase(caseTitle);
    cy.addSubcase();

    // archive case
    cy.visit('/dossiers');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle)
      .parents('tr')
      .as('currentRow');
    cy.get('@currentRow').find(route.casesOverview.row.actionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get('@currentRow').find(route.casesOverview.row.actions.archive)
      .forceClick();
    cy.intercept('PATCH', '/cases/**').as('patchCases1');
    cy.intercept('PATCH', '/subcases/**').as('patchSubcases1');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchCases1')
      .wait('@patchSubcases1');
    cy.get(auk.loader).should('not.exist');
    cy.get(route.casesOverview.row.caseTitle).should('not.contain', caseTitle);

    cy.get(route.casesOverview.showArchived)
      .parent()
      .click();
    cy.get(auk.loader).should('exist'); // page load
    cy.url().should('contain', '?toon_enkel_gearchiveerd=true');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle);

    // restore case
    cy.get('@currentRow').find(route.casesOverview.row.actionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.intercept('PATCH', '/cases/**').as('patchCases2');
    cy.intercept('PATCH', '/subcases/**').as('patchSubcases2');
    cy.get('@currentRow').find(route.casesOverview.row.actions.archive)
      .forceClick()
      .wait('@patchCases2')
      .wait('@patchSubcases2');

    cy.get(route.casesOverview.showArchived)
      .parent()
      .click();
    cy.get(auk.loader).should('exist'); // page load
    cy.url().should('not.contain', '?toon_enkel_gearchiveerd=true');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle);
  });

  it('should change the short title', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    const caseTitle = `test change shorttitle - ${randomInt}`;
    const caseTitleChanged = `test changed shorttitle for test - ${randomInt}`;
    const caseTitleChangedWithSpaces = ` test changed shorttitle for test with trailing and leading spaces - ${randomInt} `;

    cy.visit('/dossiers');
    cy.createCase(caseTitle);
    cy.visit('/dossiers');

    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle)
      .parents('tr')
      .as('currentRow');
    cy.get('@currentRow').find(route.casesOverview.row.actionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get('@currentRow').find(route.casesOverview.row.actions.edit)
      .forceClick();

    // ** overview **

    // check empty title field not allowed
    cy.get(cases.editCase.shortTitle).should('have.value', caseTitle);
    cy.get(cases.editCase.save).should('not.be.disabled');
    cy.get(cases.editCase.shortTitle).clear();
    cy.get(cases.editCase.save).should('be.disabled');
    // check only space not allowed
    cy.get(cases.editCase.shortTitle).type('      ');
    cy.get(cases.editCase.save).should('be.disabled');

    // change title and cancel
    cy.get(cases.editCase.shortTitle).clear()
      .type(caseTitleChanged);
    cy.get(auk.modal.footer.cancel).click();
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle);

    // change title and save
    cy.get('@currentRow').find(route.casesOverview.row.actionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get('@currentRow').find(route.casesOverview.row.actions.edit)
      .forceClick();
    cy.get(cases.editCase.shortTitle).clear()
      .type(caseTitleChanged);
    cy.intercept('PATCH', '/cases/**').as('patchCase1');
    cy.get(cases.editCase.save).click()
      .wait('@patchCase1');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitleChanged)
      .parents('tr')
      .as('currentRow');

    // change title with spaces and save
    cy.get('@currentRow').find(route.casesOverview.row.actionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get('@currentRow').find(route.casesOverview.row.actions.edit)
      .forceClick();
    cy.get(cases.editCase.shortTitle).clear()
      .type(caseTitleChangedWithSpaces);
    cy.intercept('PATCH', '/cases/**').as('patchCase1');
    cy.get(cases.editCase.save).click()
      .wait('@patchCase1');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitleChangedWithSpaces)
      .click();

    // ** subcase overview **

    cy.get(cases.subcaseOverviewHeader.titleContainer).contains(caseTitleChangedWithSpaces);
    cy.get(cases.subcaseOverviewHeader.editCase).click();
    cy.get(cases.editCase.shortTitle).clear()
      .type(caseTitleChanged);
    cy.intercept('PATCH', '/cases/**').as('patchCase1');
    cy.get(cases.editCase.save).click()
      .wait('@patchCase1');
    cy.get(cases.subcaseOverviewHeader.titleContainer).contains(caseTitleChanged);
    cy.go('back');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitleChanged);
  });
});
