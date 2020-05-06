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
function setDateAndTimeInFlatpickr(date, plusMonths) {
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
 * @description Sets the date in an **open vl-flatpickr**
 * @name setDateInFlatpickr
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} date the Cypress.moment with the date to set
 * @param {number} plusMonths The positive amount of months from today to advance in the vl-flatpickr
 * @param {number} index element to select
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
}

/**
 * @description Sets the date and time in an **open vl-flatpickr** to today
 * @name setYearMonthDayHourMinuteInFlatPicker
 * @memberOf Cypress.Chainable#
 * @function
 */
function setYearMonthDayHourMinuteInFlatPicker(year, month, day, hour, minute) {
  return cy.existsAndVisible('input.numInput.cur-year')
    .type(year)
    .then(() => {
      cy.existsAndVisible('.flatpickr-monthDropdown-months').select(month);
  }).then(() => {
    cy.existsAndVisible('.flatpickr-day').contains(day).click();
    cy.existsAndVisible('input.numInput.flatpickr-hour').type(hour).click();
    return cy.existsAndVisible('input.numInput.flatpickr-minute').type(minute).click();
  })
}
