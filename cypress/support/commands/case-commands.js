/*global cy,Cypress*/
/// <reference types="Cypress" />

// ***********************************************
// Commands

Cypress.Commands.add('createCase', createCase);
Cypress.Commands.add('addSubcase', addSubcase);
Cypress.Commands.add('openCase', openCase);
// ***********************************************
// Functions

/**
 * @description Goes to the case overview and creates a new case
 * @name createCase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {boolean} confidential Weather confidential is to be set to true
 * @param {String} shortTitle The title of the case
 * @returns {Promise<String>} the id of the created case
 */
function createCase(confidential, shortTitle) {
  cy.route('POST', '/cases').as('createNewCase');
  cy.visit('/dossiers');

  cy.get('.vlc-toolbar__item .vl-button')
    .contains('Nieuw dossier aanmaken')
    .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() => {
    cy.get('.vlc-input-field-block').as('newCaseForm').should('have.length', 2);
  });

  // Set confidentiality
  if (confidential) {
    cy.get('@newCaseForm').eq(0).within(() => {
      cy.get('.vl-checkbox--switch__label').click();
    });
  }

  // Set short title
  cy.get('@newCaseForm').eq(1).within(() => {
    cy.get('.vl-textarea').click().type(shortTitle);
  });

  cy.get('@dialog').within(() => {
    cy.get('.vlc-toolbar__item > .vl-button').contains('Dossier aanmaken').click();
  });

  let caseId;

  cy.wait('@createNewCase', { timeout: 20000 })
    .then((res) => {
      caseId = res.responseBody.data.id;
    })
    .then(() => {
      return new Cypress.Promise((resolve) => {
        resolve(caseId);
      });
    });
}


/**
 * @description Creates a new subcase from an open case overview.
 * @name addSubcase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} type Type of subcase, case sensitive
 * @param {String} newShortTitle The new short title of the subcase (null to keep the existing case title)
 * @param {String} longTitle The long title of the subcase
 * @param {String} step The step to be selected from the list, case sensitive
 * @param {String} stepName The step name to be selected from the list, case sensitive
 * @returns {Promise<String>} the id of the created subcase
 */
function addSubcase(type, newShortTitle, longTitle, step, stepName) {
  cy.route('POST', '/subcases').as('createNewSubcase');
  cy.route('POST', '/newsletter-infos').as('createNewsletter');

  cy.wait(2000);

  cy.get('.vlc-toolbar__item .vl-button')
    .contains('Procedurestap toevoegen')
    .click();

  cy.get('.vlc-input-field-block').should('have.length', 5);

  //Set the type
  cy.get('.vlc-input-field-block').eq(0).within(() => {
    cy.contains(type).scrollIntoView().click();
  });

  // Set the short title
  if (newShortTitle) {
    cy.get('.vlc-input-field-block').eq(1).within(() => {
      cy.get('.vl-textarea').click().clear().type(newShortTitle);
    });
  }

  // Set the long title
  cy.get('.vlc-input-field-block').eq(2).within(() => {
    cy.get('.vl-textarea').click().clear().type(longTitle);
  });

  // Set the step type
  cy.get('.vlc-input-field-block').eq(3).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
    cy.contains(step).trigger('mouseover').click();
  });

  // Set the step name
  cy.get('.vlc-input-field-block').eq(4).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
    cy.contains(stepName).trigger('mouseover').click();
  });

  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Procedurestap aanmaken').click();
  });

  let subcaseId;

  cy.wait('@createNewsletter', { timeout: 10000 })
    .then((res) => {
      subcaseId = res.responseBody.data.id;
    });
  cy.wait('@createNewSubcase', { timeout: 10000 })
    .then(() => {
      return new Cypress.Promise((resolve) => {
        resolve(subcaseId);
      });
    });
}

/**
 * @description Navigates to the dossier route with page size 100 and opens the specified case if found.
 * @name openCase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} caseTitle The title to search in the list of cases, should be unique
 */
function openCase(caseTitle) {
  cy.visit('dossiers');
  cy.get('#dossierId').type(caseTitle);
  cy.route('GET', `/cases/search?**${caseTitle.split(" ", 1)}**`).as('getCaseSearchResult');
  cy.contains('zoeken')
    .click()
    .wait('@getCaseSearchResult');
  cy.contains('Aan het laden...').should('not.exist');
  cy.get('.data-table > tbody', { timeout: 20000 }).children().as('rows');
  cy.get('@rows').within(() => {
    cy.contains(caseTitle).parents('tr').click();
  });
}
