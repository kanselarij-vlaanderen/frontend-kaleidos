/*global context, it, cy, Cypress, beforeEach*/
/// <reference types="Cypress" />

context('Agenda acties testen', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.visit('/');
  });

  it('Create an agenda and open it', () => {
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE);
    const agendaDate = Cypress.moment("2020-01-13").set({"hour": 10, "minute": 10});
    cy.openAgendaForDate(agendaDate);
  });
});
