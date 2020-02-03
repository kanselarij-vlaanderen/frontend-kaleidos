/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />


import {casesHeaderAddCaseSelector, metadataForm} from "../../../selectors/cases/caseSelectors";
import {formCancelButton, formVlToggle} from "../../../selectors/formSelectors/formSelectors";

context('Create case as Admin user', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Create a case with empty values', () => {
      cy.visit('/dossiers');
      cy.get(casesHeaderAddCaseSelector).click();
      cy.get(metadataForm).type("Dit is de korte titel van het dossier", {delay: 50});
      cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Create a case with confidentiality', () => {
    cy.visit('/dossiers');
    cy.get(casesHeaderAddCaseSelector).click();
    cy.get(formVlToggle).eq(0).click();
    cy.get(metadataForm).type("Dit is een dossier met confidentiality");
    cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Create a case with confidentiality and short title', () => {
    cy.visit('/dossiers');
    cy.get(casesHeaderAddCaseSelector).click();
    cy.get(formVlToggle).eq(0).click();
    cy.get(metadataForm).type("Dit is een dossier met confidentiality en een korte titel");
    cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Create a case with short title', () => {
    cy.visit('/dossiers');
    cy.get(casesHeaderAddCaseSelector).click();
    cy.get(metadataForm).type("Dit is een dossier met een korte titel");
    cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Hitting cancel should hide the model', () => {
    cy.visit('/dossiers');
    cy.get(casesHeaderAddCaseSelector).click();
    cy.get(formCancelButton).click();
  });
});
