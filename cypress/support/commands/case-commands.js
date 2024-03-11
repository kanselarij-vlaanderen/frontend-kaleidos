/* global cy,Cypress */
// / <reference types="Cypress" />

// ***********************************************
// Functions
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';


/**
 * @description Goes to the case overview and creates a new case
 * @name createCase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} shortTitle The title of the case
 * @returns {Promise<String>} the id of the created case
 */
function createCase(shortTitle) {
  cy.log('createCase');
  cy.intercept('POST', '/decisionmaking-flows').as('createNewCase');
  cy.visit('/dossiers?aantal=10');
  cy.get(appuniversum.loader);
  cy.get(appuniversum.loader).should('not.exist');

  cy.get(cases.casesHeader.addCase).click();
  cy.get(cases.newCase.shorttitle).type(shortTitle);
  cy.get(auk.confirmationModal.footer.confirm).click();

  let caseId;
  cy.log('/createCase');
  cy.wait('@createNewCase')
    .its('response.body')
    .then((responseBody) => {
      caseId = responseBody.data.id;
    })
    .then(() => new Cypress.Promise((resolve) => {
      resolve({
        caseId,
      });
    }));
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
  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.log('addSubcase');
  cy.intercept('POST', '/subcases').as(`addSubcase-createNewSubcase${randomInt}`);
  cy.intercept('GET', '/decisionmaking-flows/**/subcases').as(`addSubcase-reloadDecisionmakingFlow${randomInt}`);
  // TODO-COMMAND is this wait needed?
  cy.wait(2000);

  cy.get(cases.subcaseOverviewHeader.createSubcase).click();

  // Set the type
  if (type) {
    cy.get(cases.newSubcase.type).contains(type)
      .scrollIntoView()
      .click();
  }

  // Set the short title
  if (newShortTitle) {
    cy.get(cases.newSubcase.shorttitle).click()
      .clear()
      .type(newShortTitle);
  }

  // Set the long title
  if (longTitle) {
    cy.get(cases.newSubcase.longtitle).click()
      .clear()
      .type(longTitle);
  }

  // Set the step type
  if (step) {
    cy.get(cases.newSubcase.procedureStep).click();
    cy.get(dependency.emberPowerSelect.option).contains(step)
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.exist');
  }

  // Set the step name
  if (stepName) {
    cy.get(cases.newSubcase.procedureName).click();
    cy.get(dependency.emberPowerSelect.option).contains(stepName)
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.exist');
  }
  cy.get(appuniversum.loader).should('not.exist');
  cy.get(cases.newSubcase.save).click();

  let subcaseId;
  cy.log('/addSubcase');
  cy.wait(`@addSubcase-createNewSubcase${randomInt}`)
    .its('response.body')
    .then((responseBody) => {
      subcaseId = responseBody.data.id;
    });
  cy.wait(`@addSubcase-reloadDecisionmakingFlow${randomInt}`)
    .then(() => new Cypress.Promise((resolve) => {
      resolve({
        subcaseId,
      });
    }));
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
  cy.get(route.casesOverview.dataTable).contains(caseTitle)
    .parents('tr')
    .click();
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
  cy.log('searchCase');
  cy.visit('zoeken/dossiers');
  cy.get(route.search.input).type(caseTitle);
  const splitCaseTitle =  `${caseTitle.split(' ', 1)}`;
  // this new part is required to translate 'testId=xxxx:' into its encoded form for url
  const encodedCaseTitle = encodeURIComponent(splitCaseTitle);
  cy.intercept('GET', `/decisionmaking-flows/search?**${encodedCaseTitle}**`).as('decisionmakingSearchResult');
  cy.get(route.search.trigger)
    .click()
    .wait('@decisionmakingSearchResult');
  cy.get(appuniversum.loader).should('not.exist');
  cy.url().should('include', `?zoekterm=${encodedCaseTitle}`);
  cy.get(route.searchCases.dataTable).contains(caseTitle)
    .parents('tr')
    .click();
  cy.log('/searchCase');
}

/**
 * @description Creates a new subcase from an open case overview.
 * @name addSubcaseViaModal
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} type Type of subcase, case sensitive
 * @param {boolean} confidential optional boolean to toggle confidentiality
 * @param {String} newShortTitle The new short title of the subcase (null to keep the existing case title)
 * @param {String} longTitle The long title of the subcase
 * @param {String} step The step to be selected from the list, case sensitive
 * @param {String} stepName The step name to be selected from the list, case sensitive
 * @param {String[]} mandatees The names of the mandatees
 * @param {string[name, selected, fields]} domains The name of the domain, wether it is selected as petitioner and fields, if any
 * @param {{folder: String, fileName: String, fileExtension: String, [newFileName]: String, [fileType]: String}[]} files
 * @param {boolean} formallyOk optional boolean to toggle formally ok
 * @param {String} agendaDate Agendadate as string
 * @returns {Promise<String>} the id of the created subcase
 */
function addSubcaseViaModal(type, confidential = false, newShortTitle, longTitle, step, stepName, mandatees, domains, documents, formallyOk = false, agendaDate = null) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.log('addSubcaseViaModal');
  cy.intercept('POST', '/subcases').as(`createNewSubcase${randomInt}`);
  cy.intercept('POST', '/meetings/*/submit').as(`submitToMeeting${randomInt}`);
  // TODO-COMMAND is this wait needed?
  cy.wait(2000);

  cy.get(cases.subcaseOverviewHeader.openAddSubcase).click();

  // Set the type
  if (type) {
    cy.get(appuniversum.radio).contains(type)
      .scrollIntoView()
      .click();
  }

  // toggle confidential
  if (confidential) {
    cy.get(cases.newSubcaseForm.toggleConfidential).parent()
      .scrollIntoView()
      .click();
  }

  // Set the short title
  if (newShortTitle) {
    cy.get(cases.newSubcaseForm.shorttitle).click()
      .clear()
      .type(newShortTitle);
  }

  // Set the long title
  if (longTitle) {
    cy.get(cases.newSubcaseForm.longtitle).click()
      .clear()
      .type(longTitle);
  }

  // Set the step type
  if (step) {
    cy.get(cases.newSubcaseForm.procedureStep).click();
    cy.get(dependency.emberPowerSelect.option).contains(step)
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.exist');
  }

  // Set the step name
  if (stepName) {
    cy.get(cases.newSubcaseForm.procedureName).click();
    cy.get(dependency.emberPowerSelect.option).contains(stepName)
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.exist');
  }

  // add mandatees
  if (mandatees) {
    let count = 0;
    mandatees.forEach((mandatee) => {
      cy.get(cases.newSubcaseForm.mandateeSelectorPanel.container).find(appuniversum.checkbox)
        .contains(mandatee.name)
        .click();
      if (mandatee.submitter && count > 0) {
        cy.get(cases.newSubcaseForm.mandateeSelectorPanel.selectedMinister).contains(mandatee.name)
          .parent()
          .find(appuniversum.radio)
          .click();
      }
      count++;
    });
  }

  // add domains
  if (domains) {
    domains.forEach((domain) => {
      cy.get(cases.newSubcaseForm.governmentAreasPanel, {
        timeout: 60000,
      })
        .contains(domain.name)
        .as('domain');
      if (domain.selected) {
        cy.get('@domain')
          .click();
      }
      if (domain.fields) {
        domain.fields.forEach((field)  => {
          cy.get('@domain')
            .siblings(cases.newSubcaseForm.areasPanelFieldsList)
            .contains(field)
            .click();
        });
      }
    });
  }

  // add documents
  if (documents) {
    cy.addNewDocumentsInSubcaseFileUpload(documents);
  }

  // go to save modal
  cy.get(appuniversum.loader).should('not.exist');
  cy.get(cases.newSubcaseForm.save).click();

  if (formallyOk) {
    cy.get(cases.proposableAgendas.toggleFormallyOk).parent()
      .click();
  }

  // select the agenda or save without one
  if (agendaDate) {
    cy.get(cases.proposableAgendas.agendaRow).children()
      .contains(agendaDate)
      .scrollIntoView()
      .click();
    cy.get(cases.proposableAgendas.placeOnAgenda).click();
  } else {
    cy.get(cases.proposableAgendas.saveWithoutAgenda).click();
  }

  let subcaseId;
  cy.log('/addSubcaseViaModal');
  cy.wait(`@createNewSubcase${randomInt}`)
    .its('response.body')
    .then((responseBody) => {
      subcaseId = responseBody.data.id;
    });
  cy.wait(`@submitToMeeting${randomInt}`, {
    timeout: 60000,
  })
    .then(() => new Cypress.Promise((resolve) => {
      resolve({
        subcaseId,
      });
    }));
}

// Commands

Cypress.Commands.add('createCase', createCase);
Cypress.Commands.add('addSubcase', addSubcase);
Cypress.Commands.add('openCase', openCase);
Cypress.Commands.add('searchCase', searchCase);
Cypress.Commands.add('addSubcaseViaModal', addSubcaseViaModal);
