/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import {
  generalSettingsSelector,
  manageAlertsSelector, manageCaseTypesSelector, manageDocumentTypesSelector,
  manageGovermentDomainsSelector,
  manageGovermentFieldsSelector,
  manageIseCodesSelector,
  manageMinistersSelector, manageSignaturesSelector, manageSubcaseTypesSelector,
  manageUsersSelector
} from "../../../selectors/settings/settingsSelectors";
import {settingsSelector} from "../../../selectors/toolbar/toolbarSelectors";

context('Settings overview page tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/');
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
  });

  it('Should open settings page and see all fields from the general settings tab', () => {
    cy.get(generalSettingsSelector).should('be.visible');
    cy.get(manageMinistersSelector).should('be.visible');
    cy.get(manageUsersSelector).should('be.visible');
    cy.get(manageGovermentDomainsSelector).should('be.visible');
    cy.get(manageGovermentFieldsSelector).should('be.visible');
    cy.get(manageIseCodesSelector).should('be.visible');
    cy.get(manageAlertsSelector).should('be.visible');
    cy.get(manageDocumentTypesSelector).should('be.visible');
    cy.get(manageCaseTypesSelector).should('be.visible');
    cy.get(manageSubcaseTypesSelector).should('be.visible');
    cy.get(manageSignaturesSelector).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.openSettingsModal(manageGovermentDomainsSelector);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage goverment fields and close it', () => {
    cy.openSettingsModal(manageGovermentFieldsSelector);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage ISE codes and close it', () => {
    cy.openSettingsModal(manageIseCodesSelector);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.openSettingsModal(manageAlertsSelector);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage document types and close it', () => {
    cy.openSettingsModal(manageDocumentTypesSelector);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage case types and close it', () => {
    cy.openSettingsModal(manageCaseTypesSelector);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage subcase types and close it', () => {
    cy.openSettingsModal(manageSubcaseTypesSelector);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage signatures and close it', () => {
    cy.openSettingsModal(manageSignaturesSelector);
    cy.closeSettingsModal();
  });
});
