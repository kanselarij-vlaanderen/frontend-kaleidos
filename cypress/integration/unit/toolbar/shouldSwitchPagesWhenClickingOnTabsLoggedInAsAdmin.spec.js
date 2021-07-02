/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import utils from '../../../selectors/utils.selectors';
import settings from '../../../selectors/settings.selectors';
import cases from '../../../selectors/case.selectors';
import newsletter from '../../../selectors/newsletter.selectors';
import route from '../../../selectors/route.selectors';

context('Testing the toolbar as Admin user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.visit('/');
  });

  it('Should have publications, meeting, Case, Newsletter, search and Settings in toolbar', () => {
    cy.get(utils.mHeader.publications).should('exist');
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('exist');
    cy.get(utils.mHeader.search).should('exist');
    cy.get(utils.mHeader.settings).should('exist');
  });

  it('Should switch to Publications tab when publications is clicked', () => {
    cy.get(utils.mHeader.publications).click();
    cy.get(route.publications.title).should('exist');
    cy.url().should('include', 'publicaties');
  });

  it('Should switch to Agenda tab when agenda is clicked', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');
    cy.url().should('include', 'overzicht');
  });

  it('Should switch to cases tab when cases is clicked', () => {
    cy.get(utils.mHeader.cases).click();
    cy.get(cases.casesHeader.title).should('exist');
    cy.url().should('include', '/dossiers');
  });

  it('Should switch to newsletter tab when newsletter is clicked', () => {
    cy.get(utils.mHeader.newsletters).click();
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', '/kort-bestek');
  });

  it('Should switch to search tab when search is clicked', () => {
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.title).should('exist');
    cy.url().should('include', '/zoeken');
  });

  it('Should switch to settings tab when settings is clicked', () => {
    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.generalSettings).should('exist');
    cy.get(settings.settings.manageMinisters).should('exist');
    cy.get(settings.settings.manageUsers).should('exist');
    cy.url().should('include', '/instellingen/overzicht');
  });
});
