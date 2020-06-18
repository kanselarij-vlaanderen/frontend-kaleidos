/* global context, it, cy, before, beforeEach */
/// <reference types="Cypress" />

context('NewsletterInfo: Switching the finished switch', () => {
  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.visit('/');
  });

  const goToKortBestek = () => {
    cy.log('going to kort bestek');
    cy.route('GET', '/themes').as('getThemes');
    cy.visit('/overzicht/5EBA9588751CF70008000012/kort-bestek/5EBA9589751CF70008000013/agendapunten');
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.wait('@getThemes');
    cy.log('went to kort bestek');
  };

  it('Should switch the switch to the right', () => {
    goToKortBestek();
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click();
  });

  it('Should switch the switch to the right, then to the left', () => {
    goToKortBestek();
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click(); // TODO, clicking the switch triggers a PATCH call, wait for that instead
    cy.wait(3000);
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.');
    // cy.wait('@getThemes');
    cy.get('.vl-checkbox--switch__label').last().scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last().click();
  });
});
