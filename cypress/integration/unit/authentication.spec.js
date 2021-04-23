/* global context, it, cy */
// / <reference types="Cypress" />

context('Authentication tests', () => {
  it('should login/logout using xhr request (api call)', () => {
    cy.server();
    cy.login('Admin');
    // TODO verify url to check if we can see agenda's page ?
    cy.logout();
    cy.visit('/');
    cy.contains('Meld u aan');
  });

  it('should login/logout using the mock-login and logout button', () => {
    cy.server();
    cy.loginFlow('Admin');
    // TODO verify url to check if we can see agenda's page ?
    cy.logoutFlow();
    cy.visit('/');
    cy.contains('Meld u aan');
  });

  it('Logging in as user should redirect to /accountless-users', () => {
    cy.server();
    cy.login('User');
    // TODO after logging in, the user can see the agenda overview (empty).
    // Only after a first attempt at opening a different page results in seeing the unauthorized user page
    cy.visit('/');
    cy.contains('U heeft zich aangemeld om binnen Kaleidos gebruiksrechten te bekomen.');
    cy.url().should('contain', '/onbevoegde-gebruiker');
  });
});
