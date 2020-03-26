/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />

context('Show warning in newsletterinfo', () => {

  //TODO: Create agenda
  //TODO: Create procedurestap
  //TODO: Add procedurestap to agenda
  //TODO: Switch to kortbestek tab
  //TODO: Warning should be there

  before(() => {
    cy.server();
    cy.resetDB();
  });

  it('Should show warning in kortbestek view', () => {

  })

});
