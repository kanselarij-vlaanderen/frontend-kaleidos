/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />


context('Formally ok/nok tests', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should not show "formallyOk" status of agendaitems on approved agenda', () => {
    cy.visit('/agenda/5EBAB9B1BDF1690009000001/agendapunten?refresh=ab0f05a4-0841-44b3-b9fb-c22b0be0b7ec&selectedAgenda=1d4f8091-51cf-4d3c-b776-1c07cc263e59');
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 1);
    cy.get('.vlc-agenda-items__status').should('contain','Formeel OK');
    cy.get('.vlc-side-nav-item').as('agendas');
    cy.get('@agendas').eq(1).click();
    cy.wait(2000); //Make sure the formally ok can load (false positive if testing immediately)
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 1);
    cy.get('.vlc-agenda-items__status').should('not.contain', 'Formeel OK');
  });

});
