/* global context, it, cy, beforeEach, afterEach, Cypress, expect */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors.js';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Decision tests post digital agenda', () => {
  const agendaDate = Cypress.dayjs('2023-12-16');

  const accessGovernment = 'Intern Overheid';
  const accessCabinet = 'Intern Regering';
  const accessConfidential = 'Vertrouwelijk';
  const decisionNotSet = 'Nog geen beslissing ingesteld';
  const decisionAcknowledged = 'Akte genomen';
  const decisionApproved = 'Goedgekeurd';
  const decisionPostponed = 'Uitgesteld';
  const decisionRetracted = 'Ingetrokken';

  const caseTitle1 = `Cypress test: Decision documents - CRUD of documents on decision - ${currentTimestamp()}`;
  const type1 = 'Nota';
  const subcaseTitleShort1 = `Cypress test: Decision documents - CRUD of documents on decision - ${currentTimestamp()}`;
  const subcaseTitleLong1 = 'Cypress test: Decision documents - CRUD of documents on decision';
  const subcaseType1 = 'Definitieve goedkeuring';
  const subcaseName1 = 'Goedkeuring na advies van de Raad van State';

  const subcaseTitleShortNote = `Cypress test: Decision - CRUD of decisions - Nota - ${currentTimestamp()}`;
  const typeNote = 'Nota';
  const subcaseTitleShortMed = `Cypress test: Decision - CRUD of decisions - Mededeling - ${currentTimestamp()}`;
  const typeMed = 'Mededeling';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-setup
  it('setup', () => {
    cy.createCase(caseTitle1);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: type1,
      newShortTitle: subcaseTitleShort1,
      longTitle: subcaseTitleLong1,
      subcaseType: subcaseType1,
      subcaseName: subcaseName1,
    });
    cy.addSubcaseViaModal({
      agendaitemType: typeNote,
      newShortTitle: subcaseTitleShortNote,
      subcaseType: subcaseType1,
      subcaseName: subcaseName1,
    });
    cy.addSubcaseViaModal({
      agendaitemType: typeMed,
      newShortTitle: subcaseTitleShortMed,
      subcaseType: subcaseType1,
      subcaseName: subcaseName1,
    });
    cy.createAgenda('Ministerraad', agendaDate, null, 100);
  });

  it('should test the document CRUD for a decision', () => {
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1); // TODO-setup
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.generateDecision();

    cy.get(document.documentCard.card).as('docCards');
    cy.get('@docCards').should('have.length', 1);
    cy.get(appuniversum.loader).should('not.exist');

    // correct default access rights on non-confidential subcase should be "Intern Overheid"
    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    cy.addNewPieceToGeneratedDecision('VR PV');
    cy.get(document.documentCard.name.value).eq(0)
      .contains(/BIS/);

    // check version history accesslevel
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();

    // TODO we did not delete TER
    // Delete the TER piece, the BIS should then become the report
    cy.addNewPieceToGeneratedDecision('VR PV');
    cy.get('@docCards').should('have.length', 1);
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/TER/);
        cy.get(document.documentCard.versionHistory)
          .find(auk.accordion.header.button)
          .should('not.be.disabled')
          .click();
        cy.get(document.vlDocument.piece).should('have.length', 2);
      });

    // check version history acceslevel
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);
    cy.get('@pieces').eq(1)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();

    // delete all and generate a new one is possible
    cy.intercept('DELETE', 'piece-parts/*').as('deletePieceParts');
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.intercept('DELETE', 'reports/*').as('deleteReport');
    cy.intercept('DELETE', 'document-containers/*').as('deleteDocumentContainer');
    cy.get(document.documentCard.actions)
      .should('not.be.disabled')
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.delete).forceClick();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@deletePieceParts');
    cy.wait('@deleteFile');
    cy.wait('@deleteReport');
    cy.wait('@deleteDocumentContainer');

    cy.get(agenda.agendaitemDecision.create);
    cy.get(document.documentCard.card).should('not.exist');
  });

  it('should test the decision CRUD', () => {
    const agendaDate2 = Cypress.dayjs('2023-11-28').hour(10);

    // TODO-setup
    // setup agenda with 2 subcases: nota, med
    cy.createAgenda(null, agendaDate2, 'Decision spec').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
    });
    cy.addAgendaitemToAgenda(subcaseTitleShortNote);
    cy.addAgendaitemToAgenda(subcaseTitleShortMed);

    // check the default desicion result
    cy.openDetailOfAgendaitem(subcaseTitleShortMed);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    // check the default of an announcement agendaitem
    cy.get(agenda.decisionResultPill.pill).contains(decisionAcknowledged);
    // check default of the approval agendaitem
    cy.intercept('get', '/decision-activities?filter**').as('loadDecisionActivity_1');
    cy.get(agenda.agendaDetailSidebar.subitem).eq(0)
      .click();
    cy.wait('@loadDecisionActivity_1');
    cy.get(agenda.decisionResultPill.pill).contains(decisionNotSet);
    // check the default of a note agendaitem
    cy.intercept('get', '/decision-activities?filter**').as('loadDecisionActivity_2');
    cy.get(agenda.agendaDetailSidebar.subitem).eq(1)
      .click();
    cy.wait('@loadDecisionActivity_2');
    cy.get(agenda.decisionResultPill.pill).contains(decisionNotSet);

    // CRUD of decisions
    // generate report to existing pre-generated decision-activity of note
    cy.generateDecision();
    cy.get(agenda.decisionResultPill.pill).contains(decisionApproved);
  });

  it('should test if changing subcase to confidential sets correct access rights', () => {
    // setup, cant visit directly, url changes
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.get(agenda.agendaitemNav.decisionTab)
      .click();

    cy.get(appuniversum.loader).should('not.exist');
    cy.generateDecision();

    cy.openAgendaitemDossierTab(subcaseTitleShort1);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).should('not.be.disabled')
      .click();

    // set subcase to confidential
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases1');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems1');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda1');
    cy.intercept('PATCH', '/reports/*').as('patchReports1');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases1')
      .wait('@patchagendaitems1')
      .wait('@patchAgenda1')
      .wait('@patchReports1');

    // decision should stay confidential
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    cy.openAgendaitemDossierTab(subcaseTitleShort1);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).should('not.be.disabled')
      .click();

    // revert subcase confidentiality
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases2');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems2');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda2');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases2')
      .wait('@patchagendaitems2')
      .wait('@patchAgenda2');

    // decision should stay confidential
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // switch decision to intern overheid
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(document.documentCard.card).within(() => {
      cy.get(document.accessLevelPill.edit).click();
      cy.get(dependency.emberPowerSelect.trigger).click();
    });
    cy.get(dependency.emberPowerSelect.option).contains(accessGovernment)
      .click({
        force: true,
      });
    cy.intercept('PATCH', '/reports/*').as('patchReports2');
    cy.get(document.accessLevelPill.save).click()
      .wait('@patchReports2');
    cy.get(appuniversum.loader).should('not.exist');

    // add BIS
    cy.addNewPieceToGeneratedDecision('VR PV');
    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    // check previous version has default acces level (Intern Regering)
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);

    // set subcase to confidential again
    cy.openAgendaitemDossierTab(subcaseTitleShort1);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).should('not.be.disabled')
      .click();
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases3');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems3');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda3');
    cy.intercept('PATCH', '/reports/*').as('patchReports3');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases3')
      .wait('@patchagendaitems3')
      .wait('@patchAgenda3')
      .wait('@patchReports3');

    // check decision acceslevel
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // check previous version has updated level (Vertrouwelijk)
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece)
      .find(document.accessLevelPill.pill)
      .contains(accessConfidential);
  });

  it('should test if adding decision to confidential subcase sets correct default access rights', () => {
    cy.openCase(caseTitle1);
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases')
      .wait('@patchagendaitems')
      .wait('@patchAgenda');
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.generateDecision();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // add BIS
    cy.addNewPieceToGeneratedDecision('VR PV');

    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // check previous version has correct acces level (Vertrouwelijk)
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece)
      .find(document.accessLevelPill.pill)
      .contains(accessConfidential);
  });

  it('should test changing agenda updates decisions correctly', () => {
    const oldSecretary = 'Jeroen Overmeer';
    const newSecretary = 'Joachim Pohlmann';

    // generate minutes
    cy.openAgendaForDate(agendaDate);
    cy.get(agenda.agendaTabs.tabs).contains('Notulen')
      .click();
    cy.get(route.agendaitemMinutes.createEdit).click();
    cy.get(route.agendaitemMinutes.editor.updateContent).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    cy.intercept('POST', 'minutes').as('postMinutes');
    cy.intercept('POST', 'piece-parts').as('postPieceParts');
    cy.intercept('GET', '/generate-minutes-report/*').as('generateMinutes');
    cy.get(route.agendaitemMinutes.editor.save).click()
      .wait('@createNewDocumentContainer')
      .wait('@postMinutes')
      .wait('@postPieceParts')
      .wait('@generateMinutes');
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(appuniversum.toaster).contains('Notulen aangepast');
    cy.get(appuniversum.alert.close).click();
    cy.get(auk.panel.body).should('contain', oldSecretary);
    cy.get(auk.panel.body).should('not.contain', newSecretary);

    // change secretary > update files of minutes and decisions
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
    cy.get(agenda.editMeeting.secretary).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(newSecretary)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.intercept('PATCH', '/meetings/**').as('patchMeetings');
    cy.intercept('PATCH', '/decision-activities/**').as('patchDecisionActivities');
    cy.intercept('POST', 'generate-decision-report/generate-reports').as('generateBulkDecision');
    cy.intercept('PATCH', '/piece-parts/**').as('patchPieceParts'); // change secretary in table
    cy.intercept('GET', '/generate-minutes-report/*').as('generateMinutes');
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@patchMeetings');
    cy.wait('@patchDecisionActivities');
    cy.wait('@generateBulkDecision');
    cy.wait('@patchPieceParts');
    cy.wait('@generateMinutes');

    // check toasts
    // in progress toasts are hard to catch live, only check if successfull.
    cy.get(appuniversum.toaster).contains('Notulen aangepast');
    cy.get(appuniversum.toaster).contains('Beslissingen aangepast');
    cy.get(appuniversum.alert.close).eq(1)
      .click();
    cy.get(appuniversum.alert.close).eq(0)
      .click();
    cy.get(auk.panel.body).should('contain', newSecretary);
    cy.get(auk.panel.body).should('not.contain', oldSecretary);

    // agendaitem number change > update files of decisions and their names
    // get decision title pre edit
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).contains('0002');

    // change order
    cy.get(agenda.agendaTabs.tabs).contains('Overzicht')
      .click();
    cy.get(agenda.agendaitemSearch.formallyReorderEdit).click();
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort1)
      .parents(agenda.agendaOverviewItem.container)
      .as('agendaitem');
    cy.wait(2500);
    cy.get('@agendaitem').find(agenda.agendaOverviewItem.numbering)
      .contains(2, {
        timeout: 60000,
      });
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems1');
    cy.intercept('POST', 'generate-decision-report/generate-reports').as('generateDecision1');
    cy.get('@agendaitem').find(agenda.agendaOverviewItem.moveUp)
      .click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get('@agendaitem').find(agenda.agendaOverviewItem.moveUp)
      .should('be.disabled');
    cy.get('@agendaitem').find(agenda.agendaOverviewItem.numbering)
      .contains(1);
    cy.get(utils.changesAlert.confirm)
      .click()
      .wait('@patchAgendaitems1')
      .wait('@generateDecision1');
    // check toasts
    cy.get(appuniversum.toaster).contains('Beslissingen aangepast');
    cy.get(appuniversum.alert.close).click({
      multiple: true,
    });

    // check if title changed
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).contains('0001');

    // change order again
    cy.get(agenda.agendaTabs.tabs).contains('Overzicht')
      .click();
    cy.get(agenda.agendaitemSearch.formallyReorderEdit).click();
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort1)
      .parents(agenda.agendaOverviewItem.container)
      .as('agendaitem');
    cy.wait(2500);
    cy.get('@agendaitem').find(agenda.agendaOverviewItem.numbering)
      .contains(1, {
        timeout: 60000,
      });
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems2');
    cy.intercept('POST', 'generate-decision-report/generate-reports').as('generateDecision2');
    cy.get('@agendaitem').find(agenda.agendaOverviewItem.moveDown)
      .click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get('@agendaitem').find(agenda.agendaOverviewItem.moveDown)
      .should('be.disabled');
    cy.get(utils.changesAlert.confirm)
      .click()
      .wait('@patchAgendaitems2')
      .wait('@generateDecision2');
    // check toasts
    cy.get(appuniversum.toaster).contains('Beslissingen aangepast');
    cy.get(appuniversum.alert.close).click({
      multiple: true,
    });

    // check if title changed
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).contains('0002');

    // remove agendaitem
    cy.openDetailOfAgendaitem('Goedkeuring van het verslag', false);
    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.delete).forceClick();
    cy.intercept('DELETE', 'agendaitems/**').as('deleteAgendaitem');
    cy.intercept('POST', 'generate-decision-report/generate-reports').as('generateDecision3');
    cy.get(auk.confirmationModal.footer.confirm).contains('Verwijderen')
      .click();
    cy.wait('@deleteAgendaitem');
    cy.wait('@generateDecision3');
    cy.get(auk.modal.container).should('not.exist');
    // check toasts
    cy.get(appuniversum.toaster).contains('Beslissingen aangepast');
    cy.get(appuniversum.alert.close).click({
      multiple: true,
    });
    cy.get(appuniversum.loader, {
      timeout: 60000,
    }).should('not.exist');

    // check if title changed
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).contains('0001');
  });

  it('should test changing status updates decisions correctly', () => {
    const agendaDate3 = Cypress.dayjs('2023-11-28').hour(10);
    const spy = cy.spy();

    // Decision is retracted from previous test, change status to postponed
    cy.openAgendaForDate(agendaDate3);
    cy.openDetailOfAgendaitem(subcaseTitleShortNote);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains(decisionPostponed)
      .scrollIntoView()
      .click();
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt}`);
    cy.intercept('GET', '/generate-decision-report/*').as(`generateReport_${randomInt}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt}`);
    cy.wait(`@generateReport_${randomInt}`);
    cy.get(appuniversum.toaster).contains('De beslissing is aangepast');
    cy.get(appuniversum.loader).should('not.exist');
    // check if decision is updated correctly
    cy.get(auk.panel.body).contains('Dit punt wordt uitgesteld tot de volgende vergadering.');

    // change status to retracted
    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains(decisionRetracted)
      .scrollIntoView()
      .click();
    const randomInt2 = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt2}`);
    cy.intercept('GET', '/generate-decision-report/*').as(`generateReport_${randomInt2}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt2}`);
    cy.wait(`@generateReport_${randomInt2}`);
    cy.get(appuniversum.toaster).contains('De beslissing is aangepast');
    cy.get(appuniversum.loader).should('not.exist');
    // check if decision is updated correctly
    cy.get(auk.panel.body).contains('Dit punt wordt ingetrokken.');

    // change status to approved, no report is generated
    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains(decisionApproved)
      .click();
    const randomInt3 = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt3}`);
    cy.intercept('GET', '/generate-decision-report/*', spy).as(`generateReport_${randomInt3}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt3}`);
    cy.get(appuniversum.loader).should('not.exist');
    cy.wait(2000).then(() => expect(spy).not.to.have.been.called);
    cy.get(appuniversum.toaster).should('not.exist');
  });

  it('should test generate all decisions pdf', () => {
    const agendaDate4 = Cypress.dayjs('2023-11-28').hour(10);
    const downloadPath = 'cypress/downloads';
    const fileName = 'VR PV 2023/101 - ALLE BESLISSINGEN.pdf'; // slash for actual name, dash for downloaded file
    const downloadedFileName = 'VR PV 2023-101 - ALLE BESLISSINGEN.pdf';
    const downloadDecisionPDF = `${downloadPath}/${downloadedFileName}`;

    cy.openAgendaForDate(agendaDate4);
    cy.wait(2000);
    cy.get(agenda.agendaActions.optionsDropdown).children(appuniversum.button)
      .click();
    cy.intercept('POST', '/generate-decision-report/generate-reports-bundle').as('generateReportBundle');
    cy.get(agenda.agendaActions.generateSignedDecisionsBundle).forceClick();
    cy.wait('@generateReportBundle');
    cy.get(appuniversum.toaster).contains('Alle beslissingen PDF aangemaakt');
    cy.clickReverseTab('Documenten');

    cy.get(document.documentCard.name.value).contains(fileName)
      .click();

    cy.get(document.documentPreview.downloadLink).click();

    cy.readFile(downloadDecisionPDF, {
      timeout: 25000,
    });
    // reading contents not out of the box with cypress
    // .should('contain', 'VR PV 2023/3 - punt 0002');
  });
});
