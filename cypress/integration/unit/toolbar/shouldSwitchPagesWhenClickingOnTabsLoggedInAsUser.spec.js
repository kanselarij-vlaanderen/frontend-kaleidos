/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import utils from '../../../selectors/utils.selectors';
import route from '../../../selectors/route.selectors';

context('Testing the toolbar as user user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('User');
    cy.visit('/');
  });

  it('Should have publications, meeting, Case and search in toolbar', () => {
    cy.get(utils.mHeader.publications).should('exist');
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('not.exist');
    cy.get(utils.mHeader.search).should('exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as user', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.get(route.accountlessUsers.title).should('exist');
    cy.url().should('include', 'onbevoegde-gebruiker');
  });

  it('Should switch to cases tab when cases is clicked as user', () => {
    cy.get(utils.mHeader.cases).click();
    cy.get(route.accountlessUsers.title).should('exist');
    cy.url().should('include', 'onbevoegde-gebruiker');
  });

  it('Should switch to search tab when search is clicked as user', () => {
    cy.get(utils.mHeader.search).click();
    cy.get(route.accountlessUsers.title).should('exist');
    cy.url().should('include', 'onbevoegde-gebruiker');
  });
});
