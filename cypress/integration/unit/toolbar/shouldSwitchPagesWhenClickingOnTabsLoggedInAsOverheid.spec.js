/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import toolbar from '../../../selectors/toolbar.selectors';
import settings from '../../../selectors/settings.selectors';
import cases from '../../../selectors/case.selectors';
import agenda from '../../../selectors/agenda.selectors';
import newsletter from '../../../selectors/newsletter.selector';

context('Testing the toolbar as Overheid user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Overheid');
    cy.visit('/');
  });

  // TODO test url after clicking instead of other titles not existing

  it('Should have meeting, Case, Newsletter in toolbar', () => {
    cy.get(toolbar.mHeader.agendas).should('exist');
    cy.get(toolbar.mHeader.cases).should('exist');
    cy.get(toolbar.mHeader.newsletters).should('exist');
    cy.get(toolbar.mHeader.settings).should('not.exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as overheid', () => {
    cy.get(toolbar.mHeader.agendas).click();
    cy.get(agenda.overviewTitle).should('exist');
    cy.get(cases.casesHeader.overviewTitle).should('not.exist');
    cy.get(newsletter.overviewTitle).should('not.exist');
    cy.get(toolbar.mHeader.settings).should('not.exist');
  });

  it('Should switch to cases tab when cases is clicked as overheid', () => {
    cy.get(toolbar.mHeader.cases).click();
    cy.get(agenda.overviewTitle).should('not.exist');
    // TODO this test is wrong (should fail on this not.exist) but doesn't because not.exist also works whne page is not loaded
    cy.get(cases.casesHeader.overviewTitle).should('not.exist');
    cy.get(newsletter.overviewTitle).should('not.exist');
    cy.get(settings.generalSettings).should('not.exist');
    cy.get(toolbar.mHeader.settings).should('not.exist');
  });

  it('Should switch to newsletter tab when newsletter is clicked as overheid', () => {
    cy.get(toolbar.mHeader.newsletters).click();
    cy.get(agenda.overviewTitle).should('not.exist');
    cy.get(cases.casesHeader.overviewTitle).should('not.exist');
    cy.get(newsletter.title).should('exist');
    cy.get(settings.generalSettings).should('not.exist');
    cy.get(toolbar.mHeader.settings).should('not.exist');
  });
});
