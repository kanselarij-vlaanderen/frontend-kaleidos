/*global context, it, cy,beforeEach*/
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
    cy.openAgenda(1,"13 januari 2020", "10:00");
    cy.openActionModal();
  });
});
