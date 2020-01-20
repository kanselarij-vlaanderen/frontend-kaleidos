/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('KB: Edit decision in newsletter-info', () => {
  before(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
  });

  it('Should edit decision in newsletter-info', () => {
    cy.get('.vl-tab > a')
      .contains('Kort bestek').click();
    cy.get('.data-table > tbody > tr').first().click();
    cy.get('table > tbody').get('.lt-body').should('contain.text', 'Nog geen kort bestek voor dit agendapunt.').click();
    cy.get('.editor__paper').clear();
    cy.get('.editor__paper').type('Ajkdjkdjdk');
  })
});
