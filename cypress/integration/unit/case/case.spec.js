/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import cases from '../../../selectors/case.selectors';
import form from '../../../selectors/form.selectors';

context('Create case as Admin user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Create a case with confidentiality and short title', () => {
    cy.visit('/dossiers');
    cy.get(cases.casesHeaderAddCase).click();
    cy.get(form.formVlToggle).eq(0)
      .click();
    cy.get(cases.metadataForm).type('Dit is een dossier met confidentiality en een korte titel');
    cy.get('button').contains('Dossier aanmaken')
      .click();
  });

  it('Create a case with short title', () => {
    cy.visit('/dossiers');
    cy.get(cases.casesHeaderAddCase).click();
    cy.get(cases.metadataForm).type('Dit is een dossier met een korte titel');
    cy.get('button').contains('Dossier aanmaken')
      .click();
  });

  it('Hitting cancel should hide the model', () => {
    cy.visit('/dossiers');
    cy.get(cases.casesHeaderAddCase).click();
    cy.get(form.formCancelButton).click();
  });

  it('Een lege procedurestap kopieëren in een dossier zou geen fouten mogen geven.', () => {
    cy.route('POST', '/subcases').as('addSubcase-createNewSubcase');
    cy.visit('/dossiers');

    cy.get(cases.casesHeaderAddCase).click();
    cy.get('button').contains('Dossier aanmaken')
      .click();

    cy.addSubcase('Mededeling', 'Dit is de korte titel', '', null, null);
    cy.openSubcase(0);
    cy.get(cases.subcaseType).contains('Mededeling');
    cy.navigateBack();
    cy.get(cases.createSubcaseButton).click();
    cy.get(cases.clonePreviousSubcaseButton).click();
    cy.wait('@addSubcase-createNewSubcase');
    cy.openSubcase(0);
    cy.get(cases.subcaseType).contains('Mededeling');
  });
});
