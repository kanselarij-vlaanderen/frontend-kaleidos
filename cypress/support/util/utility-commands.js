

/* eslint-disable no-undef */

// ***********************************************

// Commands
import agenda from "../../selectors/agenda.selectors";
import actionModal from "../../selectors/modal.selectors";
import modal from "../../selectors/modal.selectors";

Cypress.Commands.add('selectDate', selectDate);
Cypress.Commands.add('selectAction', selectAction);
Cypress.Commands.add('openActionModal', openActionModal);
Cypress.Commands.add('validateDropdownElements', validateDropdownElements);
Cypress.Commands.add('openSettingsModal', openSettingsModal);
Cypress.Commands.add('closeSettingsModal', closeSettingsModal);
Cypress.Commands.add('currentMoment', currentMoment);
Cypress.Commands.add('currentTimestamp', currentTimestamp);

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
 * @param {int} index - The day that needs to be selected in the datepicker
 */
function selectDate(year,month,day, index) {

  let element;

  if(index !== undefined) {
    element = cy.get(agenda.datepickerButton).eq(index).click();
    element.get(agenda.flatpickrMonthDropdownMonths).eq(index).select(month);
    element.get(agenda.numInputWrapper).get(agenda.inputNumInputCurYear).eq(index).clear().type(year, {delay: 300});
    element.get(agenda.flatpickrDay).should('be.visible').contains(day).click();
  } else {
    element = cy.get(agenda.datepickerButton).click();
    element.get(agenda.flatpickrMonthDropdownMonths).select(month);
    element.get(agenda.numInputWrapper).get(agenda.inputNumInputCurYear).clear().type(year, {delay: 300});
    element.get(agenda.flatpickrDay).contains(day).click();
  }
}

/**
 * Create a default agenda
 * @memberOf Cypress.Chainable#
 * @name selectAction
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
 * @name openActionModal
 * @function
 */
function openActionModal() {

  const BE_VISIBLE = 'be.visible';

  cy.get(actionModal.showActionOptions).click();
  cy.get(actionModal.navigatetosubcases).should(BE_VISIBLE);
  cy.get(actionModal.announcement).should(BE_VISIBLE);
  cy.get(actionModal.navigatetodecisions).should(BE_VISIBLE);
  cy.get(actionModal.navigatetonewsletter).should(BE_VISIBLE);
  cy.get(actionModal.navigatetonotes).should(BE_VISIBLE);
  cy.get(actionModal.navigatetopressagenda).should(BE_VISIBLE);
  cy.get(actionModal.toggleeditingsession).should(BE_VISIBLE);
  cy.get(actionModal.selectsignature).should(BE_VISIBLE);
  // cy.get(downloadddocuments).should(BE_VISIBLE); // TODO reenable when feature is fixed
  cy.get(actionModal.agendaHeaderDeleteAgenda).should(BE_VISIBLE);
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name validateDropdownElements
 * @function
 * @param {int} elementIndex: index of the element that needs to be selected
 * @param {String} textContent: Text that need to be in the dropdown element
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
 * @param selector: selector that needs to be used.
 */
function openSettingsModal(selector) {
  cy.get(selector).click();
  cy.get(modal.createAnnouncement.modalDialog).should('be.visible');
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name closeSettingsModal
 * @function
 */
function closeSettingsModal() {
  cy.get(modal.createAnnouncement.modalDialogCloseModal).click();
  cy.get(modal.createAnnouncement.modalDialog).should('not.be.visible');
}


/**
 * @description Returns the current moment in Cypress
 * @name currentMoment
 * @memberOf Cypress.Chainable#
 * @function
 * @returns {moment.Moment} The current moment
 */
function currentMoment() {
  return Cypress.moment();
}

/**
 * @description returns the current time in unix timestamp
 * @name currentTimestamp
 * @memberOf Cypress.Chainable#
 * @function
 * @returns {number} The current time in unix timestamp
 */
function currentTimestamp() {
  return Cypress.moment().unix();
}
