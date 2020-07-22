/* global context, it, cy */
// / <reference types="Cypress" />

context('Authentication tests', () => {
  it('should logout using authentication.vlaanderen', () => {
    cy.server();
    // cy.route('GET', "https://authenticatie-ti.vlaanderen.be/stb/html/pages?TAM_OP=logout_success").as('logoutURL')
    cy.login('Admin');
    cy.logout();
    cy.visit('/');
    cy.contains('Meld u aan');
    // cy.url().should('contain', 'https://authenticatie-ti.vlaanderen.be/stb/html/pages?TAM_OP=logout_success', {timeout : 5000 });
  });

  it('should logout using the logout button', () => {
    cy.server();
    // cy.route('GET', "https://authenticatie-ti.vlaanderen.be/stb/html/pages?TAM_OP=logout_success").as('logoutURL')
    cy.loginFlow('Admin');
    cy.logoutFlow();
    cy.visit('/');
    cy.contains('Meld u aan');
    // cy.url().should('contain', 'https://authenticatie-ti.vlaanderen.be/stb/html/pages?TAM_OP=logout_success', {timeout : 5000 });
  });
});
