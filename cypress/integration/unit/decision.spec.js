/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import modal from '../../selectors/modal.selectors';
import document from "../../selectors/document.selectors";

context('Add files to an agenda', () => {
  const agendaDate = Cypress.moment().add(1, 'weeks').day(2); // Next friday

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  xit('should test the document CRUD for a decision', () => {
    const caseTitle = 'Cypress test: Decision documents - ' + currentTimestamp();
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: perform CRUD of documents on decision - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toevoegen van een beslissingsfiche en algemene CRUD operaties van deze fiche';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf'};
    cy.createCase(false, caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);

    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaItemDecisionTab).click();
    cy.get(agenda.addDecision).click();
    cy.get(agenda.uploadDecisionFile).click();

    cy.contains('Documenten opladen').click();
    cy.get(modal.baseModal.dialogWindow).as('fileUploadDialog');

    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.get(document.modalDocumentVersionDelete).click();
    cy.wait('@deleteFile',{timeout: 12000});
    cy.get(modal.baseModal.dialogWindow).contains('test').should('not.exist');

    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.route('POST', 'document-versions').as('createNewDocumentVersion');
    cy.route('POST', 'documents').as('createNewDocument');
    cy.route('PATCH', 'decisions/**').as('patchDecision');
    cy.route('DELETE', 'document-versions/*').as('deleteVersion');
    cy.route('DELETE', 'documents/*').as('deleteDocument');

    cy.get(form.formSave).click();

    cy.wait('@createNewDocumentVersion', { timeout: 12000 });
    cy.wait('@createNewDocument', { timeout: 12000 });
    cy.wait('@patchDecision', { timeout: 12000 });

    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards');
    });

    cy.get('@docCards').should('have.length', 1);

    cy.addNewDocumentVersionToSignedDocument('test', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});

    cy.get('@docCards').eq(0).within(() => {
      cy.get('.vl-title--h6 > span').contains(/BIS/);
      cy.get('.vl-vi-nav-show-more-horizontal').click();
    });
    cy.get('.vlc-dropdown-menu').within(() => {
      cy.get('.vl-u-text--error').contains('Document verwijderen').click();
    });
    cy.get('.vl-modal').within(() => {
      cy.get('button').contains('Verwijderen').click();
    });

    cy.wait('@deleteFile', { timeout: 20000 });
    cy.wait('@deleteVersion', { timeout: 20000 });
    cy.wait('@deleteDocument', { timeout: 20000 });

    cy.get('@docCards').should('have.length', 0);

    // TODO, this delete of decision could have a seperate test, but the setup is 99% the same as this test
    cy.get('.vl-typography > .vl-u-display-flex').within(() => {
      cy.get('.vl-vi-nav-show-more-horizontal').click();
    });
    cy.get(agenda.deleteDecision).click();
    cy.get('.vl-modal').within(() => {
      cy.get('button').contains('Verwijderen').click();
    });

    cy.get(modal.verify.container).should('not.exist');
    cy.get('.toasts-container > .vl-alert--error' , { timeout: 12000 }).should('not.exist');
    cy.get(agenda.decisionContainer).should('not.exist');
  });

});

function currentTimestamp() {
  return Cypress.moment().unix();
}
