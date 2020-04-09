/*global context, before, it, cy, Cypress, beforeEach*/
/// <reference types="Cypress" />


context('Agenda tests', () => {

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('STEP 1', () => {
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
