/* global cy, Cypress */
// / <reference types="Cypress" />


import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';


/**
 * @description Bypasses the mock-login and inserts a localstorage item
 * @name login
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} name the profile to log in with, case sensitive
 * @param {number} retries The amount of retries it can do
 */
function login(name, retries = 0) {
  cy.log('login');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/mock/sessions/current').as(`getCurrentSession_${randomInt}`);
  const EMBER_SIMPLE_AUTH_LS_KEY = 'ember_simple_auth-session';
  cy.fixture('mock-login').then((loginUsers) => {
    if (!loginUsers[name]) {
      // more visible when you attempt to login with a wrong name
      cy.log('user name not found!', name);
    }
    cy.request({
      method: 'POST',
      url: '/mock/sessions',
      body: loginUsers[name],
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    }).then((resp) => {
      window.localStorage.setItem(EMBER_SIMPLE_AUTH_LS_KEY, JSON.stringify({
        authenticated: {
          authenticator: 'authenticator:mock-login',
          links: resp.body.links,
          data: resp.body.data,
          relationships: resp.body.relationships,
        },
      }));
    });
  });
  cy.intercept('GET', '/memberships/*').as('getMembership');
  cy.intercept('GET', '/concepts?filter**').as('loadConcepts');
  cy.visit('/overzicht?sizeAgendas=2').wait(`@getCurrentSession_${randomInt}`)
    .then((responseBody) => {
      if (responseBody.error || responseBody.response?.statusCode === 400) {
        if (retries < 5) {
          cy.log('login failed, trying again');
          cy.login(name, retries + 1);
        } else {
          cy.log('login failed after 5 attempts');
        }
      }
    });
  cy.wait('@getMembership');
  cy.wait('@loadConcepts');
  stubSigninghubCallToURL();
  cy.log('/login');
}

// these 2 were an experiment but doesn't really work well with mocklogin
function loginSession(name) {
  cy.session(['login', name], () => {
    cy.visit('mock-login');
    cy.login(name);
  });
}

function loginFlowSession(name) {
  cy.session(['loginFlow', name], () => {
    cy.visit('mock-login');
    cy.loginFlow(name);
  });
}

/**
 * @description Logs out the current user and end the mocked session
 * @name logout
 * @memberOf Cypress.Chainable#
 * @function
 */
function logout(retries = 0) {
  cy.log('logout');
  cy.request({
    method: 'DELETE',
    url: '/mock/sessions/current',
  }).then((responseBody) => {
    if (responseBody.error || responseBody.response?.statusCode === 500) {
      if (retries < 5) {
        cy.log('logout failed, trying again');
        cy.logout(retries + 1);
      } else {
        cy.log('logout failed after 5 attempts');
      }
    }
    cy.visit('/overzicht?sizeAgendas=2');
  });
  cy.wait(1000);
  cy.log('/logout');
}

/**
 * @description Goes to the mock-login page and selects the profile that matches the given name.
 * @name loginFlow
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} name the profile to log in with, case sensitive
 */
function loginFlow(name) {
  cy.log('loginFlow');
  cy.intercept('POST', '/mock/sessions').as('mockLogin');
  cy.visit('mock-login');
  cy.get(route.mockLogin.list).within(() => {
    cy.contains(name).click()
      .wait('@mockLogin');
  });
  stubSigninghubCallToURL();
  cy.log('/loginFlow');
}

/**
 * @description Goes to the mock-login page and selects the profile that matches the given name.
 * @name logoutFlow
 * @memberOf Cypress.Chainable#
 * @function
 */
function logoutFlow() {
  cy.log('logoutFlow');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('DELETE', '/mock/sessions/current').as(`mockLogout_${randomInt}`);
  cy.intercept('DELETE', '/impersonations/current').as(`impersonationLogout_${randomInt}`);
  cy.visit('/overzicht?sizeAgendas=2');
  cy.get(utils.mHeader.userActions)
    .children(appuniversum.button)
    .click();
  cy.get(utils.mHeader.userAction.logout)
    .contains('Afmelden')
    .forceClick();
  cy.wait(`@mockLogout_${randomInt}`);
  cy.wait(`@impersonationLogout_${randomInt}`);
  cy.wait(2000);
  // with this lower than 2000 we sometimes hit the following error in mock-login on getting the session between delete and insert
  // "ruby template: not setting allowed groups because header already provided with value "CLEAR""
  cy.log('/logoutFlow');
}

function stubSigninghubCallToURL() {
  const staticResponse = {
    statusCode: 500,
    ok: false,
  };
  const stub = cy.stub(staticResponse);
  cy.intercept('GET', '/signing-flows/**/pieces/**/signinghub**', stub).as('stubSigninghubCall');
}

Cypress.Commands.add('login', login);
Cypress.Commands.add('loginSession', loginSession);
Cypress.Commands.add('loginFlowSession', loginFlowSession);
Cypress.Commands.add('logout', logout);
Cypress.Commands.add('loginFlow', loginFlow);
Cypress.Commands.add('logoutFlow', logoutFlow);
