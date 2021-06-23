/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import utils from '../../../selectors/utils.selectors';

context('Testing the toolbar as user user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('User');
    cy.visit('/');
  });

  // TODO test url after clicking instead of other titles not existing

  it('Should have meeting, Case, Newsletter in toolbar', () => {
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('not.exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as user', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.contains('Geen rechten');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should switch to cases tab when cases is clicked as user', () => {
    cy.get(utils.mHeader.cases).click();
    cy.contains('Geen rechten');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  // Users can no longer see newsletters, do we want this ?
  // it('Should switch to newsletter tab when newsletter is clicked as user', () => {
  //   cy.get(utils.mHeader.newsletters).click();
  //   cy.contains('Geen rechten');
  //   cy.get(utils.mHeader.settings).should('not.exist');
  // });
});
