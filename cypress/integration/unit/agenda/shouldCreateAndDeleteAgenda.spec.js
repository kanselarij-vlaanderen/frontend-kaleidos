/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />


context('Agenda tests', () => {

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should create a new agenda of kind ministerraad with 2020-01-13 10:00 as startdate and Brussel as place', () => {
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE);
    cy.openAgenda(1,"13 januari 2020", "10:00");
  });

});
