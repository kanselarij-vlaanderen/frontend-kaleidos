/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import cases from '../../selectors/case.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

// *NOTE* Moved to all-flaky-tests because deleting a meeting is not propagated properly in yggdrasil, agendas route no longer loads

context('Testing the application as Overheid user', () => {
  beforeEach(() => {
    cy.login('Overheid');
  });

  // M-header toolbar tests

  it('Should have meeting, Case, Newsletter and search in toolbar', () => {
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.publications).should('not.exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('not.exist');
    cy.get(utils.mHeader.search).should('exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as overheid', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');
    cy.url().should('include', '/overzicht');
  });

  it('Should switch to cases tab when cases is clicked as overheid', () => {
    cy.get(utils.mHeader.cases).click();
    cy.get(cases.casesHeader.title).should('exist');
    cy.url().should('include', '/dossiers');
  });

  it('Should switch to search tab when search is clicked as overheid', () => {
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.title).should('exist');
    cy.url().should('include', '/zoeken');
  });
});
