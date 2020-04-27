/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

context('Add files to an agenda', () => {
  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 3).set('hour', 20).set('minute', 20);

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should test the document CRUD for a decision', () => {
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
    cy.agendaItemExists(SubcaseTitleShort).click();
    cy.wait(1000);
    cy.get('.vl-tab > a').contains('Beslissing').click();
    cy.contains('Voeg beslissing toe').click();
    cy.contains('Beslissingsfiche uploaden').click();
    // TODO change to this after merging of KAS-1416
    // cy.get(agenda.agendaItemDecisionTab).click();
    // cy.get(agenda.addDecision).click();
    // cy.get(agenda.uploadDecisionFile).click();

    cy.contains('Documenten opladen').click();
    cy.get('.vl-modal-dialog').as('fileUploadDialog');

    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.route('POST', 'document-versions').as('createNewDocumentVersion');
    cy.route('POST', 'documents').as('createNewDocument');
    cy.route('PATCH', 'decisions/**').as('patchDecision');
    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.route('DELETE', 'document-versions/*').as('deleteVersion');
    cy.route('DELETE', 'documents/*').as('deleteDocument');

    cy.get('[data-test-vl-save]').click();
    // TODO change to this after merging of KAS-1416
    // cy.get(form.formSave).click();

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

  });
});

function currentTimestamp() {
  return Cypress.moment().unix();
}
