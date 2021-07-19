/* global context, xit, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

// import publication from '../../selectors/publication.selectors';

context('Publications documents tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
  });

  afterEach(() => {
    cy.logout();
  });

  xit('placeholder for future tests', () => {
    // TODO-publication adding documents to publication will be refactored and current tests became absolete.
  });
});
