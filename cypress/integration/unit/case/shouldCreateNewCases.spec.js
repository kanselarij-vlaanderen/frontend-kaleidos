/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />


import cases from "../../../selectors/case.selectors";
import form from "../../../selectors/form.selectors";

context('Create case as Admin user', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Create a case with empty values', () => {
    cy.route('GET', '/cases/search**').as('getCases');
    cy.visit('/dossiers');
    cy.wait('@getCases');
      cy.get(cases.casesHeaderAddCase).click();
      cy.get(cases.metadataForm).type("Dit is de korte titel van het dossier", {delay: 50});
      cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Create a case with confidentiality', () => {
    cy.route('GET', '/cases/search**').as('getCases');
    cy.visit('/dossiers');
    cy.wait('@getCases');
    cy.get(cases.casesHeaderAddCase).click();
    cy.get(form.formVlToggle).eq(0).click();
    cy.get(cases.metadataForm).type("Dit is een dossier met confidentiality");
    cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Create a case with confidentiality and short title', () => {
    cy.route('GET', '/cases/search**').as('getCases');
    cy.visit('/dossiers');
    cy.wait('@getCases');
    cy.get(cases.casesHeaderAddCase).click();
    cy.get(form.formVlToggle).eq(0).click();
    cy.get(cases.metadataForm).type("Dit is een dossier met confidentiality en een korte titel");
    cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Create a case with short title', () => {
    cy.route('GET', '/cases/search**').as('getCases');
    cy.visit('/dossiers');
    cy.wait('@getCases');
    cy.get(cases.casesHeaderAddCase).click();
    cy.get(cases.metadataForm).type("Dit is een dossier met een korte titel");
    cy.get('button').contains('Dossier aanmaken').click();
  });

  it('Hitting cancel should hide the model', () => {
    cy.route('GET', '/cases/search**').as('getCases');
    cy.visit('/dossiers');
    cy.wait('@getCases');
    cy.get(cases.casesHeaderAddCase).click();
    cy.get(form.formCancelButton).click();
  });
});
