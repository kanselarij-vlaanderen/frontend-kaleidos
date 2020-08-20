/* global context, it, cy, before, beforeEach */
// / <reference types="Cypress" />

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
    cy.visit('/vergadering/5EBA9588751CF70008000012/kort-bestek');
    cy.get('table > tbody', {
      timeout: 20000,
    });
    cy.log('went to kort bestek');
  };

  it('Should switch the switch to the right', () => {
    cy.route('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    goToKortBestek();
    cy.get('.vl-checkbox--switch__label').last()
      .scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last()
      .click()
      .wait('@patchNewsletterInfo');
  });

  it('Should switch the switch to the right, then to the left', () => {
    cy.route('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    goToKortBestek();
    cy.get('.vl-checkbox--switch__label').last()
      .scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last()
      .click()
      .wait('@patchNewsletterInfo');
    cy.get('.vl-checkbox--switch__label').last()
      .scrollIntoView();
    cy.get('.vl-checkbox--switch__label').last()
      .click()
      .wait('@patchNewsletterInfo');
  });
});
