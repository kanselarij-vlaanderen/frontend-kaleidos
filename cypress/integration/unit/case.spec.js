/* eslint-disable no-undef */
/// <reference types="Cypress" />


context('Case test', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should create a new case', () => {
    const caseTitleShort= 'Cypress test: new case - ' + currentTimestamp();
    cy.createCase(false, caseTitleShort);

  });

});

function currentTimestamp() {
  return Cypress.moment().unix();
}