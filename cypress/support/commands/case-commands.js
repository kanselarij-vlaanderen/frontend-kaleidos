/* global cy,Cypress */
// / <reference types="Cypress" />

// ***********************************************
// Functions
import search from '../../selectors/search.selectors';

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
  cy.log('createCase');
  cy.route('POST', '/cases').as('createNewCase');
  cy.visit('/dossiers');

  cy.get('.vlc-page-header .vl-button')
    .contains('Nieuw dossier aanmaken')
    .click();

  cy.get('.auk-modal').as('dialog')
    .within(() => {
      cy.get('.vlc-input-field-block').as('newCaseForm')
        .should('have.length', 2);
    });

  // Set confidentiality
  if (confidential) {
    cy.get('@newCaseForm').eq(0)
      .within(() => {
        cy.get('.vl-toggle__label').click();
      });
  }

  // Set short title
  cy.get('@newCaseForm').eq(1)
    .within(() => {
      cy.get('.auk-textarea').click()
        .type(shortTitle);
    });

  cy.get('@dialog').within(() => {
    cy.get('.vlc-toolbar__item > .vl-button').contains('Dossier aanmaken')
      .click();
  });

  let caseId;

  cy.wait('@createNewCase', {
    timeout: 20000,
  })
    .then((res) => {
      caseId = res.responseBody.data.id;
      cy.visit(`/dossiers/${caseId}/deeldossiers`);
    }) // TODO after a successfull post, the get sometimes fails
    .then(() => new Cypress.Promise((resolve) => {
      resolve(caseId);
    }));
  cy.log('/createCase');
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
  cy.server();
  cy.log('addSubcase');
  cy.route('POST', '/subcases').as('addSubcase-createNewSubcase');

  cy.wait(2000);

  cy.get('.vlc-page-header .auk-button')
    .contains('Procedurestap toevoegen')
    .click();

  cy.get('.vlc-input-field-block').should('have.length', 5);

  // Set the type
  if (type) {
    cy.get('.vlc-input-field-block').eq(0)
      .within(() => {
        cy.contains(type).scrollIntoView()
          .click();
      });
  }

  // Set the short title
  if (newShortTitle) {
    cy.get('.vlc-input-field-block').eq(1)
      .within(() => {
        cy.get('.auk-textarea').click()
          .clear()
          .type(newShortTitle);
      });
  }

  // Set the long title
  if (longTitle) {
    cy.get('.vlc-input-field-block').eq(2)
      .within(() => {
        cy.get('.auk-textarea').click()
          .clear()
          .type(longTitle);
      });
  }

  // Set the step type
  if (step) {
    cy.get('.vlc-input-field-block').eq(3)
      .within(() => {
        cy.get('.ember-power-select-trigger').click();
      });
    cy.get('.ember-power-select-option', {
      timeout: 5000,
    }).should('exist')
      .then(() => {
        cy.contains(step).scrollIntoView()
          .trigger('mouseover')
          .click();
        // TODO Experiment for dropdown flakyness
        cy.get('.ember-power-select-option', {
          timeout: 15000,
        }).should('not.be.visible');
      });
  }

  // Set the step name
  if (stepName) {
    cy.get('.vlc-input-field-block').eq(4)
      .within(() => {
        cy.get('.ember-power-select-trigger').click();
      });
    cy.get('.ember-power-select-option', {
      timeout: 5000,
    }).should('exist')
      .then(() => {
        cy.contains(stepName).scrollIntoView()
          .trigger('mouseover')
          .click();
        // TODO Experiment for dropdown flakyness
        cy.get('.ember-power-select-option', {
          timeout: 15000,
        }).should('not.be.visible');
      });
  }

  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Procedurestap aanmaken').click();
  });

  let subcaseId;

  cy.wait('@addSubcase-createNewSubcase', {
    timeout: 20000,
  })
    .then((res) => {
      subcaseId = res.responseBody.data.id;
    })
    .then(() => new Cypress.Promise((resolve) => {
      resolve(subcaseId);
    }));
  cy.log('/addSubcase');
}

/**
 * @description Navigates to the dossier route with page size 100 and opens the specified case if found.
 * @name openCase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} caseTitle The title to search in the list of cases, should be unique
 */
function openCase(caseTitle) {
  cy.log('openCase');
  cy.visit('dossiers?aantal=50');
  cy.get('.data-table > tbody', {
    timeout: 20000,
  }).children()
    .as('rows');
  cy.get('@rows').within(() => {
    cy.contains(caseTitle).parents('tr')
      .click();
  });
  cy.log('/openCase');
}

/**
 * @description Navigates to the dossier search route with page and searches for the specified case.
 * @name searchCase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} caseTitle The title to search in the list of cases, should be unique
 */
function searchCase(caseTitle) {
  cy.log('seachCsearchCasease');
  cy.visit('zoeken/dossiers');
  cy.get('#dossierId').type(caseTitle);
  const splitCaseTitle =  `${caseTitle.split(' ', 1)}`;
  // this new part is required to translate 'testId=xxxx:' into its encoded form for url
  const encodedCaseTitle = splitCaseTitle.replace('=', '%3D').replace(':', '%3A');
  cy.route('GET', `/cases/search?**${splitCaseTitle}**`).as('getCaseSearchResult');
  cy.get(search.searchButtonToClick)
    .click()
    .wait('@getCaseSearchResult');
  cy.contains('Aan het laden...').should('not.exist');
  cy.url().should('include', `?zoekterm=${encodedCaseTitle}`);
  cy.get('.data-table > tbody', {
    timeout: 20000,
  }).children()
    .as('rows');
  cy.get('@rows').within(() => {
    cy.contains(caseTitle).parents('tr')
      .click();
  });
  cy.log('/searchCase');
}

// Commands

Cypress.Commands.add('createCase', createCase);
Cypress.Commands.add('addSubcase', addSubcase);
Cypress.Commands.add('openCase', openCase);
Cypress.Commands.add('searchCase', searchCase);
