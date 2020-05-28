/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import toolbar from "../../../selectors/toolbar.selectors";
import settings from "../../../selectors/settings.selectors";
import cases from "../../../selectors/case.selectors";
import agenda from "../../../selectors/agenda.selectors";
import newsletter from "../../../selectors/newsletter.selector";

context('Testing the toolbar as user user', () => {

  beforeEach(() => {
    cy.server();
    cy.login('User');
    cy.visit('/');
  });

  it('Should have meeting, Case, Newsletter in toolbar', () => {
    cy.get(toolbar.agenda).should('exist');
    cy.get(toolbar.cases).should('exist');
    cy.get(toolbar.newsletters).should('exist');
    cy.get(toolbar.settings).should('not.exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as user', () => {
    cy.get(toolbar.agenda).click();
    cy.get(agenda.overviewTitle).should('exist');
    cy.get(cases.casesOverviewTitle).should('not.exist');
    cy.get(newsletter.overviewTitle).should('not.exist');
    cy.get(toolbar.settings).should('not.exist');
  });

  it('Should switch to cases tab when cases is clicked as user', () => {
    cy.get(toolbar.cases).click();
    cy.get(agenda.overviewTitle).should('not.exist');
    cy.get(cases.casesOverviewTitle).should('exist');
    cy.get(newsletter.overviewTitle).should('not.exist');
    cy.get(settings.generalSettings).should('not.exist');
    cy.get(toolbar.settings).should('not.exist');
  });

  it('Should switch to newsletter tab when newsletter is clicked as user', () => {
    cy.get(toolbar.newsletters).click();
    cy.get(agenda.overviewTitle).should('not.exist');
    cy.get(cases.casesOverviewTitle).should('not.exist');
    cy.get(newsletter.title).should('exist');
    cy.get(settings.generalSettings).should('not.exist');
    cy.get(toolbar.settings).should('not.exist');
  });
});
