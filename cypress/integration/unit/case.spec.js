/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />


context('Case test', () => {

  before(() => {
    cy.resetDB();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should create a new case', () => {
    const caseTitleShort= 'Cypress test: new case - ' + cy.currentTimestamp();
    cy.createCase(false, caseTitleShort);

  });
});
