/* global context, before, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import utils from '../../selectors/utils.selectors';

context('Test print overviews', () => {
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

  afterEach(() => {
    cy.logout();
  });

  // TODO assert something? also use the actions from the actions menu from agenda to ensure both visit and action go to the same place?

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
