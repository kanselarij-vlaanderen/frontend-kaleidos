/*global context, it, cy, Cypress, beforeEach*/
/// <reference types="Cypress" />


context('Open Action model in agenda', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should click on Action button and show the possabilities for the user Admin', () => {
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE);
    const agendaDate = Cypress.moment("2020-01-13").set({"hour": 10, "minute": 10});
    cy.openAgendaForDate(agendaDate);
    cy.openActionModal();
  });
});
