/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />

context('Agenda tests', () => {

  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });
  // TODO there is no verification if the correct kind of agenda was saved as expected.

  it('should create a new agenda of kind ministerraad with 2020-01-13 10:00 as startdate and Brussel as place', () => {
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE)
  });

  it('should create a new agenda of kind Elektronische procedure with 2020-01-13 10:00 as startdate and Brussel as place', () => {
    const PLACE = 'Brussel';
    const KIND = 'Elektronische procedure';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE)
  });

  it('should create a new agenda of kind Bijzondere ministerraad with 2020-01-13 10:00 as startdate and Brussel as place', () => {
    const PLACE = 'Brussel';
    const KIND = 'Bijzondere ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE)
  });

});
