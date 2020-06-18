/* global cy, Cypress */
/// <reference types="Cypress" />

Cypress.Commands.add('clickReverseTab', clickReverseTab);

/**
 * @description Clicks on the specified reverse tab for navigating
 * @name clickReverseTab
 * @if class="vlc-tabs-reverse"
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} tabName The name of the tab to click on, case sensitive
 */
function clickReverseTab(tabName) {
  cy.log('clickReverseTab');
  cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() => {
    // cy.wait(1000);
    cy.contains(tabName).click();
  });
  cy.log('/clickReverseTab');
}
