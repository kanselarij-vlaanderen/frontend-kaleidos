/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import utils from '../../selectors/utils.selectors';

context('Decision tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test the document CRUD for a decision', () => {
    // const agendaDate = Cypress.dayjs('2022-04-16');
    // const SubcaseTitleShort = 'Cypress test: Decision documents - CRUD of documents on decision - 1652780748';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    cy.visitAgendaWithLink('/vergadering/62836EFDACB8056AF8DE2451/agenda/62836EFDACB8056AF8DE2452/agendapunten/62836F24ACB8056AF8DE2459');
    // Add document to treatment but delete and reupload in the upload modal before saving
    cy.addDocumentToTreatment(file);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(document.vlUploadedDocument.deletePiece).click();
    cy.wait('@deleteFile');

    cy.get(document.vlUploadedDocument.filename).should('not.exist');

    cy.get(utils.vlModal.dialogWindow).within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    cy.intercept('DELETE', 'pieces/*').as('deletePiece');
    cy.intercept('DELETE', 'document-containers/*').as('deleteDocumentContainer');
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@createNewPiece');
    cy.wait('@createNewDocumentContainer');
    cy.wait('@patchDecisionActivities');

    cy.get(document.documentCard.card).as('docCards');
    cy.get('@docCards').should('have.length', 1);

    // TODO-command addNewPieceToTreatment
    cy.addNewPieceToDecision('test', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get(document.documentCard.name.value).eq(0)
      .contains(/BIS/);

    // Delete the TER piece, the BIS should then become the report
    cy.addNewPieceToDecision('test', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get('@docCards').should('have.length', 1);
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/TER/);
        cy.get(document.documentCard.versionHistory)
          .find(auk.accordion.header.button)
          .click();
        cy.get(document.vlDocument.piece).should('have.length', 2);
      });

    // Delete the document-container + all pieces
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/TER/);
        cy.get(document.documentCard.actions).should('not.be.disabled')
          .click();
        cy.get(document.documentCard.delete).click();
      });
    cy.get(utils.vlModalVerify.save).contains('Verwijderen')
      .click();
    cy.wait('@deleteFile');
    cy.wait('@deletePiece');
    cy.wait('@deleteDocumentContainer');

    cy.get(agenda.agendaitemDecision.uploadFile);
    cy.get(document.documentCard.card).should('have.length', 0);
  });

  it('should postpone an agendaitem and change the status of the treatment', () => {
    // const agendaDate = Cypress.dayjs('2022-04-17');
    const SubcaseTitleShort = 'Cypress test: Decision postponing - postpone agendaitem & decision - 1652780867';

    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');
    // TODO-bug, cypress cannot press button right after page load, getters are async and not awaited
    cy.wait(2000);
    // postpone agendaitem on agenda B
    cy.intercept('PATCH', '/agendaitems/**').as('patchAgendaitem1');
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.postpone).click();
    cy.wait('@patchAgendaitem1');
    cy.get(utils.vlModal.dialogWindow).should('not.exist');
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.retracted).should('have.length', 1);

    // advance agendaitem
    cy.intercept('PATCH', '/agendaitems/**').as('patchAgendaitem2');
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.advance).click();
    cy.wait('@patchAgendaitem2');
    cy.get(utils.vlModal.dialogWindow).should('not.exist');
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.retracted).should('have.length', 0);

    // change decision result
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.url().should('contain', '/beslissingen');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivity');
    cy.get(agenda.decisionResultPill.edit).click();
    cy.get(agenda.agendaitemDecisionEdit.resultContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger).scrollIntoView()
        .click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Uitgesteld')
      .scrollIntoView()
      .click();
    cy.get(agenda.agendaitemDecisionEdit.save).click()
      .wait('@patchDecisionActivity');

    // NOTE: right now, changing the status of the treatment does not change the retracted attribute of agendaitem
    // so clicking "uitstellen" should be followed by manually setting the "uitgesteld" status on treatment
    // perhaps in the future this will be a feature
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaDetailSidebar.subitem).find(agenda.agendaDetailSidebarItem.retracted)
      .should('not.exist');
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(cases.subcaseDescription.timelineItem).eq(0)
      .contains(/Ingediend voor agendering op/);
    cy.get(cases.subcaseDescription.timelineItem).eq(1)
      .contains(/Geagendeerd op de agenda van/);
    cy.get(cases.subcaseDescription.timelineItem).eq(2)
      .contains(/Uitgesteld op de agenda van/);
    cy.get(cases.subcaseDescription.timelineItem).eq(3)
      .contains(/Er is beslist om dit agendapunt uit te stellen/);
  });

  it('should test the decision CRUD', () => {
    const agendaDate = Cypress.dayjs('2022-04-19').hour(10);
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const decisionTypes = [
      'Akte genomen',
      'Goedgekeurd',
      'Uitgesteld',
      'Ingetrokken'
    ];

    const subcaseTitleShortNote = 'Cypress test: Decision - CRUD of decisions - Nota - 1652789865';
    const subcaseTitleShortMed = 'Cypress test: Decision - CRUD of decisions - Mededeling - 1652789865';

    cy.createAgenda(null, agendaDate, 'Decision spec').then((result) => {
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
    cy.get(agenda.decisionResultPill.pill).contains('Goedgekeurd');
    // check the default of a note agendaitem
    cy.intercept('get', '/decision-activities?filter**').as('loadDecisionActivity_2');
    cy.get(agenda.agendaDetailSidebar.subitem).eq(1)
      .click();
    cy.get(agenda.decisionResultPill.pill).contains('Goedgekeurd');
    cy.wait('@loadDecisionActivity_2');

    // CRUD of decisions
    // add report ("beslissingsfiche") to existing pre-generated decision-activity of note
    cy.get(agenda.agendaitemDecision.uploadFile).eq(0)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    cy.intercept('GET', 'pieces/*/previous-piece').as('getPreviousPiece');
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@createNewPiece');
    cy.wait('@patchDecisionActivities');
    cy.wait('@getPreviousPiece');
    cy.get(auk.loader).should('not.exist');
    // correct default access rights on non-confidential subcase should be "Intern Regering"
    cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    decisionTypes.forEach((type) => {
      cy.get(agenda.decisionResultPill.edit)
        .click();
      cy.get(dependency.emberPowerSelect.trigger).click();
      cy.get(dependency.emberPowerSelect.option).contains(type)
        .click();
      const randomInt = Math.floor(Math.random() * Math.floor(10000));
      cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt}`);
      cy.get(agenda.agendaitemDecisionEdit.save).click();
      cy.wait(`@patchDecisionActivities_${randomInt}`);
      cy.get(agenda.decisionResultPill.pill).contains(type);
    });
  });

  it('should test if changing subcase to confidential sets correct access rights', () => {
    cy.visit('/dossiers/628392747A5496079478E275/deeldossiers/6283927B7A5496079478E276/beslissing');
    cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    cy.get(cases.subcaseDetailNav.overview).click();
    cy.get(cases.subcaseTitlesView.edit).click();
    cy.get(cases.subcaseTitlesEdit.confidential).click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda');
    cy.intercept('PATCH', '/pieces/*').as('patchPieces');
    cy.get(cases.subcaseTitlesEdit.actions.save).click()
      .wait('@patchSubcases')
      .wait('@patchagendaitems')
      .wait('@patchAgenda')
      .wait('@patchPieces');
    cy.get(cases.subcaseDetailNav.decisions).click();
    cy.get(document.accessLevelPill.pill).contains('Ministerraad');
  });

  it('should test if adding decision to confidential subcase sets correct default access rights', () => {
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.visit('dossiers/628392747A5496079478E275/deeldossiers/628392827A5496079478E277/overzicht');
    cy.get(cases.subcaseTitlesView.edit).click();
    cy.get(cases.subcaseTitlesEdit.confidential).click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda');
    cy.get(cases.subcaseTitlesEdit.actions.save).click()
      .wait('@patchSubcases')
      .wait('@patchagendaitems')
      .wait('@patchAgenda');
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.agendaitemDecision.uploadFile).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', '/pieces').as('postPieces');
    cy.intercept('PATCH', '/decision-activities/*').as('patchDecisionActivity');
    cy.intercept('GET', '/pieces/*/access-level').as('getAccessLevel');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@postPieces')
      .wait('@patchDecisionActivity');
    cy.get(auk.loader).should('not.exist');
    cy.wait('@getAccessLevel');
    cy.get(document.accessLevelPill.pill).contains('Ministerraad');
  });
});
