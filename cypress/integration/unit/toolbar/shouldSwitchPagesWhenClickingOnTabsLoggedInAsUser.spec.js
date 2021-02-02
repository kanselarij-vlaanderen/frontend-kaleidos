/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import toolbar from '../../../selectors/toolbar.selectors';

context('Testing the toolbar as user user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('User');
    cy.visit('/');
  });

  it('Should have meeting, Case, Newsletter in toolbar', () => {
    cy.get(toolbar.agenda).should('exist');
    cy.get(toolbar.cases).should('exist');
    cy.get(toolbar.newsletters).should('not.exist');
    cy.get(toolbar.settings).should('not.exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as user', () => {
    cy.get(toolbar.agenda).click();
    cy.contains('Geen rechten');
    cy.get(toolbar.settings).should('not.exist');
  });

  it('Should switch to cases tab when cases is clicked as user', () => {
    cy.get(toolbar.cases).click();
    cy.contains('Geen rechten');
    cy.get(toolbar.settings).should('not.exist');
  });

  // Users can no longer see newsletters, do we want this ?
  // it('Should switch to newsletter tab when newsletter is clicked as user', () => {
  //   cy.get(toolbar.newsletters).click();
  //   cy.contains('Geen rechten');
  //   cy.get(toolbar.settings).should('not.exist');
  // });
});
