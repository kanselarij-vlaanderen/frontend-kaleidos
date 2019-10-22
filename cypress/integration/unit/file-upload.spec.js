/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('Add files to an agenda', () => {
  before(() => {
    cy.server();
  });
  
  beforeEach(() => {
    cy.login('Admin');
  });

  it('should open an agenda and add documents to it', () => {
    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 18).set('hour', 18).set('minute', 18);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);
      
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'}]);
      cy.addNewDocumentVersion('test pdf', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});
  
      cy.deleteAgenda(meetingId, true);
    });
  });

  it('should add several documents that should be sorted', () => {
    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 19).set('hour', 19).set('minute', 19);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);
      
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2018 1010 DOC.0005/1 - 2e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/1 - 3e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/3 - 5e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-4 - 6e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005/2 - 4e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0004/1 - 7e', fileType: 'Nota'}]);
      cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'no vr number - 1e', fileType: 'Nota'}]);
  
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
        })
      });
      cy.deleteAgenda(meetingId, true);
    });
  })
});
  