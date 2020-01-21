/* eslint-disable no-undef */
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
import {modalDialogSelector} from "../../../selectors/models/modelSelectors";

context('Settings page tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should open settings page and see all fields from the general settings tab', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
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

  it('Should open the model behind manage goverment domains', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageGovermentDomainsSelector);
  });

  it('Should open the model behind manage goverment fields and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageGovermentFieldsSelector);
  });

  it('Should open the model behind manage ISE codes and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageIseCodesSelector);
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageAlertsSelector);
  });

  it('Should open the model behind manage document types and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageDocumentTypesSelector);
  });

  it('Should open the model behind manage case types and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageCaseTypesSelector);
  });

  it('Should open the model behind manage subcase types and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageSubcaseTypesSelector);
  });

  it('Should open the model behind manage signatures and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.openSettingsModal(manageSignaturesSelector);
  });
});
