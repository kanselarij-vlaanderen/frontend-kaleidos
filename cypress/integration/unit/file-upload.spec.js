/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

context('Add files to an agenda', () => {
  before(() => {
    cy.server();
    cy.resetDB();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should open an agenda and add documents to it', () => {
    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 18).set('hour', 18).set('minute', 18);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'}]);
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains('test pdf');
        });
      });

      cy.addNewDocumentVersion('test pdf', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(/BIS/);
        });
      });

      cy.addNewDocumentVersion('test pdf', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(/TER/);
        });
      });
    });
  });

  it('should add several documents that should be sorted', () => {
    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 19).set('hour', 19).set('minute', 19);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2018 1010 DOC.0005/1 - 2e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/1 - 3e', fileType: 'Nota'}]);
      cy.addDocuments(
        [
        {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0004/1 - 7e', fileType: 'Nota'},
        {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'no vr number - 1e', fileType: 'Nota'},
        {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/2 - 4e', fileType: 'Nota'},
        {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-4 - 6e', fileType: 'Nota'},
        {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/3 - 5e', fileType: 'Nota'}
        ]
      );

      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').as('docCards');
        cy.get('@docCards').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(/1e/);
        });
        cy.get('@docCards').eq(1).within(() => {
          cy.get('.vl-title--h6 > span').contains(/2e/);
        });
        cy.get('@docCards').eq(2).within(() => {
          cy.get('.vl-title--h6 > span').contains(/3e/);
        });
        cy.get('@docCards').eq(3).within(() => {
          cy.get('.vl-title--h6 > span').contains(/4e/);
        });
        cy.get('@docCards').eq(4).within(() => {
          cy.get('.vl-title--h6 > span').contains(/5e/);
        });
        cy.get('@docCards').eq(5).within(() => {
          cy.get('.vl-title--h6 > span').contains(/6e/);
        });
        cy.get('@docCards').eq(6).within(() => {
          cy.get('.vl-title--h6 > span').contains(/7e/);
        });
      });
    });
  });

  it('should delete documents, document-versions and files', () => {
    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 20).set('hour', 20).set('minute', 20);
    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.route('DELETE', 'document-versions/*').as('deleteVersion');
    cy.route('DELETE', 'documents/*').as('deleteDocument');


    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten verwijderen').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/1 - 1e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/2 - 2e', fileType: 'Nota'}]);

      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').as('docCards');
      });
      cy.get('@docCards').should('have.length', 2);
      cy.get('@docCards').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(/1e/);
        cy.get('.vl-vi-nav-show-more-horizontal').click();
      });
      cy.get('.vl-popover__link-list').within(() => {
        cy.get('.vl-u-text--error').contains('Document verwijderen').click();
      });
      cy.get('.vl-modal').within(() => {
        cy.get('button').contains('Verwijderen').click();
      });
      cy.wait('@deleteFile', { timeout: 12000 });
      cy.wait('@deleteVersion', { timeout: 12000 });
      cy.wait('@deleteDocument', { timeout: 12000 });

      cy.get('@docCards').should('have.length', 1);
      cy.get('@docCards').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(/2e/);
        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').eq(0).within(() => {
          cy.get('.vl-vi-trash').click();
        });
      });
      cy.get('.vl-modal').within(() => {
        cy.get('button').contains('Verwijderen').click();
      });
      cy.wait('@deleteFile', { timeout: 12000 });
      cy.wait('@deleteVersion', { timeout: 12000 });
      cy.wait('@deleteDocument', { timeout: 12000 });

      cy.get('@docCards').should('have.length', 0);

      cy.deleteAgenda(meetingId, true);
    });
  });
});
