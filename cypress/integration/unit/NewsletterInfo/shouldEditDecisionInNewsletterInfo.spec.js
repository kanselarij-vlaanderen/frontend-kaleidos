/*global context, before, it, cy*/
/// <reference types="Cypress" />


context('KB: Edit decision in newsletter-info', () => {
  before(() => {
    cy.resetCache();
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should edit decision in newsletter-info', () => {
    cy.get('.vl-tab > a')
      .contains('Kort bestek').click();
    cy.get('.data-table > tbody > tr').first().click(); //TODO this test could fail if more data is in the default test set, search for specific date
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    // cy.get('.editor__paper').clear(); //TODO triggers error:  "Cannot read property 'nodeType" of null from RDFA editor
    cy.get('.editor__paper').type('Ajkdjkdjdk'); //TODO add test after saving to check if data is persisted
  })
});
