/* global context, before, it, cy */
// / <reference types="Cypress" />

import newsletter from '../../../selectors/newsletter.selector';
import utils from '../../../selectors/utils.selectors';

context('KB: Edit decision in newsletter-info', () => {
  before(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should edit decision in newsletter-info', () => {
    const decisionText = 'Dit is een leuke beslissing';
    cy.visit('/vergadering/5DD7CDA58C70A70008000001/kort-bestek');
    cy.get('table > tbody', {
      timeout: 20000,
    }).children()
      .as('rows');
    cy.get('@rows').eq(0)
      .within(() => {
        cy.contains('Nog geen kort bestek voor dit agendapunt.');
        cy.get('.vl-vi-pencil').click();
      });

    // cy.get('.editor__paper').clear(); //TODO triggers error:  "Cannot read property 'nodeType" of null from RDFA editor
    cy.get('.editor__paper').type(decisionText);

    cy.route('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.get(utils.checkboxLabel).eq(0)
      .click();
    cy.get(newsletter.editSave).click();
    cy.wait('@newsletterInfosPatch');

    cy.contains(decisionText);
  });
});
