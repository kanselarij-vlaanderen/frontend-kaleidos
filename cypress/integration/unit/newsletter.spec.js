/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

context('Test the KB functionality', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.login('Admin');
  });

  xit('should test the newsletter of an agenda', () => {
    const agendaDate = Cypress.moment().add(3, 'weeks').day(4); // Next friday

    cy.createAgenda('Ministerraad', agendaDate, 'Test Kort bestek toevoegen').then((data) => {
      cy.visit(`/vergadering/${data[0]}/agenda/${data[1]}/agendapunten`);

      //WIP

      cy.deleteAgenda(data[0], true);
    });
  });
});
