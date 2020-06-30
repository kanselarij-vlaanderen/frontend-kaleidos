/* eslint-disable no-undef */

// ***********************************************

// Commands
// Cypress.Commands.add('setDateInFlatpickr', setDateInFlatpickr);
Cypress.Commands.add('setDateAndTimeInFlatpickr', setDateAndTimeInFlatpickr);
Cypress.Commands.add('setYearMonthDayHourMinuteInFlatPicker', setYearMonthDayHourMinuteInFlatPicker);
Cypress.Commands.add('setDateInFlatpickr', setDateInFlatpickr);

/**
 * @description Sets the date and time in an **open vl-flatpickr**
 * @name setDateAndTimeInFlatpickr
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} date the Cypress.moment with the date to set
 * @param {number} plusMonths The positive amount of months from today to advance in the vl-flatpickr
 */
function setDateAndTimeInFlatpickr(date) {
  cy.log('setDateAndTimeInFlatpickr');
  setDateInFlatpickr(date);
  cy.get('.flatpickr-time').within(() => {
    cy.get('.flatpickr-hour').type(date.hour());
    cy.get('.flatpickr-minute').type(date.minutes());
  });
  cy.log('/setDateAndTimeInFlatpickr');
}

/**
 * @description Sets the date in an **open vl-flatpickr**
 * @name setDateInFlatpickr
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} date the Cypress.moment with the date to set
 * @param {number} plusMonths The positive amount of months from today to advance in the vl-flatpickr
 * @param {number} index element to select
 */
function setDateInFlatpickr(date) {
  cy.log('setDateInFlatpickr');
  cy.get('.flatpickr-months > .flatpickr-month > .flatpickr-current-month > .numInputWrapper > input').type(date.year());
  cy.get('.flatpickr-months > .flatpickr-month > .flatpickr-current-month > select').select(date.month().toString());
  cy.get('.flatpickr-days').within(() => {
    cy.get('.flatpickr-day').not('.prevMonthDay').not('.nextMonthDay').contains(date.date()).click();
  });
  cy.log('/setDateInFlatpickr');
}

/**
 * @description Sets the date and time in an **open vl-flatpickr**
 * @name setYearMonthDayHourMinuteInFlatPicker
 * @memberOf Cypress.Chainable#
 * @function
 */
function setYearMonthDayHourMinuteInFlatPicker(year, month, day, hour, minute) {
  cy.log('setYearMonthDayHourMinuteInFlatPicker');
  setDateAndTimeInFlatpickr(Cypress.moment().year(year).month(month).date(day).hour(hour).minute(minute));
  cy.log('/setYearMonthDayHourMinuteInFlatPicker');
}
