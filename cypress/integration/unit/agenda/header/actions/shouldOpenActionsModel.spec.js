/* global context, it, cy, Cypress, beforeEach */
/// <reference types="Cypress" />

context('Open Action model in agenda', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should click on Action button and show the possabilities for the user Admin', () => {
    cy.route('/');
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'oktober';
    const YEAR = '2020';
    const DAY = '13';
    // TODO change this: a set date will cause problems when this date is before all existing agendas.
    // createDefaultAgenda waits for the creation of agendaitems, but this only happens when there is at least 1 agenda with an older date then the one created
    // in that case, a "goedkeuring van het verslag van de vorige vergadering" is created.
    cy.createDefaultAgenda(KIND, YEAR, JANUARI, DAY, PLACE);
    const agendaDate = Cypress.moment('2020-10-13').set({ hour: 10, minute: 10 });
    cy.openAgendaForDate(agendaDate);
    cy.openActionModal();
  });
});
