/* eslint-disable no-undef */

import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import utils from '../../selectors/utils.selectors';

// ***********************************************

// Functions
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
 * @description Clicks on the specified reverse tab for navigating
 * @name clickReverseTab
 * @if class="auk-tabs auk-tabs--reversed"
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} tabName The name of the tab to click on, case sensitive
 */
function clickReverseTab(tabName) {
  cy.log('clickReverseTab');
  cy.get(auk.tabs.reversed).find(auk.tab.tab)
    .contains(tabName)
    .click();
  cy.get(auk.loader).should('not.exist');
  cy.log('/clickReverseTab');
}

/**
 * @description Sets the date in an **open vl-flatpickr**
 * @name setDateInFlatpickr
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} date the Cypress.dayjs with the date to set
 */
function setDateInFlatpickr(date) {
  cy.log('setDateInFlatpickr');
  cy.get(dependency.flatPickr.yearInput).scrollIntoView()
    .type(date.year());
  cy.get(dependency.flatPickr.monthSelect).select(date.month().toString());
  cy.get(dependency.flatPickr.days).find(dependency.flatPickr.day)
    .not(dependency.flatPickr.prevMonthDay)
    .not(dependency.flatPickr.nextMonthDay)
    .contains(date.date())
    .click();
  cy.log('/setDateInFlatpickr');
}

/**
 * @description Sets the date and time in an **open vl-flatpickr**
 * @name setDateAndTimeInFlatpickr
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} date the Cypress.dayjs with the date to set
 */
function setDateAndTimeInFlatpickr(date) {
  cy.log('setDateAndTimeInFlatpickr');
  setDateInFlatpickr(date);
  cy.get(dependency.flatPickr.time).within(() => {
    cy.get(dependency.flatPickr.hour).type(date.hour());
    cy.get(dependency.flatPickr.minute).type(date.minute())
      .type('{enter}');
  });
  cy.log('/setDateAndTimeInFlatpickr');
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name openSettingsModal
 * @function
 * @param selector: selector that needs to be used.
 */
function openSettingsModal(selector) {
  cy.log('openSettingsModal');
  cy.get(selector).click();
  cy.get(auk.auModal.container).should('be.visible');
  cy.log('/openSettingsModal');
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name closeSettingsModal
 * @function
 */
function closeSettingsModal() {
  cy.log('closeSettingsModal');
  cy.get(auk.auModal.header.close).click();
  cy.get(auk.auModal.container).should('not.exist');
  cy.log('/closeSettingsModal');
}

/**
 * Validate the content of the dropdown
 * @memberOf Cypress.Chainable#
 * @name addFields
 * @function
 * @param {{name: string, selected: boolean, [fields]: string}[]} domains
 */
function addDomainsAndFields(domains) {
  cy.log('addDomainsAndFields');
  cy.intercept('GET', '/concepts**').as('getConceptSchemes');
  cy.get(utils.governmentAreasPanel.edit).click();
  cy.wait('@getConceptSchemes');
  domains.forEach((domain) => {
    cy.get(utils.governmentAreaSelectorForm.container)
      .contains(domain.name)
      .as('domain');
    if (domain.selected) {
      cy.get('@domain')
        .click();
    }
    if (domain.fields) {
      domain.fields.forEach((field)  => {
        cy.get('@domain')
          .siblings(utils.governmentAreaSelectorForm.domainList)
          .contains(field)
          .click();
      });
    }
  });
  cy.intercept('PATCH', '/subcases/*').as('saveSubcase');
  cy.get(utils.editGovernmentFieldsModal.save).click();
  cy.wait('@saveSubcase');

  cy.log('/addDomainsAndFields');
}

/**
 * Select an option of the dropdown
 * @memberOf Cypress.Chainable#
 * @name selectFromDropdown
 * @function
 */
function selectFromDropdown(item) {
  cy.log('selectFromDropdown');
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 5000,
  }).wait(500)
    .contains(item)
    .scrollIntoView()
    .trigger('mouseover')
    .click({
      force: true,
    });
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 15000,
  }).should('not.exist');
  cy.log('/selectFromDropdown');
}

Cypress.Commands.add('forceClick', {
  prevSubject: 'element',
}, (element) => {
  cy.wrap(element).click({
    force: true,
  });
});

// ***********************************************
// Commands

Cypress.Commands.add('validateDropdownElements', validateDropdownElements);
Cypress.Commands.add('clickReverseTab', clickReverseTab);
Cypress.Commands.add('setDateAndTimeInFlatpickr', setDateAndTimeInFlatpickr);
Cypress.Commands.add('setDateInFlatpickr', setDateInFlatpickr);
Cypress.Commands.add('openSettingsModal', openSettingsModal);
Cypress.Commands.add('closeSettingsModal', closeSettingsModal);
Cypress.Commands.add('addDomainsAndFields', addDomainsAndFields);
Cypress.Commands.add('selectFromDropdown', selectFromDropdown);
