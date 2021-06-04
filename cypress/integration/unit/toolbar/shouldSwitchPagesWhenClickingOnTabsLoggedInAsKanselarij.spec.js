/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import toolbar from '../../../selectors/toolbar.selectors';
import settings from '../../../selectors/settings.selectors';
import cases from '../../../selectors/case.selectors';
import route from '../../../selectors/route.selectors';
import newsletter from '../../../selectors/newsletter.selector';

context('Testing the toolbar as Kanselarij user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Kanselarij');
    cy.visit('/');
  });

  // TODO test url after clicking instead of other titles not existing

  it('Should have meeting, Case, Newsletter, Settings in toolbar', () => {
    cy.get(toolbar.mHeader.agendas).should('exist');
    cy.get(toolbar.mHeader.cases).should('exist');
    cy.get(toolbar.mHeader.newsletters).should('exist');
    cy.get(toolbar.mHeader.settings).should('exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as Kanselarij', () => {
    cy.get(toolbar.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');
    cy.get(cases.casesHeader.title).should('not.exist');
    cy.get(newsletter.overviewTitle).should('not.exist');
  });

  it('Should switch to cases tab when cases is clicked as Kanselarij', () => {
    cy.get(toolbar.mHeader.cases).click();
    cy.get(route.agendas.title).should('not.exist');
    cy.get(cases.casesHeader.title).should('exist');
    cy.get(newsletter.overviewTitle).should('not.exist');
    cy.get(settings.settings.generalSettings).should('not.exist');
  });

  it('Should switch to newsletter tab when newsletter is clicked as Kanselarij', () => {
    cy.get(toolbar.mHeader.newsletters).click();
    cy.get(route.agendas.title).should('not.exist');
    cy.get(cases.casesHeader.title).should('not.exist');
    cy.get(newsletter.title).should('exist');
    cy.get(settings.settings.generalSettings).should('not.exist');
  });

  it('Should switch to settings tab when settings is clicked as Kanselarij', () => {
    cy.get(toolbar.mHeader.settings).click();
    cy.get(route.agendas.title).should('not.exist');
    cy.get(cases.casesHeader.title).should('not.exist');
    cy.get(newsletter.overviewTitle).should('not.exist');
    cy.get(settings.settings.generalSettings).should('exist');
    cy.get(settings.settings.manageMinisters).should('exist');
    cy.get(settings.settings.manageUsers).should('exist');
  });
});
