/* global context, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function getTranslatedMonth(month) {
  switch (month) {
    case 0:
      return 'januari';
    case 1:
      return 'februari';
    case 2:
      return 'maart';
    case 3:
      return 'april';
    case 4:
      return 'mei';
    case 5:
      return 'juni';
    case 6:
      return 'juli';
    case 7:
      return 'augustus';
    case 8:
      return 'september';
    case 9:
      return 'oktober';
    case 10:
      return 'november';
    case 11:
      return 'december';
    default:
      return '';
  }
}

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
    cy.get(auk.confirmationModal.footer.cancel).click();
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
    cy.get(auk.confirmationModal.footer.confirm).should('be.disabled');
    cy.get(cases.newCase.shorttitle).type('Dossier X');
    cy.get(auk.confirmationModal.footer.confirm).should('not.be.disabled');
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
    cy.intercept('PATCH', '/decisionmaking-flows/**').as('patchDecisionFlow');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchDecisionFlow');
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(route.casesOverview.row.caseTitle).should('not.contain', caseTitle);

    cy.get(route.casesOverview.showArchived)
      .parent()
      .click();
    cy.get(appuniversum.loader).should('exist'); // page load
    cy.url().should('contain', '?toon_enkel_gearchiveerd=true');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle);

    // restore case
    cy.get('@currentRow').find(route.casesOverview.row.actionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.intercept('PATCH', '/decisionmaking-flows/**').as('patchDecisionFlow');
    cy.get('@currentRow').find(route.casesOverview.row.actions.archive)
      .forceClick()
      .wait('@patchDecisionFlow');

    cy.get(route.casesOverview.showArchived)
      .parent()
      .click();
    cy.get(appuniversum.loader).should('exist'); // page load
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

  it('create case and subcase via new flow', () => {
    const caseTitle = 'test new flow';
    const agendaDate = Cypress.dayjs().add(1, 'weeks')
      .day(5);
    const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
    const monthDutch = getTranslatedMonth(agendaDate.month());
    const agendaDateFormattedMonthDutch = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;
    const agendaType = 'Nota';
    const agendaTypeMed = 'Mededeling';
    const newShortTitle = 'Test ShortTitle';
    const longTitle = 'Test Longtitle';
    const step = 'principiële goedkeuring';
    const stepName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const mandatee1 = {
      fullName: mandateeNames.current.fourth.fullName,
      submitter: false,
    };
    const mandatee2 = {
      fullName: mandateeNames.current.second.fullName,
      submitter: true,
    };
    const mandatees = [mandatee1, mandatee2];
    const domain1 = {
      name: 'Cultuur, Jeugd, Sport en Media',
      selected: true,
      fields: [],
    };
    const domain2 = {
      name: 'Economie, Wetenschap en Innovatie',
      selected: false,
      fields: ['Wetenschappelijk onderzoek', 'Innovatie'],
    };
    const domains = [domain1, domain2];
    const files1 = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
      }
    ];
    const files2 = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-3', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-4', fileType: 'Decreet',
      }
    ];
    const subcase1 = {
      type: agendaType,
      confidential: true,
      newShortTitle: newShortTitle,
      longTitle: longTitle,
      step: step,
      stepName: stepName,
      mandatees: mandatees,
      domains: domains,
      documents: files1,
      formallyOk: true,
      agendaDate: agendaDateFormatted,
    };
    const subcase2 = {
      type: agendaTypeMed,
      documents: files2,
      agendaDate: agendaDateFormatted,
    };

    cy.createAgenda('Ministerraad', agendaDate, 'test add newsubcase');
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal(subcase1);

    // cy.openCase(caseTitle);
    // cy.openSubcase(0);
    // check that case was created succesfully
    cy.get(auk.loader).should('not.exist');
    cy.get(cases.subcaseDescription.agendaLink).contains(agendaDateFormattedMonthDutch);
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(agendaDateFormattedMonthDutch);
    cy.get(cases.subcaseDescription.requestedBy).contains(mandateeNames.current.second.fullName);

    cy.get(cases.subcaseTitlesView.type).contains(agendaType);
    cy.get(cases.subcaseTitlesView.subcaseName).contains(stepName);

    cy.get(mandatee.mandateePanelView.rows).as('listItemsMandatee');
    cy.get('@listItemsMandatee').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItemsMandatee').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.second.fullName);
    cy.get('@listItemsMandatee').eq(0)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');
    cy.get('@listItemsMandatee').eq(1)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.fourth.fullName);
    cy.get('@listItemsMandatee').eq(1)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('not.exist');

    cy.get(utils.governmentAreasPanel.rows).as('listItemsAreas');
    cy.get('@listItemsAreas').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItemsAreas').eq(0)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain1.name);
    cy.get('@listItemsAreas').eq(0)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', '-');
    cy.get('@listItemsAreas').eq(1)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain2.name);
    cy.get('@listItemsAreas').eq(1)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', domain2.fields[0, 1]);

    cy.get(cases.subcaseDetailNav.documents).click();
    cy.get(document.documentCard.name.value).contains(files1[0].newFileName);
    cy.get(document.documentCard.name.value).contains(files1[1].newFileName);

    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(newShortTitle);

    cy.get(agenda.agendaitemTitlesView.type).contains(agendaType);
    cy.get(agenda.agendaitemTitlesView.formallyOk).contains('Formeel OK');

    cy.get(mandatee.mandateePanelView.rows).as('listItemsMandatee2');
    cy.get('@listItemsMandatee2').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItemsMandatee2').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.second.fullName);
    cy.get('@listItemsMandatee2').eq(0)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');
    cy.get('@listItemsMandatee2').eq(1)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.fourth.fullName);
    cy.get('@listItemsMandatee2').eq(1)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('not.exist');

    cy.get(utils.governmentAreasPanel.rows).as('listItemsAreas2');
    cy.get('@listItemsAreas2').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItemsAreas2').eq(0)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain1.name);
    cy.get('@listItemsAreas2').eq(0)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', '-');
    cy.get('@listItemsAreas2').eq(1)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain2.name);
    cy.get('@listItemsAreas2').eq(1)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', domain2.fields[0, 1]);

    cy.openAgendaitemDocumentTab(newShortTitle);
    cy.get(document.documentCard.name.value).contains(files1[0].newFileName);
    cy.get(document.documentCard.name.value).contains(files1[1].newFileName);

    cy.openCase(caseTitle);
    cy.addSubcaseViaModal(subcase2);

    cy.get(auk.loader).should('not.exist');
    cy.get(cases.subcaseDescription.agendaLink).contains(agendaDateFormattedMonthDutch);
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(agendaDateFormattedMonthDutch);
    cy.get(cases.subcaseDescription.requestedBy).contains(mandateeNames.current.second.fullName);

    cy.get(cases.subcaseTitlesView.type).contains(agendaTypeMed);
    cy.get(cases.subcaseTitlesView.subcaseName).should('not.exist');

    cy.get(mandatee.mandateePanelView.rows).as('listItemsMandatee');
    cy.get('@listItemsMandatee').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItemsMandatee').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.second.fullName);
    cy.get('@listItemsMandatee').eq(0)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');
    cy.get('@listItemsMandatee').eq(1)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.fourth.fullName);
    cy.get('@listItemsMandatee').eq(1)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('not.exist');

    cy.get(utils.governmentAreasPanel.rows).as('listItemsAreas');
    cy.get('@listItemsAreas').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItemsAreas').eq(0)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain1.name);
    cy.get('@listItemsAreas').eq(0)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', '-');
    cy.get('@listItemsAreas').eq(1)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain2.name);
    cy.get('@listItemsAreas').eq(1)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', domain2.fields[0, 1]);

    cy.get(cases.subcaseDetailNav.documents).click();
    cy.get(appuniversum.loader).should('not.exist', {
      timeout: 60000,
    });
    cy.wait(10000);
    cy.get(document.documentCard.name.value).contains(files2[0].newFileName);
    cy.get(document.documentCard.name.value).contains(files2[1].newFileName);
    cy.get(document.linkedDocumentLink.name).contains(files1[0].newFileName);
    cy.get(document.linkedDocumentLink.name).contains(files1[1].newFileName);
  });
  // add new subcase, check inheritance, add new docs, new subcase type, also linked documents
});
