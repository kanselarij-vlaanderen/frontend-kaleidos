/*global context, before, it, cy*/
/// <reference types="Cypress" />


import newsletter from '../../../selectors/newsletter.selector';
import utils from '../../../selectors/utils.selectors';

context('KB: Edit decision in newsletter-info', () => {
  before(() => {
    cy.resetCache();
    cy.server();
    cy.login('Admin');
  });

  it('Should edit decision in newsletter-info', () => {
    const decisionText = 'Dit is een leuke beslissing';

    cy.route('/themes').as('decisionNewsletterInfoThemes');
    cy.get('.vl-tab > a').contains('Kort bestek').click();
    cy.get('.data-table > tbody > tr').first().click(); //TODO this test could fail if more data is in the default test set, search for specific date
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.wait('@decisionNewsletterInfoThemes');

    // cy.get('.editor__paper').clear(); //TODO triggers error:  "Cannot read property 'nodeType" of null from RDFA editor
    cy.get('.editor__paper').type(decisionText);

    cy.route('/newsletter-infos/*').as('decisionNewsletterInfo');
    cy.get(utils.checkboxLabel).eq(0).click();
    cy.get(newsletter.editSave).click();
    cy.wait('@decisionNewsletterInfo');

    cy.contains(decisionText);
  })
});
