/* global  cy, Cypress */
// / <reference types="Cypress" />

// ***********************************************
// Commands

import cases from '../../selectors/case.selectors';
import utils from '../../selectors/utils.selectors';
import mandatee from '../../selectors/mandatees/mandateeSelectors';

// ***********************************************
// Functions
// TODO needs setupping to be sure to succeed.

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
  cy.get('.vlc-procedure-step').as('subcasesList');
  cy.get('@subcasesList').eq(index)
    .within(() => {
      cy.wait(1000); // sorry, link is not loaded most of the time
      cy.get('.auk-h4').eq(0)
        .click();
    });
  // cy.wait('@getCaseSubcases', { timeout: 12000 });
  cy.log('/openSubcase');
}

/**
 * Changes the subcase access levels and titles when used in the subcase view (/dossiers/..id../overzicht)
 * shortTitle is required to find the dom element
 * @name changeSubcaseAccessLevel
 * @memberOf Cypress.Chainable#
 * @function
 * @param {boolean} isRemark - Is this a subcase of type remark
 * @param {string} shortTitle - Current title of the subcase (same as case title unless already renamed)
 * @param {boolean} [confidentialityChange] -Will change the current confidentiality if true
 * @param {string} [accessLevel] -Access level to set, must match exactly with possible options in dropdown
 * @param {string} [newShortTitle] - new short title for the subcase
 * @param {string} [newLongTitle] - new long title for the subcase
 * @param {boolean} [inNewsletter] - Will toggle "in newsletter" if true
 */
function changeSubcaseAccessLevel(isRemark, shortTitle, confidentialityChange, accessLevel, newShortTitle, newLongTitle) {
  cy.log('changeSubcaseAccessLevel');
  cy.route('PATCH', '/subcases/*').as('patchSubcase');

  cy.get('.auk-h3').contains(shortTitle)
    .parents('.auk-u-mb-8')
    .within(() => {
      cy.get('a').click();
    });

  cy.get('.vlc-box').as('subcaseAccessLevel');

  if (accessLevel) {
    cy.get('@subcaseAccessLevel').within(() => {
      cy.get('.ember-power-select-trigger').click();
    });
    cy.get('.ember-power-select-option', {
      timeout: 5000,
    }).should('exist')
      .then(() => {
        cy.contains(accessLevel).click();
      });
  }

  cy.get('@subcaseAccessLevel').within(() => {
    if (isRemark) {
      cy.get('.vlc-input-field-block').as('editCaseForm');
      if (newLongTitle) {
        cy.get('@editCaseForm').eq(2)
          .within(() => {
            cy.get('.auk-textarea').click()
              .clear()
              .type(newLongTitle);
          });
      }
    } else {
      cy.get('.vlc-input-field-block').as('editCaseForm')
        .should('have.length', 3);
    }

    if (confidentialityChange) {
      cy.get('@editCaseForm').eq(0)
        .within(() => {
          cy.get('.vl-toggle__label').click();
        });
    }
    if (newShortTitle) {
      cy.get('@editCaseForm').eq(1)
        .within(() => {
          cy.get('.auk-textarea').click()
            .clear()
            .type(newShortTitle);
        });
    }
    if (newLongTitle) {
      cy.get('@editCaseForm').eq(2)
        .within(() => {
          cy.get('.auk-textarea').click()
            .clear()
            .type(newLongTitle);
        });
    }

    cy.get('.auk-toolbar-complex__item > .auk-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubcase', {
    timeout: 20000,
  });
  cy.log('/changeSubcaseAccessLevel');
}

/**
 * Changes the themes of a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * @name addSubcaseThemes
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Array<Number|String>} themes - An array of theme names that must match exactly or an array of numbers that correspond to the checkboxes in themes
 */
function addSubcaseThemes(themes) {
  cy.log('addSubcaseThemes');
  cy.route('GET', '/themes').as('getThemes');
  cy.route('PATCH', '/subcases/*').as('patchSubcase');
  cy.get('.auk-h3').contains('Thema\'s')
    .parents('.auk-u-mb-8')
    .as('subcaseTheme');

  cy.get('@subcaseTheme').within(() => {
    cy.get('a').click();
    // cy.wait('@getThemes', { timeout: 12000 });
    cy.get('.auk-checkbox', {
      timeout: 12000,
    }).should('exist')
      .end();
    themes.forEach((element) => {
      if (Number.isNaN(element)) {
        cy.get('.auk-checkbox').contains(element)
          .click();
      } else {
        cy.get('.auk-checkbox').eq(element)
          .click();
      }
    });
    cy.get('.auk-toolbar-complex__item > .auk-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubcase', {
    timeout: 20000,
  });
  cy.log('/addSubcaseThemes');
}

// TODO use arrays of fields and domains, search on mandatee name

/**
 * Adds a mandatees with field and domain to a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * Pass the title of the mandatee to get a specific person
 * @name addSubcaseThemes
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Number} mandateeNumber - The list index of the mandatee
 * @param {Number} fieldNumber - The list index of the field, -1 means no field/domain should be selected
 * @param {Number} domainNumber - The list index of the domain
 * @param {String} mandateeSearchText - Search on the minister title (name does not work)
 */
function addSubcaseMandatee(mandateeNumber, fieldNumber, domainNumber, mandateeSearchText) {
  cy.log('addSubcaseMandatee');

  if (mandateeSearchText) {
    cy.route('GET', `/mandatees?filter**filter**${mandateeSearchText.split(' ', 1)}**`).as('getFilteredMandatees');
  } else {
    cy.route('GET', '/mandatees?**').as('getMandatees');
  }

  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.route('GET', '/government-fields/**/domain').as(`getGovernmentFieldDomains${randomInt}`);
  cy.route('PATCH', '/subcases/*').as('patchSubcase');

  cy.get(mandatee.mandateePanelView.actions.edit).click();

  cy.get(mandatee.mandateePanelEdit.actions.add).contains('Minister toevoegen')
    .click();
  cy.get('.mandatee-selector-container').children('.ember-power-select-trigger')
    .click();
  // cy.get('.ember-power-select-search-input').type('g').clear(); // TODO added this because default data does not have active ministers
  if (mandateeSearchText) {
    cy.get('.ember-power-select-search-input').type(mandateeSearchText);
    cy.wait('@getFilteredMandatees', {
      timeout: 12000,
    });
  } else {
    cy.wait('@getMandatees', {
      timeout: 12000,
    });
  }
  cy.get('.ember-power-select-option--search-message', {
    timeout: 10000,
  }).should('not.exist'); // TODO added this because default data does not have active ministers
  cy.get('.ember-power-select-option', {
    timeout: 10000,
  }).should('exist')
    .then(() => {
      if (mandateeSearchText) {
        cy.get('.ember-power-select-option').contains(mandateeSearchText)
          .click();
      } else {
        cy.get('.ember-power-select-option').eq(mandateeNumber)
          .click();
      }
    });
  // TODO loading the isecodes and government fields takes time, are they not cacheble ?
  cy.wait(`@getGovernmentFieldDomains${randomInt}`, {
    timeout: 20000,
  });
  if (fieldNumber >= 0) {
    cy.get('.vlc-checkbox-tree', {
      timeout: 30000,
    }).should('exist')
      .eq(fieldNumber)
      .within(() => {
        cy.get(utils.checkboxLabel).eq(domainNumber)
          .click();
      });
  }
  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Toevoegen').click();
  });
  cy.get(mandatee.mandateePanelEdit.actions.save)
    .contains('Opslaan')
    .click();
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
 * @param {String} mandateeSearchText - Search on the minister title (name does not work)
 */
function addAgendaitemMandatee(mandateeNumber, fieldNumber, domainNumber, mandateeSearchText) {
  cy.log('addAgendaitemMandatee');

  cy.route('PATCH', '/agendaitems/*').as('patchAgendaitem');
  cy.route('PATCH', '/agendas/*').as('patchAgenda');

  cy.addSubcaseMandatee(mandateeNumber, fieldNumber, domainNumber, mandateeSearchText);
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

  cy.get('.vlc-page-header').within(() => {
    cy.get('.auk-button', {
      timeout: 12000,
    }).should('have.length', 2);
    cy.get('.auk-button').contains('Indienen voor agendering')
      .should('exist')
      .click();
  });

  cy.get('.ember-attacher-show').within(() => {
    cy.contains(formattedDate).click();
  });
  cy.contains('Indienen voor agendering')
    .should('not.exist');
  cy.wait('@createAgendaActivity', {
    timeout: 20000,
  })
    .wait('@createNewAgendaitem', {
      timeout: 20000,
    })
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
  cy.get('.auk-button')
    .contains('Acties')
    .click();
  cy.get(cases.deleteSubcase)
    .contains('Procedurestap verwijderen')
    .click();

  cy.get('.auk-modal').as('dialog')
    .within(() => {
      cy.get('button').contains('Verwijderen')
        .click();
    });
  cy.wait('@deleteSubcase', {
    timeout: 20000,
  });
  cy.log('/deleteSubcase');
}

Cypress.Commands.add('openSubcase', openSubcase);
Cypress.Commands.add('changeSubcaseAccessLevel', changeSubcaseAccessLevel);
Cypress.Commands.add('addSubcaseThemes', addSubcaseThemes);
Cypress.Commands.add('addSubcaseMandatee', addSubcaseMandatee);
Cypress.Commands.add('addAgendaitemMandatee', addAgendaitemMandatee);
Cypress.Commands.add('proposeSubcaseForAgenda', proposeSubcaseForAgenda);
Cypress.Commands.add('deleteSubcase', deleteSubcase);
Cypress.Commands.add('getTranslatedMonth', getTranslatedMonth);
