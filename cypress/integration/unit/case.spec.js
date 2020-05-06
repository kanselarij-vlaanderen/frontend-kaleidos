/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />


context('Case test', () => {

  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should create a new case', () => {
    const caseTitleShort= 'Cypress test: new case - ' + currentTimestamp();
    cy.createCase(false, caseTitleShort);

  });
  
  function currentTimestamp() {
    return Cypress.moment().unix();
  }
});
