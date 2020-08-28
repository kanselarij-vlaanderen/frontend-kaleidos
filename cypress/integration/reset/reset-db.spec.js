/* eslint-disable no-undef */
// / <reference types="Cypress" />

context('Reset the database', () => {
  before(() => {
    cy.server();
  });

  it('Reset the database', () => {
    cy.resetCache();
  });
});
