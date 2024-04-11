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
    const caseTitle = 'Check confidential';
    cy.createCase(caseTitle).then((result) => {
      // automatic transition to add new-subcase modal
      cy.url().should('contain', `dossiers/${result.caseId}/deeldossiers/procedurestap-toevoegen`);
    });
    const subcase = {
      newCase: true,
      agendaitemType: 'Nota',
    };
    cy.addSubcaseViaModal(subcase);
    // case title is visible in header
    cy.get(cases.subcaseOverviewHeader.titleContainer).within(() => {
      cy.contains(caseTitle);
    });
    // no short title results in case title being used for subcase
    cy.get(cases.subcaseDescription.shortTitle).contains(caseTitle);
    // subcase confidentiality should be false by default
    cy.get(cases.subcaseDescription.confidentialityPill).should('not.exist');
    // TODO KAS-4529 do we want to check the id?
    // cy.url().should('contain', `/deeldossiers/${result.subcaseId}`);
    cy.url().should('not.contain', '/deeldossiers/procedurestap-toevoegen');
  });

  it('Hitting cancel or close should hide the model and not remember state', () => {
    cy.visit('/dossiers?aantal=2');
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
    const shortTitle = 'Dit is de korte titel van het dossier';
    cy.createCase(shortTitle);
    const subcase = {
      newCase: true,
      agendaitemType: 'Mededeling',
      confidential: true,
      newShortTitle: 'Dit is de korte titel van de procedurestap',
    };
    const subcaseClone = {
      newShortTitle: 'Dit is de kopie',
      clonePrevious: true,
    };
    cy.addSubcaseViaModal(subcase);
    cy.get(cases.subcaseDescription.shortTitle).contains(subcase.newShortTitle);
    cy.get(cases.subcaseDescription.confidentialityPill);
    // ensure type is correct
    cy.get(cases.subcaseDescription.agendaitemTypePill).contains(subcase.agendaitemType);
    // ensure confidentiality & type is the same after copy to new subcase
    cy.addSubcaseViaModal(subcaseClone);
    cy.get(cases.subcaseDescription.shortTitle).contains(subcaseClone.newShortTitle);
    cy.get(cases.subcaseDescription.agendaitemTypePill).contains(subcase.agendaitemType);
    cy.get(cases.subcaseDescription.confidentialityPill);
  });

  it('Een dossier maken zonder korte titel kan niet', () => {
    cy.visit('/dossiers?aantal=2');

    cy.get(cases.casesHeader.addCase).click();
    cy.get(auk.confirmationModal.footer.confirm).should('be.disabled');
    cy.get(cases.newCase.shorttitle).type('Dossier X');
    cy.get(auk.confirmationModal.footer.confirm).should('not.be.disabled');
  });

  it('Archive and restore case', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    const caseTitle = `test verwijderen - ${randomInt}`;
    cy.createCase(caseTitle);
    cy.get(cases.newSubcaseForm.cancel).click();

    // case is in overview
    cy.visit('/dossiers?aantal=2');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle)
      .click();
    // archive case
    cy.get(cases.subcaseOverviewHeader.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(cases.subcaseOverviewHeader.actions.archive).forceClick();
    cy.intercept('PATCH', '/decisionmaking-flows/**').as('patchDecisionFlow');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchDecisionFlow');
    // case no longer showing in overview
    cy.visit('/dossiers?aantal=2');
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(route.casesOverview.row.caseTitle).should('not.contain', caseTitle);
    // restore case
    cy.go('back');
    cy.intercept('PATCH', '/decisionmaking-flows/**').as('patchDecisionFlow');
    cy.get(cases.subcaseOverviewHeader.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(cases.subcaseOverviewHeader.actions.archive).forceClick()
      .wait('@patchDecisionFlow');
    // case back in overview
    cy.visit('/dossiers?aantal=2');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle);
  });

  it('should change the short title', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    const caseTitle = `test change shorttitle - ${randomInt}`;
    const caseTitleChanged = `test changed shorttitle for test - ${randomInt}`;
    const caseTitleChangedWithSpaces = ` test changed shorttitle for test with trailing and leading spaces - ${randomInt} `;

    // no subcase
    cy.createCase(caseTitle);
    cy.get(cases.newSubcaseForm.cancel).click();

    cy.get(cases.subcaseOverviewHeader.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(cases.subcaseOverviewHeader.actions.editCase).forceClick();

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
    cy.get(cases.subcaseOverviewHeader.titleContainer).contains(caseTitle);
    cy.visit('/dossiers?aantal=2');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitle)
      .click();

    // change title and save
    cy.get(cases.subcaseOverviewHeader.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(cases.subcaseOverviewHeader.actions.editCase).forceClick();
    cy.get(cases.editCase.shortTitle).clear()
      .type(caseTitleChanged);
    cy.intercept('PATCH', '/cases/**').as('patchCase1');
    cy.get(cases.editCase.save).click()
      .wait('@patchCase1');
    cy.get(cases.subcaseOverviewHeader.titleContainer).contains(caseTitleChanged);
    cy.visit('/dossiers?aantal=2');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitleChanged)
      .click();

    // change title with spaces and save
    cy.get(cases.subcaseOverviewHeader.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(cases.subcaseOverviewHeader.actions.editCase).forceClick();
    cy.get(cases.editCase.shortTitle).clear()
      .type(caseTitleChangedWithSpaces);
    cy.intercept('PATCH', '/cases/**').as('patchCase1');
    cy.get(cases.editCase.save).click()
      .wait('@patchCase1');
    cy.get(cases.subcaseOverviewHeader.titleContainer).contains(caseTitleChangedWithSpaces);
    cy.visit('/dossiers?aantal=2');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitleChangedWithSpaces)
      .click();

    // with subcase (different template)
    const caseTitleWithSubcase = `${caseTitle} met procedurestap`;
    const caseTitleWithSubcaseChanged = `${caseTitleChanged} met procedurestap`;
    cy.createCase(caseTitleWithSubcase);
    cy.addSubcaseViaModal({
      newCase: true,
    });
    cy.get(cases.subcaseOverviewHeader.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(cases.subcaseOverviewHeader.actions.editCase).forceClick();
    cy.get(cases.editCase.shortTitle).clear()
      .type(caseTitleWithSubcaseChanged);
    cy.intercept('PATCH', '/cases/**').as('patchCase1');
    cy.get(cases.editCase.save).click()
      .wait('@patchCase1');
    cy.get(cases.subcaseOverviewHeader.titleContainer).contains(caseTitleWithSubcaseChanged);
    cy.visit('/dossiers?aantal=2');
    cy.get(route.casesOverview.row.caseTitle).contains(caseTitleWithSubcaseChanged);
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
    const subcaseType = 'principiële goedkeuring';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
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
      newCase: true,
      agendaitemType: agendaType,
      confidential: true,
      newShortTitle: newShortTitle,
      longTitle: longTitle,
      subcaseType: subcaseType,
      subcaseName: subcaseName,
      mandatees: mandatees,
      domains: domains,
      documents: files1,
      formallyOk: true,
      agendaDate: agendaDateFormatted,
    };
    const subcase2 = {
      agendaitemType: agendaTypeMed,
      documents: files2,
      agendaDate: agendaDateFormatted,
    };

    cy.createAgenda('Ministerraad', agendaDate, 'test add newsubcase');
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal(subcase1);

    // check that case was created succesfully
    cy.get(auk.loader).should('not.exist');
    cy.get(cases.subcaseDescription.agendaLink).contains(agendaDateFormattedMonthDutch);
    // we don't know the exact number, just that it exists
    cy.get(cases.subcaseDescription.meetingNumber).should('not.contain', 'Nog geen nummer');
    // TODO KAS-4529 meetingPlannedStart not there
    // cy.get(cases.subcaseDescription.meetingPlannedStart).contains(agendaDateFormattedMonthDutch);

    // check submitter
    cy.get(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.second.fullName)
      .parent(mandatee.mandateePanelView.rows)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');

    cy.get(cases.subcaseDescription.agendaitemTypePill).contains(subcase1.agendaitemType);
    // TODO KAS-4529 we do not show this subcasename anywhere! used to be a pill
    // also, titltesView no longer exists
    // cy.get(cases.subcaseTitlesView.subcaseName).contains(subcaseName);

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
    // cy.get(cases.subcaseDescription.meetingPlannedStart).contains(agendaDateFormattedMonthDutch);
    // check submitter
    cy.get(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.second.fullName)
      .parent(mandatee.mandateePanelView.rows)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');

    cy.get(cases.subcaseDescription.agendaitemTypePill).contains(subcase2.agendaitemType);
    // TODO KAS-4529 we do not show this subcasename anywhere! used to be a pill
    // also, titltesView no longer exists
    // cy.get(cases.subcaseTitlesView.subcaseName).should('not.exist');

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

    cy.get(appuniversum.loader).should('not.exist', {
      timeout: 60000,
    });
    cy.get(document.documentCard.name.value).contains(files2[0].newFileName);
    cy.get(document.documentCard.name.value).contains(files2[1].newFileName);
    cy.get(document.linkedDocumentLink.name).contains(files1[0].newFileName);
    cy.get(document.linkedDocumentLink.name).contains(files1[1].newFileName);
  });
  // add new subcase, check inheritance, add new docs, new subcase type, also linked documents
});
