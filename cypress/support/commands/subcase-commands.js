/* global  cy, Cypress */
// / <reference types="Cypress" />

import cases from '../../selectors/case.selectors';
import utils from '../../selectors/utils.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import dependency from '../../selectors/dependency.selectors';

// ***********************************************
// Functions

/**
 * @description Translates a month number to a dutch month in lowercase.
 * @name getTranslatedMonth
 * @memberOf Cypress.Chainable#
 * @function
 * @param month {number}  the number of the month to translate (from moment so starts from 0)
 * @returns {string} the month in dutch
 */
function getTranslatedMonth(month) {
  cy.log('getTranslatedMonth');
  switch (month) {
    case 0:
      return 'januari';
    case 1:
      return 'februari';
    case 2:
      return 'maart';
    case 3:
      return 'april';
    case 4:
      return 'mei';
    case 5:
      return 'juni';
    case 6:
      return 'juli';
    case 7:
      return 'augustus';
    case 8:
      return 'september';
    case 9:
      return 'oktober';
    case 10:
      return 'november';
    case 11:
      return 'december';
    default:
      return '';
  }
}

/**
 * Open the subcase of the specified index.
 * @memberOf Cypress.Chainable#
 * @name openSubcase
 * @function
 * @param {number} [index] The list index of the subcase to select, default 0
 */
function openSubcase(index = 0) {
  cy.log('openSubcase');
  // cy.route('GET', '/subcases?**').as('getSubcases');
  // cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
  // cy.wait('@getSubcases', { timeout: 12000 });
  cy.wait(2000); // link does not always work (not visible or click does nothing unless we wait)
  cy.get(cases.subcaseItem.container).eq(index)
    .find(cases.subcaseItem.link)
    .click();
  // cy.wait('@getCaseSubcases', { timeout: 12000 });
  cy.log('/openSubcase');
}

/**
 * Changes the subcase access levels and titles when used in the subcase view (/dossiers/..id../overzicht)
 * shortTitle is required to find the dom element
 * @name changeSubcaseAccessLevel
 * @memberOf Cypress.Chainable#
 * @function
 * @param {boolean} [confidentialityChange] -Will change the current confidentiality if true
 * @param {string} [accessLevel] -Access level to set, must match exactly with possible options in dropdown
 * @param {string} [newShortTitle] - new short title for the subcase
 * @param {string} [newLongTitle] - new long title for the subcase
 * @param {boolean} [inNewsletter] - Will toggle "in newsletter" if true
 */
function changeSubcaseAccessLevel(confidentialityChange, accessLevel, newShortTitle, newLongTitle) {
  cy.log('changeSubcaseAccessLevel');
  cy.route('PATCH', '/subcases/*').as('patchSubcase');

  cy.get(cases.subcaseTitlesView.edit).click();

  if (accessLevel) {
    cy.get(cases.subcaseTitlesEdit.accessLevel).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(accessLevel)
      .click();
  }

  if (confidentialityChange) {
    cy.get(cases.subcaseTitlesEdit.confidential).click();
  }
  if (newShortTitle) {
    cy.get(cases.subcaseTitlesEdit.shorttitle).click()
      .clear()
      .type(newShortTitle);
  }
  if (newLongTitle) {
    cy.get(cases.subcaseTitlesEdit.title).click()
      .clear()
      .type(newLongTitle);
  }

  cy.get(cases.subcaseTitlesEdit.actions.save)
    .click();
  cy.wait('@patchSubcase');
  cy.log('/changeSubcaseAccessLevel');
}

/**
 * Adds a mandatees with field and domain to a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * Pass the title of the mandatee to get a specific person
 * @name addSubcaseMandatee
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Number} mandateeNumber - The list index of the mandatee
 * @param {Number} fieldNumber - The list index of the field, -1 means no field/domain should be selected
 * @param {Number} domainNumber - The list index of the domain
 * @param {String} mandateeSearchText - Search on the minister name (title no longer works)
 * @param {String} mandateeTitle - Select the found mandatee by correct title (optional, use when 1 person has multiple mandatees)
 */
function addSubcaseMandatee(mandateeNumber, fieldNumber, domainNumber, mandateeSearchText, mandateeTitle) {
  cy.log('addSubcaseMandatee');

  if (mandateeSearchText) {
    cy.route('GET', `/mandatees?filter**${mandateeSearchText.split(' ', 1)}**`).as('getFilteredMandatees');
  } else {
    cy.route('GET', '/mandatees?**').as('getMandatees');
  }

  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.route('GET', '/government-fields/**/domain').as(`getGovernmentFieldDomains${randomInt}`);
  cy.route('PATCH', '/subcases/*').as('patchSubcase');

  cy.get(mandatee.mandateePanelView.actions.edit).click();

  cy.get(mandatee.mandateePanelEdit.actions.add).click();
  cy.get(utils.mandateeSelector.container).find(dependency.emberPowerSelect.trigger)
    .click();
  // cy.get(dependency.emberPowerSelect.searchInput).type('g').clear(); // only use this when default data does not have active ministers
  if (mandateeSearchText) {
    cy.get(dependency.emberPowerSelect.searchInput).type(mandateeSearchText);
    cy.wait('@getFilteredMandatees');
  } else {
    cy.wait('@getMandatees');
  }
  cy.get(dependency.emberPowerSelect.optionSearchMessage).should('not.exist');
  // we can search or select by number
  // when searching we select the first option we get or the first option with a specific title
  if (mandateeSearchText) {
    if (mandateeTitle) {
      cy.get(dependency.emberPowerSelect.option).contains(mandateeTitle)
        .click();
    } else {
      cy.get(dependency.emberPowerSelect.option).contains(mandateeSearchText)
        .click();
    }
  } else {
    cy.get(dependency.emberPowerSelect.option).eq(mandateeNumber)
      .click();
  }
  // loading the isecodes and government fields takes some time
  cy.wait(`@getGovernmentFieldDomains${randomInt}`);
  if (fieldNumber >= 0) {
    cy.get(utils.domainsFieldsSelectorForm.container, {
      timeout: 30000,
    }).eq(fieldNumber)
      .find(utils.domainsFieldsSelectorForm.field)
      .eq(domainNumber)
      .click();
  }
  cy.get(utils.vlModalFooter.save).click();
  cy.get(mandatee.mandateePanelEdit.actions.save).click();
  cy.wait('@patchSubcase', {
    timeout: 40000,
  });
  cy.log('/addSubcaseMandatee');
}

/**
 * Adds a mandatees with field and domain to a sucase when used in the agendaitem detail view (/vergadering/..id../agenda/..id../agendapunten/..id)
 * Pass the title of the mandatee to get a specific person
 * @name addAgendaitemMandatee
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Number} mandateeNumber - The list index of the mandatee
 * @param {Number} fieldNumber - The list index of the field, -1 means no field/domain should be selected
 * @param {Number} domainNumber - The list index of the domain
 * @param {String} mandateeSearchText - Search on the minister name (title no longer works)
 * @param {String} mandateeTitle - Select the found mandatee by correct title (optional, use when 1 person has multiple mandatees)
 */
function addAgendaitemMandatee(mandateeNumber, fieldNumber, domainNumber, mandateeSearchText, mandateeTitle) {
  cy.log('addAgendaitemMandatee');

  cy.route('PATCH', '/agendaitems/*').as('patchAgendaitem');
  cy.route('PATCH', '/agendas/*').as('patchAgenda');

  cy.addSubcaseMandatee(mandateeNumber, fieldNumber, domainNumber, mandateeSearchText, mandateeTitle);
  cy.wait('@patchAgendaitem', {
    timeout: 40000,
  }).wait('@patchAgenda', {
    timeout: 40000,
  });
  cy.log('/addAgendaitemMandatee');
}

/**
 * @name proposeSubcaseForAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {date} agendaDate - The list index of the mandatee
 */
function proposeSubcaseForAgenda(agendaDate) {
  cy.log('proposeSubcaseForAgenda');
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
  cy.route('PATCH', '/agendas/*').as('patchAgenda');
  cy.route('PATCH', '/subcases/*').as('patchSubcase');
  cy.route('POST', '/agenda-activities').as('createAgendaActivity');
  const monthDutch = getTranslatedMonth(agendaDate.month());
  const formattedDate = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;

  cy.get(cases.subcaseHeader.showProposedAgendas).click();

  cy.get(cases.subcaseHeader.actions.proposeForAgenda).contains(formattedDate)
    .click();
  cy.get(cases.subcaseHeader.showProposedAgendas)
    .should('not.exist');
  cy.wait('@createAgendaActivity')
    .wait('@createNewAgendaitem')
    .wait('@patchSubcase', {
      timeout: 24000,
    })
    .wait('@patchAgenda', {
      timeout: 24000,
    });
  cy.log('/proposeSubcaseForAgenda');
}

/**
 * @description deletes a subcase.
 * @name deleteSubcase
 * @memberOf Cypress.Chainable#
 * @function
 */
function deleteSubcase() {
  cy.log('deleteSubcase');
  cy.route('DELETE', '/subcases/**').as('deleteSubcase');
  cy.get(cases.subcaseHeader.actionsDropdown).click();
  cy.get(cases.subcaseHeader.actions.deleteSubcase).click();

  cy.get(utils.vlModalVerify.save).click();
  cy.wait('@deleteSubcase');
  cy.log('/deleteSubcase');
}

// ***********************************************
// Commands

Cypress.Commands.add('openSubcase', openSubcase);
Cypress.Commands.add('changeSubcaseAccessLevel', changeSubcaseAccessLevel);
Cypress.Commands.add('addSubcaseMandatee', addSubcaseMandatee);
Cypress.Commands.add('addAgendaitemMandatee', addAgendaitemMandatee);
Cypress.Commands.add('proposeSubcaseForAgenda', proposeSubcaseForAgenda);
Cypress.Commands.add('deleteSubcase', deleteSubcase);
Cypress.Commands.add('getTranslatedMonth', getTranslatedMonth);
