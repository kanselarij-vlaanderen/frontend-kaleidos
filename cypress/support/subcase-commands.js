/*global  cy, Cypress*/
/// <reference types="Cypress" />

// ***********************************************
// Commands

Cypress.Commands.add('openSubcase', openSubcase);
Cypress.Commands.add('changeSubcaseAccessLevel', changeSubcaseAccessLevel);
Cypress.Commands.add('addSubcaseThemes', addSubcaseThemes);
Cypress.Commands.add('addSubcaseMandatee', addSubcaseMandatee);
Cypress.Commands.add('proposeSubcaseForAgenda', proposeSubcaseForAgenda);
Cypress.Commands.add('deleteSubcase', deleteSubcase);

// ***********************************************
// Functions


/**
 * Open the subcase of the specified index.
 * @memberOf Cypress.Chainable#
 * @name openSubcase
 * @function
 * @param {number} [index] The list index of the subcase to select, default 0
 */
function openSubcase(index=0){
  // cy.route('GET', '/subcases?**').as('getSubcases');
  // cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
  // cy.wait('@getSubcases', { timeout: 12000 });
  cy.wait(2000); //link does not always work (not visible or click does nothing unless we wait)
  cy.get('.vlc-procedure-step').as('subcasesList');
  cy.get('@subcasesList').eq(index).within(() => {
    cy.wait(1000); //sorry, link is not loaded most of the time
    cy.get('.vl-title').click();
  })
  // cy.wait('@getCaseSubcases', { timeout: 12000 });
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
  cy.route('PATCH','/subcases/*').as('patchSubcase');

  cy.get('.vl-title--h4').contains(shortTitle).parents('.vl-u-spacer-extended-bottom-l').within(() => {
    cy.get('a').click();
  });

  cy.get('.vl-form__group').as('subcaseAccessLevel');

  if(accessLevel) {
    cy.get('@subcaseAccessLevel').within(() => {
      cy.get('.ember-power-select-trigger').click();
    });
    cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
      cy.contains(accessLevel).click();
    });

  }

  cy.get('@subcaseAccessLevel').within(() => {
    if(isRemark) {
      cy.get('.vlc-input-field-block').as('editCaseForm').should('have.length', 4);
      if(newLongTitle) {
        cy.get('@editCaseForm').eq(2).within(() => {
          cy.get('.vl-textarea').click().clear().type(newLongTitle);
        });
      }
    } else {
      cy.get('.vlc-input-field-block').as('editCaseForm').should('have.length', 3);
    }


    if(confidentialityChange) {
      cy.get('@editCaseForm').eq(0).within(() => {
        cy.get('.vl-checkbox--switch__label').click();
      });
    }
    if(newShortTitle) {
      cy.get('@editCaseForm').eq(1).within(() => {
        cy.get('.vl-textarea').click().clear().type(newShortTitle);
      });
    }
    if(newLongTitle) {
      cy.get('@editCaseForm').eq(2).within(() => {
        cy.get('.vl-textarea').click().clear().type(newLongTitle);
      });
    }

    cy.get('.vl-action-group > .vl-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubcase', { timeout: 20000 });
}


/**
 * Changes the themes of a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * @name addSubcaseThemes
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Array<Number|String>} themes - An array of theme names that must match exactly or an array of numbers that correspond to the checkboxes in themes
 */
function addSubcaseThemes(themes) {
  cy.route('GET', '/themes').as('getThemes');
  cy.route('PATCH','/subcases/*').as('patchSubcase');
  cy.get('.vl-title--h4').contains(`Thema's`).parents('.vl-u-spacer-extended-bottom-l').as('subcaseTheme');

  cy.get('@subcaseTheme').within(() => {
    cy.get('a').click();
    // cy.wait('@getThemes', { timeout: 12000 });
    cy.get('.vl-checkbox', { timeout: 12000 }).should('exist').end();
    themes.forEach(element => {
      if(isNaN(element)){
        cy.get('.vl-checkbox').contains(element).click();
      } else {
        cy.get('.vl-checkbox').eq(element).click();
      }

    });
    cy.get('.vl-action-group > .vl-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubcase', { timeout: 20000 });
}

//TODO use arrays of fields and domains, search on mandatee name

/**
 * Adds a mandatees with field and domain to a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * @name addSubcaseThemes
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Number} mandateeNumber - The list index of the mandatee
 * @param {Number} fieldNumber - The list index of the field
 * @param {Number} domainNumber - The list index of the domain
 */
function addSubcaseMandatee(mandateeNumber, fieldNumber, domainNumber) {
  cy.route('GET', '/mandatees?**').as('getMandatees');
  cy.route('GET', '/ise-codes/**').as('getIseCodes');
  cy.route('GET', '/government-fields/**').as('getGovernmentFields');
  cy.route('PATCH','/subcases/*').as('patchSubcase');

  cy.get('.vl-title--h4').contains(`Ministers en beleidsvelden`).parents('.vl-u-spacer-extended-bottom-l').as('subcaseMandatees');
  cy.get('@subcaseMandatees').within(() => {
    cy.get('.vl-u-spacer-extended-left-s', { timeout: 5000 }).should('exist').then(() => {
      cy.contains('Wijzigen').click();
    });
  });

  cy.get('.vlc-box a').contains('Minister toevoegen').click();
  cy.get('.mandatee-selector-container').children('.ember-power-select-trigger').click();
  cy.wait('@getMandatees', { timeout: 12000 });
  cy.get('.ember-power-select-option', { timeout: 10000 }).should('exist').then(() => {
    cy.get('.ember-power-select-option').eq(mandateeNumber).click();
  });
  //TODO loading the isecodes and government fields takes time to load, are they be cached for reuse ?
  cy.wait('@getIseCodes', { timeout: 20000 });
  cy.wait('@getGovernmentFields', { timeout: 20000 });
  cy.get('.vlc-checkbox-tree', { timeout: 20000 }).should('exist').eq(fieldNumber).within(() => {
    cy.get('.vl-checkbox').eq(domainNumber).click();
  });
  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Toevoegen').click();
  });
  cy.get('@subcaseMandatees').within(() => {
    cy.get('.vlc-toolbar')
    .contains('Opslaan')
    .click();
  });
  cy.wait('@patchSubcase', { timeout: 20000 });
}

/**
 * @name proposeSubcaseForAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {date} agendaDate - The list index of the mandatee
 */
function proposeSubcaseForAgenda (agendaDate) {
  cy.route('POST','/agendaitems').as('createNewAgendaitem');
  cy.route('PATCH','/agendas/*').as('patchAgenda');
  cy.route('PATCH','/subcases/*').as('patchSubcase');
  cy.route('POST','/subcase-phases').as('createSubcasePhase');
  const monthDutch = getTranslatedMonth(agendaDate.month());
  const formattedDate = agendaDate.date() + ' ' + monthDutch + ' ' + agendaDate.year();

  cy.get('.vlc-page-header').within(() => {
    cy.get('.vl-button', { timeout: 12000 }).should('have.length', 2);
    cy.get('.vl-button').contains('Indienen voor agendering').should('exist').click();

  });
  cy.get('.ember-attacher-show').within(() => {
    cy.contains(formattedDate).click();
  });
  cy.wait('@createNewAgendaitem', { timeout: 12000 });
  cy.wait('@patchAgenda', { timeout: 12000 });
  cy.wait('@patchSubcase', { timeout: 12000 });
  cy.wait('@createSubcasePhase', { timeout: 12000 });
}

/**
 * @description deletes a subcase.
 * @name deleteSubcase
 * @memberOf Cypress.Chainable#
 * @function
 */
function deleteSubcase() {
  cy.route('DELETE', '/subcases/**').as('deleteSubcase');
  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
  cy.get('.vl-popover__link-list__item > .vl-link')
    .contains('Procedurestap verwijderen')
    .click()

  cy.get('.vl-modal-dialog').as('dialog').within(() => {
    cy.get('button').contains('Procedurestap verwijderen').click();
  })
  cy.wait('@deleteSubcase', { timeout: 20000 });
}


/**
 * @description Translates a month number to a dutch month in lowercase.
 * @name getTranslatedMonth
 * @memberOf Cypress.Chainable#
 * @function
 * @param {number} month the number of the month to translate (from moment so starts from 0)
 * @returns the month in dutch
 */
function getTranslatedMonth(month){
  switch(month) {
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
      break;
  }
}
