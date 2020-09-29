/* global context, before, it, cy,beforeEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import modal from '../../selectors/modal.selectors';
import document from '../../selectors/document.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Add files to an agenda', () => {
  const agendaDate = Cypress.moment().add(1, 'weeks')
    .day(2); // Next friday

  before(() => {
    cy.server();
    cy.resetCache();
    // cy.login('Admin');
    // cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    // cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
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
    cy.createCase(false, caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
    });
    // cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaitemDecisionTab).click();
    // 1 default item treatment exists
    cy.get(agenda.uploadDecisionFile).click();

    cy.contains('Documenten opladen').click();
    cy.get(modal.baseModal.dialogWindow).as('fileUploadDialog');

    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.get(document.modalPieceDelete).click();
    cy.wait('@deleteFile', {
      timeout: 12000,
    });
    cy.get(modal.baseModal.dialogWindow).contains('test')
      .should('not.exist');

    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.route('POST', 'pieces').as('createNewPiece');
    cy.route('POST', 'document-containers').as('createNewDocumentContainer');
    cy.route('PATCH', 'agenda-item-treatments/**').as('patchTreatments');
    cy.route('DELETE', 'pieces/*').as('deletePiece');
    cy.route('DELETE', 'document-containers/*').as('deleteDocumentContainer');

    cy.get(form.formSave).click();

    cy.wait('@createNewPiece', {
      timeout: 12000,
    });
    cy.wait('@createNewDocumentContainer', {
      timeout: 12000,
    });
    cy.wait('@patchTreatments', {
      timeout: 12000,
    });

    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards');
    });

    cy.get('@docCards').should('have.length', 1);

    cy.addNewPieceToSignedDocumentContainer('test', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });

    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get('.vl-title--h6 > span').contains(/BIS/);
        cy.get('.ki-more').click();
      });
    cy.get('.vlc-dropdown-menu').within(() => {
      cy.get('.vl-u-text--error').contains('Document verwijderen')
        .click();
    });
    cy.get('.vl-modal').within(() => {
      cy.get('button').contains('Verwijderen')
        .click();
    });

    cy.wait('@deleteFile', {
      timeout: 20000,
    });
    cy.wait('@deletePiece', {
      timeout: 20000,
    });
    cy.wait('@deleteDocumentContainer', {
      timeout: 20000,
    });

    cy.get('@docCards').should('have.length', 0);
  });

  it('should postpone an agendaitem and change the status of the treatment', () => {
    // TODO replace setup by existing data and make new zip
    const caseTitle = `Cypress test: Decision postponing - ${currentTimestamp()}`;
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: perform postpone action of agendaitem - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het uitstellen van een agendaitem / beslissing';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitle);
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
    cy.get(modal.agenda.approveAgenda).should('not.exist');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.postponeAgendaitemButton).click();
    cy.get(modal.baseModal.dialogWindow).should('not.exist', {
      timeout: 5000,
    });
    cy.get(agenda.agendaDetailSidebarSubitem).get('.vlc-u-opacity-lighter');
    cy.get(agenda.revertPostponeAgendaitemButton).click();
    cy.get(modal.baseModal.dialogWindow).should('not.exist', {
      timeout: 5000,
    });
    cy.get(agenda.agendaDetailSidebarSubitem).get('.vlc-u-opacity-lighter')
      .should('not.exist');

    cy.get(agenda.agendaitemDecisionTab).click();
    cy.url().should('contain', '/beslissingen');

    cy.route('PATCH', 'agenda-item-treatments/**').as('patchTreatment');
    cy.contains('Wijzigen').click();
    cy.get('.vl-form__group').within(() => {
      cy.get(agenda.decisionPowerSelectContainer).should('exist')
        .should('be.visible')
        .within(() => {
          cy.get('.ember-power-select-trigger').scrollIntoView()
            .click();
        });
    });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Uitgesteld').scrollIntoView()
          .click();
      });
    cy.contains('Opslaan').click()
      .wait('@patchTreatment');

    // TODO right now, changing the status of the treatment does not change the retracted attribute of agendaitem
    // so clicking "uitstellen" should be followed by manually setting the "uitgesteld" status on treatment
    // perhaps in the future this will be a feature
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaDetailSidebarSubitem).get('.vlc-u-opacity-lighter')
      .should('not.exist');
    cy.get(agenda.toProcedureStapLink).contains('Naar procedurestap')
      .click();
    cy.get('.vlc-status-timeline > li').eq(0)
      .contains(/Ingediend voor agendering op/);
    cy.get('.vlc-status-timeline > li').eq(1)
      .contains(/Geagendeerd op de agenda van/);
    cy.get('.vlc-status-timeline > li').eq(2)
      .contains(/Uitgesteld op de agenda van/);
    cy.get('.vlc-status-timeline > li').eq(3)
      .contains(/Er is beslist om dit agendapunt uit te stellen/);
  });
});
