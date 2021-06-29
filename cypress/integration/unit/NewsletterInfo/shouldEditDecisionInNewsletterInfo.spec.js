/* global context, before, it, cy */
// / <reference types="Cypress" />

import newsletter from '../../../selectors/newsletter.selectors';

context('KB: Edit content of news-item', () => {
  before(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should be unexistent to start with, be created, edited, theme selected and saved', () => {
    const decisionText = 'Dit is een leuke beslissing';
    cy.visit('/vergadering/5DD7CDA58C70A70008000001/kort-bestek');
    // TODO KAS-2693
    cy.get('table > tbody', {
      timeout: 20000,
    }).children()
      .as('rows');
    cy.get('@rows').eq(0)
      .within(() => {
        cy.contains('Nog geen kort bestek voor dit agendapunt.');
        // TODO KAS-2693
        cy.get('.ki-pencil').click();
      });

    // cy.get('.editor__paper').clear(); // TODO triggers error:  "Cannot read property 'nodeType" of null from RDFA editor
    cy.get('.say-editor__inner').type(decisionText); // TODO KAS-2693 dependency

    cy.get(newsletter.editItem.themesSelector).contains('Sport')
      .click();
    cy.route('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click()
      .wait('@newsletterInfosPost');

    cy.contains(decisionText);
  });
});
