/* eslint-disable no-undef */

// ***********************************************

/**
 * @description Sets the date in an **open vl-flatpickr**
 * @name setDateInFlatpickr
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} date the Cypress.moment with the date to set
 */
function setDateInFlatpickr(date) {
  cy.log('setDateInFlatpickr');
  cy.get('.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > .numInputWrapper > input').type(date.year());
  cy.get('.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > select').select(date.month().toString());
  cy.get('.open .flatpickr-days').within(() => {
    cy.get('.flatpickr-day').not('.prevMonthDay').not('.nextMonthDay').contains(date.date())
      .click();
  });
  cy.log('/setDateInFlatpickr');
}

/**
 * @description Sets the date and time in an **open vl-flatpickr**
 * @name setDateAndTimeInFlatpickr
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} date the Cypress.moment with the date to set
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
 * @description Sets the date and time in an **open vl-flatpickr**
 * @name setYearMonthDayHourMinuteInFlatPicker
 * @memberOf Cypress.Chainable#
 * @function
 * @param {number} year The year to set
 * @param {number} month The year to set
 * @param {number} day The year to set
 * @param {number} hour The year to set
 * @param {number} minute The year to set
 */
function setYearMonthDayHourMinuteInFlatPicker(year, month, day, hour, minute) {
  cy.log('setYearMonthDayHourMinuteInFlatPicker');
  setDateAndTimeInFlatpickr(Cypress.moment().year(year).month(month).date(day)
    .hour(hour)
    .minute(minute));
  cy.log('/setYearMonthDayHourMinuteInFlatPicker');
}

// Commands
Cypress.Commands.add('setDateAndTimeInFlatpickr', setDateAndTimeInFlatpickr);
Cypress.Commands.add('setYearMonthDayHourMinuteInFlatPicker', setYearMonthDayHourMinuteInFlatPicker);
Cypress.Commands.add('setDateInFlatpickr', setDateInFlatpickr);
