/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import utils from '../../selectors/utils.selectors';

context('Test print overviews', () => {
  const beslissingen = '/overzicht/5DD7CDA58C70A70008000001/beslissingen/5DD7CDA58C70A70008000002/agendapunten';
  const persAgenda = '/overzicht/5DD7CDA58C70A70008000001/persagenda/5DD7CDA58C70A70008000002/agendapunten';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should visit beslissingen print overview', () => {
    cy.visit(beslissingen);
    cy.wait(1500);
    cy.get(utils.overviewsHeaderDecision.title).should('contain', '22-04-2020');
    cy.url().should('contain', '/beslissingen');
  });

  it('should visit persAgenda print overview', () => {
    cy.visit(persAgenda);
    cy.wait(1500);
    cy.get(utils.overviewsHeaderPrint.title).should('contain', '22-04-2020');
    cy.url().should('contain', '/persagenda');
  });
});
