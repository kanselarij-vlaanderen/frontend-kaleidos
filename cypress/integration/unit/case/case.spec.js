/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import cases from '../../../selectors/case.selectors';
import form from '../../../selectors/form.selectors';
import modal from '../../../selectors/modal.selectors';

context('Create case as Admin user', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO missing asserts? Clicking a button does not mean it works, maybe there is a verify modal or an error

  it('Create a case with confidentiality and short title', () => {
    // TODO use the createCase command, use data selectors
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
    // TODO assert modal is gone ?
    // TODO assert there is no state when cancelling en recreating ?
  });

  it('Een lege procedurestap kopieëren in een dossier zou geen fouten mogen geven.', () => {
    const newShortTitle = 'Dit is de korte titel';
    cy.route('POST', '/subcases').as('addSubcase-createNewSubcase');
    cy.visit('/dossiers');

    cy.get(cases.casesHeaderAddCase).click();
    cy.get('button').contains('Dossier aanmaken')
      .click();
    // TODO testing without title is done in next it, DUPLICATE test
    cy.get(modal.publication.alertError).should('be.visible');
    cy.get(modal.publication.alertError).contains('Kijk het formulier na');
    cy.get('.auk-form-group').eq(1)
      .within(() => {
        cy.get('.auk-textarea').click()
          .clear()
          .type(newShortTitle);
      });
    cy.get('button').contains('Dossier aanmaken')
      .click();
    cy.addSubcase('Mededeling', newShortTitle, '', null, null);
    cy.openSubcase(0);
    cy.get(cases.subcaseTitlesView.type).contains('Mededeling');
    cy.navigateBack();
    cy.get(cases.createSubcaseButton).click();
    cy.get(cases.clonePreviousSubcaseButton).click();
    cy.wait('@addSubcase-createNewSubcase');
    cy.openSubcase(0);
    cy.get(cases.subcaseTitlesView.type).contains('Mededeling');
  });

  it('Een dossier maken zonder korte titel geeft een error', () => {
    cy.route('POST', '/subcases').as('addSubcase-createNewSubcase');
    cy.visit('/dossiers');

    cy.get(cases.casesHeaderAddCase).click();
    cy.get('button').contains('Dossier aanmaken')
      .click();
    cy.get(modal.publication.alertError).should('be.visible');
    cy.get(modal.publication.alertError).contains('Kijk het formulier na');
  });
});
