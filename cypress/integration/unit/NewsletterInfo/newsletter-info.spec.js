/* global context, before, it, cy */
// / <reference types="Cypress" />

import dependency from '../../../selectors/dependency.selectors';
import newsletter from '../../../selectors/newsletter.selectors';

context('newsletter tests, both in agenda detail view and newsletter route', () => {
  before(() => {
    cy.server();
    cy.login('Admin');
  });

  // tests in newsletter route

  it('Should create a newsletter and check the updated row information', () => {
    const decisionText = 'Dit is een leuke beslissing';
    const subcaseNameToCheck = 'Eerste stap';
    cy.visit('/vergadering/5DD7CDA58C70A70008000001/kort-bestek');
    // There is only one row in this view, so eq(0) in not needed
    cy.get(newsletter.tableRow.newsletterRow).within(() => {
      cy.get(newsletter.tableRow.newsletterTitle).contains('Nog geen kort bestek voor dit agendapunt.');
      cy.get(newsletter.buttonToolbar.edit).click();
    });

    cy.get(dependency.rdfa.editorInner).clear()
      .type(decisionText);
    cy.get(newsletter.editItem.themesSelector).contains('Sport')
      .click();
    cy.route('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click()
      .wait('@newsletterInfosPost');

    cy.get(newsletter.tableRow.newsletterTitle).contains(subcaseNameToCheck);
    cy.get(newsletter.tableRow.newsletterTitle).contains(decisionText);
    // TODO KAS-2693 there is no proof that adding theme actually worked
  });
});
