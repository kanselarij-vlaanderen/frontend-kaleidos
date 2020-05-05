
/*global cy, Cypress*/
/// <reference types="Cypress" />

Cypress.Commands.add('login',login);
Cypress.Commands.add('logout',logout);


/**
 * @description Goes to the mock-login page and selects the profile that matches the given name.
 * @name login
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} name the profile to log in with, case sensitive
 */
function login(name){
  cy.server();
  cy.route('POST', '/mock/sessions').as('mockLogin');
  cy.visit('mock-login');
  cy.get('.grid', { timeout: 20000 }).within(() => {
    cy.contains(name).click()
      .wait('@mockLogin');
  });
  cy.visit('/');
}


/**
 * @description Logs out the current user and end the mocked session
 * @name logout
 * @memberOf Cypress.Chainable#
 * @function
 */
function logout(){
  cy.server();
  cy.route('DELETE', '/mock/sessions/current').as('mockLogout');
  cy.visit('');
  cy.contains('Afmelden', { timeout: 12000 }).click({force: true});
  cy.wait('@mockLogout');
}
