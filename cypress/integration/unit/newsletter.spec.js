/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

context('Test the KB functionality', () => {
    before(() => {
      cy.server();
      cy.resetDB();
    });

    beforeEach(() => {
      cy.login('Admin');
    });

    it('should test the newsletter of an agenda', () => {
      const plusMonths = 1;
      const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 18).set('hour', 18).set('minute', 18);

      cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test Kort bestek toevoegen').then((meetingId) => {
        cy.openAgendaForDate(agendaDate,meetingId);

        //WIP

        cy.deleteAgenda(meetingId,true);
      });
    });
  });
