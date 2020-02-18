/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import {
  agendaSelector,
  casesSelector,
  newslettersSelector,
  settingsSelector
} from "../../../selectors/toolbar/toolbarSelectors";
import {agendaOverviewTitleSelector} from "../../../selectors/agenda/agendaSelectors";
import {
  newslettersTitleSelector
} from "../../../selectors/newsletters/newsletterSelector";
import {
  generalSettingsSelector,
  manageMinistersSelector,
  manageUsersSelector
} from "../../../selectors/settings/settingsSelectors";
import {casesOverviewTitleSelector} from "../../../selectors/cases/caseSelectors";


context('Testing the toolbar as Kanselarij user', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Kanselarij');
  });

  it('Should have meeting, Case, Newsletter, Settings in toolbar', () => {
    cy.get(agendaSelector).should('exist');
    cy.get(casesSelector).should('exist');
    cy.get(newslettersSelector).should('exist');
    cy.get(settingsSelector).should('exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as Kanselarij', () => {
    cy.get(agendaSelector).click();
    cy.get(agendaOverviewTitleSelector).should('exist');
    cy.get(casesOverviewTitleSelector).should('not.exist');
    cy.get(newslettersTitleSelector).should('not.exist');
  });

  it('Should switch to cases tab when cases is clicked as Kanselarij', () => {
    cy.get(casesSelector).click();
    cy.get(agendaOverviewTitleSelector).should('not.exist');
    cy.get(casesOverviewTitleSelector).should('not.exist');
    cy.get(newslettersTitleSelector).should('not.exist');
    cy.get(generalSettingsSelector).should('not.exist');
  });

  it('Should switch to newsletter tab when newsletter is clicked as Kanselarij', () => {
    cy.get(newslettersSelector).click();
    cy.get(agendaOverviewTitleSelector).should('not.exist');
    cy.get(casesOverviewTitleSelector).should('not.exist');
    cy.get(newslettersTitleSelector).should('exist');
    cy.get(generalSettingsSelector).should('not.exist');
  });

  it('Should switch to settings tab when settings is clicked as Kanselarij', () => {
    cy.get(settingsSelector).click();
    cy.get(agendaOverviewTitleSelector).should('not.exist');
    cy.get(casesOverviewTitleSelector).should('not.exist');
    cy.get(newslettersTitleSelector).should('not.exist');
    cy.get(generalSettingsSelector).should('exist');
    cy.get(manageMinistersSelector).should('exist');
    cy.get(manageUsersSelector).should('exist');
  });
});
