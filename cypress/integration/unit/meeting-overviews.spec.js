/* global context, before, it, cy,beforeEach */
// / <reference types="Cypress" />

context('Test print overviews', () => {
  const notule = '/overzicht/5DD7CDA58C70A70008000001/notulen/5DD7CDA58C70A70008000002/agendapunten';
  const beslissingen = '/overzicht/5DD7CDA58C70A70008000001/beslissingen/5DD7CDA58C70A70008000002/agendapunten';
  const persAgenda = '/overzicht/5DD7CDA58C70A70008000001/persagenda/5DD7CDA58C70A70008000002/agendapunten';

  before(() => {
    cy.server();
    cy.login('Admin');
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should visit notule print overview', () => {
    cy.visit(notule);
    cy.wait(1500);
  });

  it('should visit beslissingen print overview', () => {
    cy.visit(beslissingen);
    cy.wait(1500);
  });

  it('should visit persAgenda print overview', () => {
    cy.visit(persAgenda);
    cy.wait(1500);
  });
});
