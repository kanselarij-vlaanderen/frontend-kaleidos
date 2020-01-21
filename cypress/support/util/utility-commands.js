

/* eslint-disable no-undef */

// ***********************************************

// Commands
import {
  datepickerButton,
  flatpickrCalendar, flatpickrDay,
  flatpickrMonthDropdownMonths, inputNumInputCurYear, numInputWrapper
} from "../../selectors/agenda/agendaSelectors";
import {showActionOptions, navigatetosubcases,announcement,navigatetodecisions, navigatetonewsletter,
  navigatetonotes,navigatetopressagenda, toggleeditingsession, selectsignature, downloadddocuments, deleteAgenda
} from "../../selectors/agenda/actionModalSelectors";
import {modalDialogCloseModalSelector, modalDialogSelector} from "../../selectors/models/modelSelectors";

Cypress.Commands.add('selectDate', selectDate);
Cypress.Commands.add('selectAction', selectAction);
Cypress.Commands.add('openActionModal', openActionModal);
Cypress.Commands.add('validateDropdownElements', validateDropdownElements);
Cypress.Commands.add('openSettingsModal', openSettingsModal);

// ***********************************************
// Functions

/**
 * Select a date in the flatpickrCalendar
 * @memberOf Cypress.Chainable#
 * @name selectDate
 * @function
 * @param {String} year - The year that needs to be inserted in the datepicker
 * @param {String} month - the month that needs to be selected in the datepicker
 * @param {String} day - The day that needs to be selected in the datepicker
 */
function selectDate(year,month,day) {
  cy.get(datepickerButton).click();
  cy.get(flatpickrCalendar).get(flatpickrMonthDropdownMonths).select(month);
  cy.get(flatpickrCalendar).get(numInputWrapper).get(inputNumInputCurYear).clear().type(year, {delay: 300});
  cy.get(flatpickrCalendar).get(flatpickrDay).contains(day).click();
}

/**
 * Create a default agenda
 * @memberOf Cypress.Chainable#
 * @name createDefaultAgenda
 * @function
 * @param {String} elementToSelect - The action that has to be made
 * @param {String} textToContain - Tekst that the element should contain that is selected
 */
function selectAction(elementToSelect, textToContain) {
  cy.get('[data-test-agenda-header-showactionoptions]').click();
  cy.get(elementToSelect).should('be.visible');
  cy.get(elementToSelect).should('contain.text',textToContain)
}

/**
 * Open the action modal of the agenda page
 * @memberOf Cypress.Chainable#
 * @name createDefaultAgenda
 * @function
 */
function openActionModal() {

  const BE_VISIBLE = 'be.visible';

  cy.get(showActionOptions).click();
  cy.get(navigatetosubcases).should(BE_VISIBLE);
  cy.get(announcement).should(BE_VISIBLE);
  cy.get(navigatetodecisions).should(BE_VISIBLE);
  cy.get(navigatetonewsletter).should(BE_VISIBLE);
  cy.get(navigatetonotes).should(BE_VISIBLE);
  cy.get(navigatetopressagenda).should(BE_VISIBLE);
  cy.get(toggleeditingsession).should(BE_VISIBLE);
  cy.get(selectsignature).should(BE_VISIBLE);
  cy.get(downloadddocuments).should(BE_VISIBLE);
  cy.get(deleteAgenda).should(BE_VISIBLE);
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name validateDropdownElements
 * @function
 */
function validateDropdownElements(elementIndex, textContent) {
  cy.get('.ember-power-select-trigger').click();
  cy.get('.ember-power-select-option').eq(elementIndex).should('contain.text', textContent);
  cy.get('.ember-power-select-option').eq(elementIndex).click();
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name openSettingsModal
 * @function
 */
function openSettingsModal(selector) {
  cy.get(selector).click();
  cy.get(modalDialogSelector).should('be.visible');
  cy.get(modalDialogCloseModalSelector).click();
  cy.get(modalDialogSelector).should('not.be.visible');
}
