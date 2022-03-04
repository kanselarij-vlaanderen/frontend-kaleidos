/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import route from '../../selectors/route.selectors';
import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Decision tests', () => {
  const agendaDate = Cypress.dayjs().add(1, 'weeks')
    .day(2); // Next friday

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test the document CRUD for a decision', () => {
    const caseTitle = `Cypress test: Decision documents - ${currentTimestamp()}`;
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: perform CRUD of documents on decision - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toevoegen van een beslissingsfiche en algemene CRUD operaties van deze fiche';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    cy.createCase(caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
    });
    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.addDocumentToTreatment(file);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(document.vlUploadedDocument.deletePiece).click();
    cy.wait('@deleteFile', {
      timeout: 12000,
    });

    cy.get(document.vlUploadedDocument.filename).should('not.exist');

    cy.get(utils.vlModal.dialogWindow).within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    cy.intercept('PATCH', 'agenda-item-treatments/**').as('patchTreatments');
    cy.intercept('DELETE', 'pieces/*').as('deletePiece');
    cy.intercept('DELETE', 'document-containers/*').as('deleteDocumentContainer');

    cy.get(utils.vlModalFooter.save).click();

    cy.wait('@createNewPiece', {
      timeout: 12000,
    });
    cy.wait('@createNewDocumentContainer', {
      timeout: 12000,
    });
    cy.wait('@patchTreatments', {
      timeout: 12000,
    });

    cy.get(document.documentCard.card).as('docCards');
    cy.get('@docCards').should('have.length', 1);

    // TODO-command addNewPieceToTreatment
    cy.addNewPieceToSignedDocumentContainer('test', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get(document.documentCard.name.value).eq(0)
      .contains(/BIS/);

    // Delete the TER piece, the BIS should then become the report
    cy.addNewPieceToSignedDocumentContainer('test', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get('@docCards').should('have.length', 1);
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/TER/);
        cy.get(document.documentCard.versionHistory)
          .find(auk.accordion.header.button)
          .click();
        cy.get(document.vlDocument.piece).should('have.length', 3);
        cy.get(document.vlDocument.delete).eq(0) // this is the TER piece
          .click();
      });
    // verify modal
    cy.get(utils.vlModalVerify.save).contains('Verwijderen')
      .click();
    cy.wait('@deleteFile', {
      timeout: 20000,
    });
    cy.wait('@deletePiece', {
      timeout: 20000,
    });
    cy.wait('@patchTreatments', {
      timeout: 12000,
    });

    // Delete the document-container + all pieces
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/BIS/);
        cy.get(document.documentCard.actions).should('not.be.disabled')
          .click();
        cy.get(document.documentCard.delete).click();
      });
    cy.get(utils.vlModalVerify.save).contains('Verwijderen')
      .click();
    cy.wait('@deleteFile', {
      timeout: 20000,
    });
    cy.wait('@deletePiece', {
      timeout: 20000,
    });
    cy.wait('@deleteDocumentContainer', {
      timeout: 20000,
    });

    cy.get(document.documentCard.card).should('have.length', 0);
  });

  it('should postpone an agendaitem and change the status of the treatment', () => {
    // TODO-setup replace setup by existing data and make new zip
    const caseTitle = `Cypress test: Decision postponing - ${currentTimestamp()}`;
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: perform postpone action of agendaitem - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het uitstellen van een agendaitem / beslissing';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
    });

    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveDesignAgenda();
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.postpone).click();
    cy.get(utils.vlModal.dialogWindow).should('not.exist', {
      timeout: 5000,
    });
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.retracted).should('have.length', 1);
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.advance).click();
    cy.get(utils.vlModal.dialogWindow).should('not.exist', {
      timeout: 5000,
    });
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.retracted).should('have.length', 0);

    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.url().should('contain', '/beslissingen');

    cy.intercept('PATCH', 'agenda-item-treatments/**').as('patchTreatment');
    cy.get(agenda.agendaitemDecision.edit).click();
    cy.get(agenda.agendaitemDecisionEdit.resultContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger).scrollIntoView()
        .click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Uitgesteld')
      .scrollIntoView()
      .click();
    cy.get(agenda.agendaitemDecisionEdit.save).click()
      .wait('@patchTreatment');

    // NOTE: right now, changing the status of the treatment does not change the retracted attribute of agendaitem
    // so clicking "uitstellen" should be followed by manually setting the "uitgesteld" status on treatment
    // perhaps in the future this will be a feature
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaDetailSidebar.subitem).get(agenda.agendaDetailSidebarItem.retracted)
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

  it('should check if there is a decision on the report of previous agenda with status Approved', () => {
    cy.openAgendaForDate(agendaDate);
    cy.get(agenda.agendaOverviewItem.subitem).eq(0)
      .click();
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.decisionResultPill.pill).contains('Goedgekeurd');
  });

  it.only('should check if there is a decision on the report of previous agenda with status Approved', () => {
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const decicionTypes = [
      'Akte genomen',
      'Goedgekeurd',
      'Uitgesteld',
      'Ingetrokken'
    ];
    cy.openAgendaForDate(agendaDate);
    cy.get(agenda.agendaOverviewItem.subitem).eq(0)
      .click();
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.agendaitemDecision.container).as('decision');
    cy.get('@decision').should('have.length', 1);
    // check if no delete when only one decision
    cy.get('@decision').eq(0)
      .within(() => {
        cy.get(utils.dropdownMenu.options).should('not.exist');
      });
    // add decision without file
    cy.get(route.agendaitemDecisions.addTreatment).click();
    cy.get('@decision').should('have.length', 2);
    // remove decision without file
    cy.get('@decision').eq(0)
      .within(() => {
        cy.get(utils.dropdownMenu.options).click();
        cy.get(agenda.agendaitemDecision.delete).click();
      });
    cy.intercept('DELETE', '/agenda-item-treatments/*').as('deleteDecision');
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@deleteDecision');
    cy.get(agenda.agendaitemDecision.uploadFile).as('decisionList');
    cy.get('@decision').should('have.length', 1);
    // add decision with file
    cy.get(route.agendaitemDecisions.addTreatment).click();
    cy.get('@decision').should('have.length', 2);
    cy.get(agenda.agendaitemDecision.uploadFile).eq(0)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(utils.vlModalFooter.save).click();
    // remove decision with file
    cy.get('@decision').eq(0)
      .within(() => {
        cy.get(utils.dropdownMenu.options).click();
        cy.get(agenda.agendaitemDecision.delete).click();
      });
    cy.intercept('GET', '/document-types?**').as('getDocumentTypes');
    cy.intercept('GET', '/agenda-item-treatments?filter**').as('filterDecision');
    cy.get(utils.vlModalVerify.save).click();
    // TODO better waits?
    cy.wait('@deleteDecision');
    cy.wait('@getDocumentTypes');
    cy.wait('@filterDecision');
    cy.get('@decision').should('have.length', 1);
    // switch between all decision results
    decicionTypes.forEach((type) => {
      cy.get('@decision').eq(0)
        .find(agenda.agendaitemDecision.edit)
        .click();
      cy.get(dependency.emberPowerSelect.trigger).click();
      cy.get(dependency.emberPowerSelect.option).contains(type)
        .click();
      cy.get(agenda.agendaitemDecisionEdit.save).click();
      cy.get(agenda.decisionResultPill.pill).contains(type);
    });
  });
});
