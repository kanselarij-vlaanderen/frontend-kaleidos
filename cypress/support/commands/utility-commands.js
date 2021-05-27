/* eslint-disable no-undef */

// Commands
import agenda from '../../selectors/agenda.selectors';
import dependency from '../../selectors/dependency.selectors';
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
function selectDate(year, month, day, index) {
  cy.log('selectDate');
  let element;

  if (index !== undefined) {
    element = cy.get(agenda.datepickerButton).eq(index)
      .click();
    element.get(agenda.flatpickrMonthDropdownMonths).eq(index)
      .select(month);
    element.get(agenda.numInputWrapper).get(agenda.inputNumInputCurYear)
      .eq(index)
      .clear()
      .type(year, {
        delay: 300,
      });
    element.get(agenda.flatpickrDay).should('be.visible')
      .contains(day)
      .click();
  } else {
    element = cy.get(agenda.datepickerButton).click();
    element.get(agenda.flatpickrMonthDropdownMonths).select(month);
    element.get(agenda.numInputWrapper)
      .get(agenda.inputNumInputCurYear)
      .clear()
      .type(year, {
        delay: 300,
      });
    element.get(agenda.flatpickrDay).contains(day)
      .click();
  }
  cy.log('/selectDate');
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
  cy.log('validateDropdownElements');
  cy.get(dependency.emberPowerSelect.trigger).click();
  cy.get(dependency.emberPowerSelect.option).eq(elementIndex)
    .should('contain.text', textContent);
  cy.get(dependency.emberPowerSelect.option).eq(elementIndex)
    .scrollIntoView()
    .click();
  cy.log('/validateDropdownElements');
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

/**
 * @description check if element exists and is visible
 * @memberOf Cypress.Chainable#
 * @name existsAndVisible
 * @function
 * @returns {Chainable<JQuery<any>>} returns a chainable element
 * @param {String} element - The element where the action has to be made on
 */
function existsAndVisible(element) {
  return cy.get(element)
    .should('exist')
    .should('be.visible');
}

/**
 * @description check if element exists and is not visible
 * @memberOf Cypress.Chainable#
 * @name existsAndInvisible
 * @function
 * @returns {Chainable<JQuery<any>>} returns a chainable element
 * @param {String} element - The element where the action has to be made on
 */
function existsAndInvisible(element) {
  return cy.get(element)
    .should('exist')
    .should('not.be.visible');
}

Cypress.Commands.add('selectDate', selectDate);
Cypress.Commands.add('validateDropdownElements', validateDropdownElements);

Cypress.Commands.add('currentMoment', currentMoment);
Cypress.Commands.add('currentTimestamp', currentTimestamp);
Cypress.Commands.add('existsAndVisible', existsAndVisible);
Cypress.Commands.add('existsAndInvisible', existsAndInvisible);
