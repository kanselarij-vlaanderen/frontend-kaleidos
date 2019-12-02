/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('Formally ok/nok tests', () => {
  const testStart = Cypress.moment();

  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);

  before(() => {
    cy.server();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should not show "formallyOk" status of agendaitems on approved agenda', () => {
    cy.openAgendaForDate(agendaDate);
    cy.setFormalOkOnAllItems();
    cy.approveDesignAgenda();

    cy.get('.vlc-agenda-items__sub-item').should('have.length', 1);
    cy.get('.vlc-agenda-items__status').should('contain','Formeel OK');
    cy.get('.vlc-side-nav-item').as('agendas');
    cy.get('@agendas').eq(1).click();
    cy.wait(1000); //Make sure the formally ok can load (false positive if testing immediately)
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 1);
    cy.get('.vlc-agenda-items__status').should('not.contain', 'Formeel OK');
  });

  after(() => {
    cy.task('deleteProgress', { date: testStart.format('YYYY-MM-DD'), time: testStart.toISOString() });
  })
});
