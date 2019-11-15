/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('meeting actions tests', () => {

  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 12).set('hour', 20).set('minute', 20);
  const caseTitle = 'Cypress test: meeting actions - ' + currentTimestamp();

  before(() => {
    cy.server();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.createCase(false, caseTitle);

    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  xit('should perform action delete agenda', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: delete agenda - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het verwijderen van een agenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 12).set('hour', 20).set('minute', 20);
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addAgendaitemToAgenda(SubcaseTitleShort, false);

      cy.setFormalOkOnAllItems();
      cy.approveDesignAgenda();
      //verify stuff on design agenda and agenda A
      cy.deleteAgenda(meetingId); 
      //verify stuff on Agenda A 
      //verify subcase is still ok

      cy.deleteAgenda(meetingId,true);
    });
  });

  xit('should perform action close agenda', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: close agenda - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het sluiten van een agenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 13).set('hour', 20).set('minute', 20);
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addAgendaitemToAgenda(SubcaseTitleShort, false);

      cy.setFormalOkOnAllItems();
      cy.approveDesignAgenda();
      // verify stuff on design agenda and agenda A
      // cy .close meeting
      // close the agenda and verify stuff on agenda A 
      //verify subcase is still ok

      cy.deleteAgenda(meetingId); 
      cy.deleteAgenda(meetingId,true);
    });
  });


  after(() => {

  });
});

function currentTimestamp() {
  return Cypress.moment().unix();
}