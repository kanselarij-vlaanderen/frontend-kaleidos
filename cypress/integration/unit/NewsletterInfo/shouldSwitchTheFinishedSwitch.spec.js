/*global context, it, cy, before, beforeEach*/
/// <reference types="Cypress" />


context('NewsletterInfo: Switching the finished switch', () => {

  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should switch the switch to the right', () => {
    cy.route('GET', '/meetings/**').as('getMeetings');
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.route('GET', '/themes').as('getThemes');
    cy.get('.vl-tab > a')
      .contains('Kort bestek').click();
    cy.wait('@getMeetings');
    cy.get('.data-table > tbody > tr').first().click(); //TODO this test could fail if more data is in the default test set, search for specific date
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.wait('@getThemes');
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click();
  });

  it('Should switch the switch to the right, then to the left', () => {
    cy.route('GET', '/meetings/**').as('getMeetings');
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.route('GET', '/themes').as('getThemes');
    cy.get('.vl-tab > a')
      .contains('Kort bestek').click();
    cy.wait('@getMeetings');
    cy.get('.data-table > tbody > tr').first().click(); //TODO this test could fail if more data is in the default test set, search for specific date
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.wait('@getThemes');
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click(); //TODO, clicking the switch triggers a PATCH call, wait for that instead
    cy.wait(3000);
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.');
    // cy.wait('@getThemes');
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click();
  });
});
