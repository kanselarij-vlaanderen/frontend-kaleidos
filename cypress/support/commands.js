
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/* eslint-disable no-undef */
import 'cypress-file-upload';


Cypress.Commands.add('login',login);
Cypress.Commands.add('logout',logout);

Cypress.Commands.add('setDateInFlatpickr', setDateInFlatpickr);

Cypress.Commands.add('clickReverseTab', clickReverseTab);

Cypress.Commands.add('verifyAlertSuccess', verifyAlertSuccess);


/**
 * Goes to the mock-login page and selects the profile that matches the given name
 *
 * @param {String} name the profile to log in with, case sensitive
 */
function login(name){
  cy.route('POST', '/mock/sessions').as('mockLogin');
  cy.visit('mock-login');
  cy.get('.grid', { timeout: 12000 }).within(() => {
    cy.contains(name).click()
      .wait('@mockLogin');
  });
}

/**
 * Logs out the current user and end the mocked session
 *
 */
function logout(){
  cy.route('DELETE', '/mock/sessions/current').as('mockLogout');
  cy.visit('');
  cy.contains('Afmelden').click();
  cy.wait('@mockLogout');
}

/**
 * Sets the date and time in an **open vl-flatpickr**
 *
 * @param {Object} date the Cypress.moment with the date to set
 * @param {number} plusMonths The positive amount of months from today to advance in the vl-flatpickr 
 */
function setDateInFlatpickr(date, plusMonths) {
  cy.get('.flatpickr-months').within(() => {
    for (let n = 0; n < plusMonths; n++) {
      cy.get('.flatpickr-next-month').click();
    }
  });
  cy.get('.flatpickr-days').within(() => {
    cy.get('.flatpickr-day').not('.prevMonthDay').not('.nextMonthDay').contains(date.date()).click();
  });
  cy.get('.flatpickr-time').within(() => {
    cy.get('.flatpickr-hour').type(date.hour());
    cy.get('.flatpickr-minute').type(date.minutes());
  });
}

/**
 * Clicks on the specified reverse tab for navigating
 * @if class="vlc-tabs-reverse"
 *
 * @param {String} tabName The name of the tab to click on, case sensitive
 */
function clickReverseTab(tabName){
  cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() =>{
    cy.contains(tabName).click();
  });
}

/**
 * Watch if the verification alert popup appears on successful network calls
 * use in a .then() of the sent request
 *
 */
function verifyAlertSuccess() {
  cy.get('.vl-alert', { timeout: 12000 }).contains('Gelukt').should('be.visible');
}