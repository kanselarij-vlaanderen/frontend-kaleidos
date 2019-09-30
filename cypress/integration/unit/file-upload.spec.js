/// <reference types="Cypress" />

context('Add files to an agenda', () => {
    beforeEach(() => {
      cy.login('Admin')
    });
  
    it('should open an agenda and add documents to it', () => {
      cy.server();
      cy.route('POST', '/agendas').as('createNewAgenda');
      cy.route('POST', '/agendaitems').as('createNewAgendaItems');

  
      const plusMonths = 1;
      const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 18).set('hour', 18).set('minute', 18);

      cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
        cy.get('.vl-alert').contains('Gelukt');
        cy.wait('@createNewAgenda',{ timeout: 20000 });
        cy.wait('@createNewAgendaItems',{ timeout: 20000 });

        cy.openAgendaForDate(agendaDate);
        
        cy.addDocVersion([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'}]);
        // cy.addDocVersion([{folder: 'files', fileName: 'test', fileExtension: 'txt', newFileName: 'testtxt', fileType: 'Decreet'}]);
    
        cy.deleteAgenda(agendaDate, meetingId);

      });
    });
  });
  