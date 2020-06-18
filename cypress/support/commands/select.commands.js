/* global cy, Cypress */
/// <reference types="Cypress" />

Cypress.Commands.add('selectOptionInSelectByText', selectOptionInSelectByText);
Cypress.Commands.add('selectOptionInSelectByIndex', selectOptionInSelectByIndex);

/**
 * @description Select an option in the select control
 * @memberOf Cypress.Chainable#
 * @name existsAndInvisible
 * @function
 * @returns {Chainable<JQuery<any>>} returns a chainable element
 * @param {number} option - The index of the option that has to be selected in the select
 */
function selectOptionInSelectByIndex(option) {
  cy.log('selectOptionInSelectByIndex');
  return cy.get('.ember-power-select-option', { timeout: 5000 })
    .should('exist')
    .then(() => cy.get(`li[data-option-index="${option}"]`)
      .should('exist')
      .should('be.visible')
      .click());
}

/**
 * @description Select an option in the select control
 * @memberOf Cypress.Chainable#
 * @name existsAndInvisible
 * @function
 * @returns {Chainable<JQuery<any>>} returns a chainable element
 * @param {String} text - The option that has to be selected in the select
 */
function selectOptionInSelectByText(text) {
  cy.log('selectOptionInSelectByText');
  return cy.get('.ember-power-select-option', { timeout: 5000 })
    .should('exist')
    .then(() => cy.get('.ember-power-select-option')
      .should('exist')
      .should('be.visible')
      .contains(text)
      .click());
}
