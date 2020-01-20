/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('NewsletterInfo: Switching the finished switch', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should switch the switch to the right', () => {
    cy.get('.vl-tab > a')
      .contains('Kort bestek').click();
    cy.route('GET', '/meetings/**').as('getMeetings');
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.route('GET', '/themes').as('getThemes');
    cy.wait('@getMeetings');
    cy.get('.data-table > tbody > tr').first().click();
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.wait('@getThemes');
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click();
  });

  it('Should switch ther switch to the right, then to the left', () => {
    cy.get('.vl-tab > a')
      .contains('Kort bestek').click();
    cy.route('GET', '/meetings/**').as('getMeetings');
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.route('GET', '/themes').as('getThemes');
    cy.wait('@getMeetings');
    cy.get('.data-table > tbody > tr').first().click();
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.wait('@getThemes');
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click();
    cy.wait(3000);
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.wait('@getThemes');
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click();
  });
});
