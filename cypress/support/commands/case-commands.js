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
  cy.visit('/dossiers?aantal=2');
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
 * @description Navigates to the dossier route with page size 100 and opens the specified case if found.
 * @name openCase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} caseTitle The title to search in the list of cases, should be unique
 */
function openCase(caseTitle) {
  cy.log('openCase');
  cy.visit('dossiers?aantal=2');
  cy.intercept('GET', '/cases?filter**').as('getFilteredCases');
  cy.get(cases.casesHeader.filter).clear()
    .type(caseTitle);
  cy.wait('@getFilteredCases', {
    timeout: 40000,
  });
  cy.get(route.casesOverview.dataTable, {
    timeout: 60000,
  }).contains(caseTitle)
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
 * @param {
 *  {
 *    newCase: Boolean
 *    agendaitemType: String,
 *    confidential: Boolean,
 *    newShortTitle: String,
 *    longTitle: String,
 *    subcaseType: String,
 *    subcaseName: String,
 *    [mandatees]: String,
 *    [domains]: String,
 *    [documents]: String,
 *    formallyOk: Boolean,
 *    agendaDate: String,
 *    clonePrevious: Boolean,
 *  }[]
 * } subcase
 * @returns {Promise<String>} the id of the created subcase
 */
function addSubcaseViaModal(subcase) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.log('addSubcaseViaModal');
  cy.intercept('POST', '/subcases').as(`createNewSubcase${randomInt}`);
  cy.intercept('POST', '/meetings/*/submit').as(`submitToMeeting${randomInt}`);
  cy.intercept('POST', '/submission-activities').as(`postSubmissionActivities${randomInt}`);
  cy.intercept('GET', '/mandatees**').as(`getMandatees${randomInt}`);
  cy.intercept('GET', '/government-bodies**').as(`getGovernmentBodies${randomInt}`);

  // after creating a case we are already on the page to add a subcase
  if (!subcase.newCase) {
    cy.get(cases.subcaseOverviewHeader.openAddSubcase).click();
  }

  cy.wait(`@getMandatees${randomInt}`, {
    timeout: 60000,
  });
  cy.wait(`@getGovernmentBodies${randomInt}`, {
    timeout: 60000,
  });

  // Set the type
  if (subcase.agendaitemType) {
    cy.get(appuniversum.radio).contains(subcase.agendaitemType)
      .scrollIntoView()
      .click();
  }

  // toggle confidential
  if (subcase.confidential) {
    cy.get(cases.newSubcaseForm.toggleConfidential).parent()
      .scrollIntoView()
      .click();
  }

  // Set the short title
  if (subcase.newShortTitle) {
    cy.get(cases.newSubcaseForm.shorttitle).click()
      .clear()
      .type(subcase.newShortTitle);
  }

  // Set the long title
  if (subcase.longTitle) {
    cy.get(cases.newSubcaseForm.longtitle).click()
      .clear()
      .type(subcase.longTitle);
  }

  // Set the subcase type
  if (subcase.subcaseType) {
    cy.get(cases.newSubcaseForm.procedureStep).click();
    // types start lowercase and contains capitals, check case insensitive
    cy.get(dependency.emberPowerSelect.option).contains(subcase.subcaseType,
      {
        matchCase: false,
      })
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.exist');
  }

  // Set the subcase name
  if (subcase.subcaseName) {
    cy.get(cases.newSubcaseForm.procedureName).click();
    // names start upperCase and contains capitals, check case insensitive
    cy.get(dependency.emberPowerSelect.option).contains(subcase.subcaseName,
      {
        matchCase: false,
      })
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.exist');
  }

  // add mandatees
  if (subcase.mandatees) {
    let count = 0;
    subcase.mandatees.forEach((mandatee) => {
      cy.get(cases.newSubcaseForm.mandateeSelectorPanel.container).find(appuniversum.checkbox)
        .contains(mandatee.fullName)
        .click();
      if (mandatee.submitter && count > 0) {
        cy.get(cases.newSubcaseForm.mandateeSelectorPanel.selectedMinister).contains(mandatee.fullName)
          .parent()
          .find(appuniversum.radio)
          .click();
      }
      count++;
    });
  }

  // add domains
  if (subcase.domains) {
    subcase.domains.forEach((domain) => {
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
  if (subcase.documents) {
    cy.addNewDocumentsInSubcaseFileUpload(subcase.documents);
  }

  if (subcase.clonePrevious) {
    cy.get(cases.newSubcaseForm.clonePrevious).click();
    // no option to put on agenda as of yet
    // putting this last since it should be possible to make a copy with changes made above
  } else {
    // go to save modal
    cy.get(appuniversum.loader).should('not.exist', {
      timeout: 60000,
    });
    cy.get(cases.newSubcaseForm.save).click();

    if (subcase.formallyOk) {
      cy.get(cases.proposableAgendas.toggleFormallyOk).parent()
        .click();
    }

    // select the agenda or save without one
    if (subcase.agendaDate) {
      cy.get(cases.proposableAgendas.agendaRow).children()
        .contains(subcase.agendaDate)
        .scrollIntoView()
        .click();
      cy.get(cases.proposableAgendas.placeOnAgenda).click();
    } else {
      cy.get(cases.proposableAgendas.saveWithoutAgenda).click();
    }
  }

  cy.wait(`@createNewSubcase${randomInt}`);
  if (subcase.documents) {
    cy.wait(`@postSubmissionActivities${randomInt}`);
  }
  if (subcase.agendaDate) {
    cy.wait(`@submitToMeeting${randomInt}`, {
      timeout: 60000,
    });
    cy.get(cases.subcaseDescription.agendaLink, {
      timeout: 60000,
    });
  }
  // check if we have transitioned to the detail page (Do we want to check/return the number from the responsebody?)
  cy.get(cases.subcaseDescription.panel);
  cy.log('/addSubcaseViaModal');
}

/**
 * @description basic visit to case with some data loading
 * @name visitCaseWithLink
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} link The link to visit, should be "/dossiers/id/deeldossiers/id" or "/dossiers/id/deeldossiers"
 */
function visitCaseWithLink(link) {
  cy.log('visitCaseWithLink');
  cy.visit(link);
  // When opening a case with subcase, you should always get a loading screen.
  // Concept-schemes loaded at application level show a blank screen, checking for loader to get past the white screen
  // cy.get(appuniversum.loader).should('exist'); // this checking for loader sometimes fails
  // high wait times because more docs equals more waiting
  cy.get(cases.subcaseOverviewHeader.titleContainer, {
    timeout: 100000,
  }).should('exist');
  cy.get(appuniversum.loader, {
    timeout: 100000,
  }).should('not.exist');
  cy.log('/visitCaseWithLink');
}

// Commands

Cypress.Commands.add('createCase', createCase);
Cypress.Commands.add('openCase', openCase);
Cypress.Commands.add('searchCase', searchCase);
Cypress.Commands.add('addSubcaseViaModal', addSubcaseViaModal);
Cypress.Commands.add('visitCaseWithLink', visitCaseWithLink);
