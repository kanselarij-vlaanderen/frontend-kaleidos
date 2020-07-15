/*global context, before, it, cy*/
/// <reference types="Cypress" />


import newsletter from '../../../selectors/newsletter.selector';
import utils from '../../../selectors/utils.selectors';

context('KB: Edit decision in newsletter-info', () => {
  before(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should edit decision in newsletter-info', () => {
    const decisionText = 'Dit is een leuke beslissing';
    cy.visit('/overzicht/5DD7CDA58C70A70008000001/kort-bestek/5DD7CDA58C70A70008000002/agendapunten');
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();

    // cy.get('.editor__paper').clear(); //TODO triggers error:  "Cannot read property 'nodeType" of null from RDFA editor
    cy.get('.editor__paper').type(decisionText);

    cy.route('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.get(utils.checkboxLabel).eq(0).click();
    cy.get(newsletter.editSave).click()
      .wait('@newsletterInfosPatch');
    cy.contains(decisionText);
  })
});
