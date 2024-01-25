/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Decision tests post digital agenda', () => {
  const agendaDate = Cypress.dayjs('2023-12-16');

  const accessGovernment = 'Intern Overheid';
  const accessCabinet = 'Intern Regering';
  const accessConfidential = 'Vertrouwelijk';

  const caseTitle1 = `Cypress test: Decision documents - CRUD of documents on decision- ${currentTimestamp()}`;
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

  it('should test the document CRUD for a decision', () => {
    // const SubcaseTitleShort = 'Cypress test: Decision documents - CRUD of documents on decision - 1652780748';
    // const files1 = [
    //   {
    //     folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'BVR',
    //   }
    // ];

    cy.createCase(caseTitle1);
    cy.addSubcase(type1, subcaseTitleShort1, subcaseTitleLong1, subcaseType1, subcaseName1);
    cy.addSubcase(typeNote, subcaseTitleShortNote, null, subcaseType1, subcaseName1);
    cy.addSubcase(typeMed, subcaseTitleShortMed, null, subcaseType1, subcaseName1);

    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    // cy.visitAgendaWithLink('/vergadering/62836EFDACB8056AF8DE2451/agenda/62836EFDACB8056AF8DE2452/agendapunten/62836F24ACB8056AF8DE2459/beslissingen');
    // Add document to treatment but delete and reupload in the upload modal before saving
    // cy.addDocumentToTreatment(file);
    // cy.intercept('DELETE', 'files/*').as('deleteFile');
    // cy.get(document.vlUploadedDocument.deletePiece).click();
    // cy.wait('@deleteFile');

    // cy.get(document.vlUploadedDocument.filename).should('not.exist');

    // cy.get(auk.auModal.container).within(() => {
    //   cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    // });

    // cy.intercept('POST', 'pieces').as('createNewPiece');
    // cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    // cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    // cy.intercept('DELETE', 'pieces/*').as('deletePiece');
    // cy.intercept('DELETE', 'document-containers/*').as('deleteDocumentContainer');
    // cy.get(auk.confirmationModal.footer.confirm).click();
    // cy.wait('@createNewPiece');
    // cy.wait('@createNewDocumentContainer');
    // cy.wait('@patchDecisionActivities');
    cy.generateDecision();

    cy.get(document.documentCard.card).as('docCards');
    cy.get('@docCards').should('have.length', 1);
    cy.get(appuniversum.loader).should('not.exist');

    // correct default access rights on non-confidential subcase should be "Intern Overheid"
    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    cy.reload();
    cy.addNewPieceToGeneratedDecision('VR PV');
    cy.get(document.documentCard.name.value).eq(0)
      .contains(/BIS/);

    // check version history acceslevel
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

    // Delete the document-container + all pieces
    // cy.get('@docCards').eq(0)
    //   .within(() => {
    //     cy.get(document.documentCard.name.value).contains(/TER/);
    //     cy.get(document.documentCard.actions)
    //       .should('not.be.disabled')
    //       .children(appuniversum.button)
    //       .click();
    //     cy.get(document.documentCard.delete).forceClick();
    //   });
    // cy.get(auk.confirmationModal.footer.confirm).contains('Verwijderen')
    //   .click();
    // cy.wait('@deleteFile');
    // cy.wait('@deletePiece');
    // cy.wait('@deleteDocumentContainer');

    // cy.get(agenda.agendaitemDecision.uploadFile);
    // cy.get(document.documentCard.card).should('have.length', 0);
  });

  it('should test the decision CRUD', () => {
    const agendaDate2 = Cypress.dayjs('2023-11-28').hour(10);
    const decisionTypes = [
      'Akte genomen',
      'Goedgekeurd',
      'Uitgesteld',
      'Ingetrokken'
    ];

    cy.createAgenda(null, agendaDate2, 'Decision spec').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
    });
    cy.addAgendaitemToAgenda(subcaseTitleShortNote);
    cy.addAgendaitemToAgenda(subcaseTitleShortMed);

    // setup case with 2 subcases: nota, med

    // check the default desicion result
    cy.openDetailOfAgendaitem(subcaseTitleShortMed);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    // check the default of an announcement agendaitem
    cy.get(agenda.decisionResultPill.pill).contains('Akte genomen');
    // check default of the approval agendaitem
    cy.intercept('get', '/decision-activities?filter**').as('loadDecisionActivity_1');
    cy.get(agenda.agendaDetailSidebar.subitem).eq(0)
      .click();
    cy.wait('@loadDecisionActivity_1');
    cy.get(agenda.decisionResultPill.pill).contains('Nog geen beslissing ingesteld');
    // check the default of a note agendaitem
    cy.intercept('get', '/decision-activities?filter**').as('loadDecisionActivity_2');
    cy.get(agenda.agendaDetailSidebar.subitem).eq(1)
      .click();
    cy.get(agenda.decisionResultPill.pill).contains('Nog geen beslissing ingesteld');
    cy.wait('@loadDecisionActivity_2');

    // CRUD of decisions
    // add report ("beslissingsfiche") to existing pre-generated decision-activity of note
    cy.generateDecision();
    // cy.get(agenda.agendaitemDecision.uploadFile).eq(0)
    //   .click();
    // cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    // cy.intercept('POST', 'pieces').as('createNewPiece');
    // cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    // cy.intercept('GET', 'pieces/*/previous-piece').as('getPreviousPiece');
    // cy.get(auk.confirmationModal.footer.confirm).click();
    // cy.wait('@createNewPiece');
    // cy.wait('@patchDecisionActivities');
    // cy.wait('@getPreviousPiece');
    cy.get(appuniversum.loader).should('not.exist');

    decisionTypes.forEach((type) => {
      cy.get(agenda.decisionResultPill.edit)
        .click();
      cy.get(dependency.emberPowerSelect.trigger).click();
      cy.get(dependency.emberPowerSelect.option).contains(type)
        .scrollIntoView()
        .click();
      const randomInt = Math.floor(Math.random() * Math.floor(10000));
      cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt}`);
      cy.get(agenda.agendaitemDecisionEdit.save).click();
      cy.wait(`@patchDecisionActivities_${randomInt}`);
      cy.get(agenda.decisionResultPill.pill).contains(type);
    });
  });

  it('should test if changing subcase to confidential sets correct access rights', () => {
    // const agendaDate = Cypress.dayjs('2022-04-19');
    // const agendaitemTitle = 'Cypress test: Decision documents - CRUD of documents on decision - 1706024466';

    // setup, cant visit directly, url changes
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.get(agenda.agendaitemNav.decisionTab)
      .click();

    // remove decision
    cy.intercept('DELETE', 'piece-parts/*').as('deletePiece');
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.intercept('DELETE', 'reports/*').as('deleteReport');
    cy.intercept('DELETE', 'document-containers/*').as('deleteDocumentContainer');
    cy.get(document.documentCard.actions)
      .should('not.be.disabled')
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.delete).forceClick();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@deletePiece');
    cy.wait('@deleteFile');
    cy.wait('@deleteReport');
    cy.wait('@deleteDocumentContainer');
    cy.get(appuniversum.loader);
    cy.get(appuniversum.loader).should('not.exist');
    // reset result to goedgekeurd
    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Goedgekeurd')
      .click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.generateDecision();

    // cy.visit('/dossiers/E14FB58C-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/6283927B7A5496079478E276/beslissing');
    cy.openAgendaitemDossierTab(subcaseTitleShort1);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).should('not.be.disabled')
      .click();
    cy.get(cases.subcaseDetailNav.decisions).click();
    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    // set subcase to confidential
    cy.get(cases.subcaseDetailNav.overview).click();
    cy.get(cases.subcaseTitlesView.edit).click();
    cy.get(cases.subcaseTitlesEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases1');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems1');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda1');
    cy.intercept('PATCH', '/reports/*').as('patchReports1');
    cy.get(cases.subcaseTitlesEdit.actions.save).click()
      .wait('@patchSubcases1')
      .wait('@patchagendaitems1')
      .wait('@patchAgenda1')
      .wait('@patchReports1');

    // check document confidentiality
    cy.get(cases.subcaseDetailNav.decisions).click();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // revert subcase confidentiality
    cy.get(cases.subcaseDetailNav.overview).click();
    cy.get(cases.subcaseTitlesView.edit).click();
    cy.get(cases.subcaseTitlesEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases2');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems2');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda2');
    cy.get(cases.subcaseTitlesEdit.actions.save).click()
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
    cy.get(auk.loader).should('not.exist');
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
    cy.get(cases.subcaseDetailNav.overview).click();
    cy.get(cases.subcaseTitlesView.edit).click();
    cy.get(cases.subcaseTitlesEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases3');
    // cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems3');
    // cy.intercept('PATCH', '/agendas/*').as('patchAgenda3');
    // cy.intercept('PATCH', '/reports/*').as('patchReports3');
    cy.get(cases.subcaseTitlesEdit.actions.save).click()
      .wait('@patchSubcases3');
    // .wait('@patchagendaitems3')
    // .wait('@patchAgenda3')
    // .wait('@patchReports3');

    // check decision acceslevel
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    // check previous version has updated level (Vertrouwelijk)
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);
  });

  it('should test if adding decision to confidential subcase sets correct default access rights', () => {
    // cy.visit('dossiers/E14FB58C-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/628392827A5496079478E277');
    cy.openCase(caseTitle1);
    cy.openSubcase(0);
    cy.get(cases.subcaseTitlesView.edit).click();
    cy.get(cases.subcaseTitlesEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda');
    cy.get(cases.subcaseTitlesEdit.actions.save).click()
      .wait('@patchSubcases')
      .wait('@patchagendaitems')
      .wait('@patchAgenda');
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.generateDecision();
    cy.get(appuniversum.loader).should('not.exist', {
      timeout: 80000,
    });
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

  it.only('should test changing agenda updates decisions correctly', () => {
    const subcaseTitleShort2 = 'Cypress test: Decision documents - CRUD of documents on decision - 1706024466';
    const newSecretary = 'Joachim Pohlmann';

    cy.openAgendaForDate(agendaDate);
    cy.get(agenda.agendaTabs.tabs).contains('Notulen')
      .click();
    cy.get(route.agendaitemMinutes.createEdit).click();
    cy.get(route.agendaitemMinutes.editor.updateContent).click();
    cy.get(auk.loader).should('not.exist');
    cy.intercept('PATCH', '/minutes/**').as('patchMinutes');
    cy.get(route.agendaitemMinutes.editor.save).click()
      .wait('@patchMinutes');

    // change secretary
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
    // cy.intercept('PATCH', '/minutes/**').as('patchMinutes');
    // cy.intercept('PATCH', '/decision-activities/**').as('patchDecisionActivities');
    cy.get(agenda.editMeeting.save).click({
      force: true,
    });
    cy.wait('@patchMeetings');
    // cy.wait('@patchMinutes', {
    //   timeout: 60000,
    // });
    // cy.wait('@patchDecisionActivities');
    // check toasts
    // cy.get(appuniversum.toaster).contains('Beslissingen aanpassen');
    // cy.get(appuniversum.toaster).contains('Notulen aanpassen');
    // cy.get(appuniversum.toaster).contains('Beslissingen aangepast');
    cy.get(appuniversum.toaster).contains('Notulen aangepast');
    cy.wait(2000); // something triggers reload, which causes cypress to fail
    cy.get(appuniversum.alert.close).click({
      multiple: true,
    });

    // get decision title
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).contains('0002');

    // change order
    cy.get(agenda.agendaTabs.tabs).contains('Overzicht')
      .click();
    cy.get(agenda.agendaOverview.formallyOkEdit).click();
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort2)
      .parents(agenda.agendaOverviewItem.container)
      .as('agendaItem');
    // TODO-waits: better wait
    cy.wait(5000);
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(2, {
        timeout: 60000,
      });
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems');
    cy.intercept('POST', 'generate-decision-report/generate-reports').as('generateDecision1');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveUp)
      .click()
      .wait('@patchAgendaitems')
      .wait('@generateDecision1');
    cy.get(auk.loader).should('not.exist');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveUp)
      .should('be.disabled');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(1);
    // check toasts
    // todo happens too fast?
    // cy.get(appuniversum.toaster).contains('Beslissingen aanpassen');
    // cy.get(appuniversum.toaster).contains('Beslissingen aangepast');

    // check if title changed
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).contains('0001');

    // change order again
    cy.get(agenda.agendaTabs.tabs).contains('Overzicht')
      .click();
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort2)
      .parents(agenda.agendaOverviewItem.container)
      .as('agendaItem');
    // TODO-waits: better wait
    cy.wait(5000);
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(1, {
        timeout: 60000,
      });
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems');
    cy.intercept('POST', 'generate-decision-report/generate-reports').as('generateDecision2');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveDown)
      .click()
      .wait('@patchAgendaitems')
      .wait('@generateDecision2');
    cy.get(auk.loader).should('not.exist');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveDown)
      .should('be.disabled');

    // check if title changed
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
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
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');

    // check if title changed
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).contains('0001');
  });

  it('should test changing status updates decisions correctly', () => {
    const agendaDate3 = Cypress.dayjs('2023-11-28').hour(10);

    cy.openAgendaForDate(agendaDate3);
    cy.openDetailOfAgendaitem(subcaseTitleShortNote);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Uitgesteld')
      .scrollIntoView()
      .click();
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt}`);
    cy.get(auk.loader).should('not.exist');
    // TODO-waits: better wait?
    cy.wait(2000);
    // check if decision is updated correctly
    cy.get(agenda.agendaitemDecision.view).contains('Dit punt wordt uitgesteld tot de volgende vergadering.');

    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Ingetrokken')
      .scrollIntoView()
      .click();
    const randomInt2 = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt2}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt2}`);
    cy.get(auk.loader).should('not.exist');
    // TODO-waits: better wait?
    cy.wait(5000);
    // check if decision is updated correctly
    cy.get(agenda.agendaitemDecision.view).contains('Dit punt wordt ingetrokken.');

    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Goedgekeurd')
      .click();
    const randomInt3 = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt3}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt3}`);
    cy.get(auk.loader).should('not.exist');
    // TODO-waits: better wait?
    cy.wait(5000);
    // check if decision is not updated
    cy.get(agenda.agendaitemDecision.view).contains('Dit punt wordt ingetrokken.');
  });
});
