
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
  cy.route('GET', '/mock/sessions/current').as('getCurrentSession');
  const EMBER_SIMPLE_AUTH_LS_KEY = 'ember_simple_auth-session';
  cy.fixture('mock-login').then((loginUsers) => {
    cy.request({
      method: 'POST',
      url: '/mock/sessions',
      body: loginUsers[name],
      headers: { 'Content-Type': 'application/vnd.api+json' }
    }).then((resp) => {
      window.localStorage.setItem(EMBER_SIMPLE_AUTH_LS_KEY, JSON.stringify({
        authenticated: {
          authenticator: 'authenticator:mock-login',
          links: resp.body.links,
          data: resp.body.data,
          relationships: resp.body.relationships
        }
      }));
    });
  });
  cy.visit('').wait('@getCurrentSession'); // Sorry, now this works like a charm...
}


/**
 * @description Logs out the current user and end the mocked session
 * @name logout
 * @memberOf Cypress.Chainable#
 * @function
 */
function logout(){
  cy.request({
    method: 'DELETE',
    url: '/mock/sessions/current',
  }).then(() => {
    cy.visit('/');
  });
}
