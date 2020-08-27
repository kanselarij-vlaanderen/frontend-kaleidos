/* global context, before, it, cy */
// / <reference types="Cypress" />

import newsletter from '../../../selectors/newsletter.selector';
import agenda from '../../../selectors/agenda.selectors';

context('KB: Edit content of news-item', () => {
  before(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should be unexistent to start with, be created, edited, theme selected and saved', () => {
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

    cy.get(agenda.item.news.themesSelector).contains('Sport')
      .click();
    cy.route('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editSave).click();
    cy.wait('@newsletterInfosPost');

    cy.contains(decisionText);
  });
});
