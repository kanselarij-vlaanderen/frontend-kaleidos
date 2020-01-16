/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('Agenda acties testen', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');

  });

  it('Create an agenda and open it', () => {
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE);
    cy.openAgenda(1,'13 januari 2020', '10:00');
  });
});
