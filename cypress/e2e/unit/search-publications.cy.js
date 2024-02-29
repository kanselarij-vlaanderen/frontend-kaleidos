/* global context, xit, it, cy, beforeEach, afterEach, Cypress, it */
// / <reference types="Cypress" />
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';

function visitPublicationSearch() {
  cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
  cy.intercept('GET', '/publication-flows/search?**').as('publicationInitialSearchCall');
  cy.intercept('GET', '/mandatees?**').as('getMandatees');
  cy.visit('publicaties/overzicht/zoeken');
  cy.wait('@getRegulationTypes');
  cy.wait('@publicationInitialSearchCall');
  cy.wait('@getMandatees');
}

function visitPublications() {
  cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
  cy.visit('/publicaties');
  cy.wait('@getRegulationTypes');
  cy.get(appuniversum.loader, {
    timeout: 60000,
  }).should('not.exist');
}

function checkPublicationSearch(searchTerm, result) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(route.search.input).clear()
    .type(searchTerm);
  cy.get(route.search.trigger).click();
  cy.wait(`@publicationSearchCall${randomInt}`);
  cy.wait(1000); // TODO flakyness because of postprocessing of the results
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(result);
  searchFakePublication();
}

function checkPublicationSearchForDateType(dateType, date, pubNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(route.searchPublications.dateType).select(dateType);
  cy.get(route.search.from).click();
  cy.setDateInFlatpickr(date);
  cy.get(route.search.to).click();
  cy.setDateInFlatpickr(date);
  cy.get(route.search.trigger).click();
  cy.wait(`@publicationSearchCall${randomInt}`);
  cy.wait(1000); // TODO This is to test if the flakyness is solved by waiting longer or if the problem is elsewhere
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(pubNumber);
  searchFakePublication();
}

function searchFakePublication() {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.visit('publicaties/overzicht/zoeken?zoekterm=IKBESTANIET');
  cy.wait(`@publicationSearchCall${randomInt}`);
  cy.get(route.search.input).clear();
}

// TODO remove if searchFunction is less flaky
// function checkPagination(optionsToCheck, defaultOption) {
//   optionsToCheck.forEach((option) => {
//     const randomInt = Math.floor(Math.random() * Math.floor(10000));
//     cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
//     cy.get(utils.numberPagination.container).find(dependency.emberPowerSelect.trigger)
//       .click();
//     cy.get(dependency.emberPowerSelect.option).contains(option)
//       .click();
//     cy.wait(`@publicationSearchCall${randomInt}`);
//     cy.get(dependency.emberDataTable.isLoading).should('not.exist');
//     if (option !== defaultOption) {
//       cy.url().should('include', `aantal=${option}`);
//     }
//   });
// }

function searchFunction(optionsToCheck, defaultOption) {
  optionsToCheck.forEach((option) => {
    cy.wait(500);
    cy.get(route.search.input).clear()
      .type('test');
    cy.get(route.search.trigger).click();
    cy.get(utils.numberPagination.container).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(option)
      .click();
    if (option !== defaultOption) {
      cy.url().should('include', `aantal=${option}`);
    }
    cy.get(route.search.input).clear();
  });
}

function checkPublicationSearchForStatusType(status, pubNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(appuniversum.checkbox)
    .contains(status)
    .click()
    .wait(`@publicationSearchCall${randomInt}`);
  if (pubNumber) {
    cy.get(route.searchPublications.row.number).should('contain', pubNumber);
  }
}
// TODO-command can be used as a command
// function changeRegulationType(regulationType) {
//   cy.get(publication.publicationNav.decisions).click();
//   cy.get(publication.decisionsInfoPanel.openEdit).click();
//   cy.get(publication.decisionsInfoPanel.edit.regulationType).find(dependency.emberPowerSelect.trigger)
//     .click();
//   cy.get(dependency.emberPowerSelect.option).contains(regulationType)
//     .scrollIntoView()
//     .trigger('mouseover')
//     .click();
//   const randomInt = Math.floor(Math.random() * Math.floor(10000));
//   cy.intercept('PATCH', '/publication-flows/**').as(`patchPublicationFlow${randomInt}`);
//   cy.get(publication.decisionsInfoPanel.save).click();
//   cy.wait(`@patchPublicationFlow${randomInt}`);
// }

function checkPublicationSearchForRegulationType(regulationType, pubNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(appuniversum.checkbox)
    .contains(regulationType)
    .click()
    .wait(`@publicationSearchCall${randomInt}`);
  if (pubNumber) {
    cy.get(route.searchPublications.row.number).should('contain', pubNumber);
  }
}

function triggerSearchPublication(checkboxContains) {
  // manual trigger or trigger by clicking checkbox
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  if (checkboxContains) {
    cy.get(appuniversum.checkbox)
      .contains(checkboxContains)
      .click();
  } else {
    cy.get(route.search.trigger).click();
  }
  cy.wait(`@publicationSearchCall${randomInt}`);
  cy.get(dependency.emberDataTable.isLoading).should('not.exist');
}

// TODO-publication make Test to register publication
// cy.get(publication.publicationNav.publications).click();
// cy.get(publication.publicationsInfoPanel.edit).click();
// cy.get(publication.publicationsInfoPanel.editView.targetEndDate).find(auk.datepicker.datepicker)
//   .click();
// cy.setDateInFlatpickr(fields.publicationTargetEndDate);
// cy.get(publication.publicationActivities.register).click();
// cy.get(publication.publicationRegistration.publicationDate).find(auk.datepicker.datepicker)
//   .click();
// cy.setDateInFlatpickr(fields.publicationDate);
// cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlow');
// cy.get(publication.publicationRegistration.save).click()
//   .wait('@patchPublicationFlow');

context('Search tests', () => {
  // INFO: enable search, elasticsearch and tika for this spec
  // *WARN* All "fieldx" objects are of data that are in the default testdata, do not change.
  const fields = {
    number: 2001,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed: uniek',
    longTitle: 'Besluitvorming Vlaamse Regering fedora: origineel',
    numacNumber: 123456,
    decisionDate: Cypress.dayjs('2022-06-29'),
    receptionDate: Cypress.dayjs('2022-06-30'),
    publicationDueDate: Cypress.dayjs('2022-07-01'),
    publicationTargetEndDate: Cypress.dayjs('2022-07-06'),
    publicationDate: Cypress.dayjs('2022-07-04'),
    translationDueDate: Cypress.dayjs('2022-07-05'),
    requestProofStartDate: Cypress.dayjs('2022-05-02'),
    proofingActivityEndDate: Cypress.dayjs('2022-05-03'),
  };

  const fields1 = {
    number: 2002,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Naar vertaaldienst',
  };
  const fields2 = {
    number: 2003,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Vertaling in',
  };
  const fields3 = {
    number: 2004,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Drukproef aangevraagd',
  };

  const fields4 = {
    number: 2005,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    regulationType: 'Decreet',
  };
  const fields5 = {
    number: 2006,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    regulationType: 'Besluit van de Vlaamse Regering',
  };
  const fields6 = {
    number: 2007,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    regulationType: 'Ministerieel besluit',
    // TODO-setup make urgent, change features.spec.js
  };

  const fieldsWithDoubleDates = {
    number: 2010,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Naar vertaaldienst',
    regulationType: 'Decreet',
    decisionDate: Cypress.dayjs('2022-06-29'),
    receptionDate: Cypress.dayjs('2022-06-30'),
    publicationDueDate: Cypress.dayjs('2022-07-01'),
  };

  beforeEach(() => {
    cy.login('OVRB');
  });

  afterEach(() => {
    cy.logout();
  });

  it.only('Should change the amount of elements to every value in selectbox in publicaties search view', () => {
    visitPublicationSearch();
    const options = [5, 10, 20, 25, 50, 100, 200];
    const defaultSize = options[2];
    searchFunction(options, defaultSize);
  });

  it('search for all different unique searchterms in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearch(fields.number, fields.number);
    checkPublicationSearch(fields.numacNumber, fields.number);
    checkPublicationSearch(fields.shortTitle, fields.number);
    checkPublicationSearch(fields.longTitle, fields.number);
  });

  // TODO-bug fails on jenkins
  xit('search for all different dates in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearchForDateType('Datum beslissing', fields.decisionDate, fields.number);
    checkPublicationSearchForDateType('Datum ontvangst', fields.receptionDate, fields.number);
    checkPublicationSearchForDateType('Gevraagde publicatie datum', fields.publicationTargetEndDate, fields.number);
    // This one fails only on jenkins for unknown reasons, works fine locally even when running the full suite
    // running this spec before any other publication spec does not help
    checkPublicationSearchForDateType('Limiet vertaling', fields.translationDueDate, fields.number);
    checkPublicationSearchForDateType('Aanvraag drukproef', fields.requestProofStartDate, fields.number);
    checkPublicationSearchForDateType('Drukproef in', fields.proofingActivityEndDate, fields.number);
    checkPublicationSearchForDateType('Publicatie datum', fields.publicationDate, fields.number);
    checkPublicationSearchForDateType('Limiet publicatie', fields.publicationDueDate, fields.number);
  });

  it('search for different statuses in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearchForStatusType('Gepauzeerd');
    cy.get(route.searchPublications.row.number).should('not.contain', fields1.number);
    checkPublicationSearchForStatusType(fields1.status, fields1.number);
    checkPublicationSearchForStatusType(fields2.status, fields2.number);
    checkPublicationSearchForStatusType(fields3.status, fields3.number);
  });

  it('search for different regulation types in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearchForRegulationType('Erratum');
    cy.get(route.searchPublications.row.number).should('not.contain', fields4.number);
    checkPublicationSearchForRegulationType(fields4.regulationType, fields4.number);
    checkPublicationSearchForRegulationType(fields5.regulationType, fields5.number);
    checkPublicationSearchForRegulationType(fields6.regulationType, fields6.number);
  });

  it('setup: add some mandatees', () => {
    const mandatee1 = mandateeNames['10052021-16052022'].first; // 'Jan Jambon'
    const mandatee2 = mandateeNames['10052021-16052022'].second; // 'Hilde Crevits'
    const mandatee3 = mandateeNames['16052022-08112023'].third; // 'Bart Somers'

    visitPublications();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields2.number)
      .click();
    cy.addPublicationMandatee(mandatee2);

    visitPublications();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields4.number)
      .click();
    cy.addPublicationMandatee(mandatee1);
    cy.addPublicationMandatee(mandatee2);

    visitPublications();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(fieldsWithDoubleDates.number)
      .click();
    cy.addPublicationMandatee(mandatee3);

    // add urgent !only when not running publication-new-features.spec!
    // visitPublications();
    // cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields6.number)
    //   .click();
    // cy.get(publication.publicationCaseInfo.edit).click();
    // cy.get(publication.urgencyLevelCheckbox).parent()
    //   .click();
    // cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    // cy.get(publication.publicationCaseInfo.editView.save).click()
    //   .wait('@patchPublicationFlow');
  });

  it('check mandatees filters', () => {
    const searchTerm = 'Besluitvorming Vlaamse Regering hoed';
    const mandatee1 = mandateeNames['10052021-16052022'].first; // 'Jan Jambon'
    const mandatee2 = mandateeNames['10052021-16052022'].second; // 'Hilde Crevits'
    const mandatee4 = 'Paul Akkermans';

    visitPublicationSearch();
    cy.get(route.search.input).clear()
      .type(searchTerm);

    // filter on Prime minister
    triggerSearchPublication(mandatee1.fullName);
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length.at.least', 2)
      .contains(fields4.number);

    // add second minister
    triggerSearchPublication(mandatee2.fullName);
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length.at.least', 3)
      .as('rows');
    cy.get('@rows').contains(fields4.number);
    cy.get('@rows').contains(fields2.number);

    // remove Prime minister
    triggerSearchPublication(mandatee1.fullName);
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length.at.least', 1);

    // remove second minister
    triggerSearchPublication(mandatee2.fullName);

    // check previous mandatees works
    cy.get(utils.ministerFilter.pastMinisters).click();
    // add Pauk Akkermans
    triggerSearchPublication(mandatee4);
    cy.get(auk.emptyState.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');
  });

  it('combined searches in publicaties', () => {
    const generalTerm = '"Besluitvorming Vlaamse Regering hoed"';
    const urgent = 'Dringend';
    const mandatee2 = mandateeNames['10052021-16052022'].second; // 'Hilde Crevits'
    const mandatee3 = mandateeNames['16052022-08112023'].third; // 'Bart Somers'

    visitPublicationSearch();

    // search with vague term
    cy.get(route.search.input).clear()
      .type(generalTerm);
    triggerSearchPublication();
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 8);

    // check urgent
    triggerSearchPublication(urgent);
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1);
    // remove urgent (also triggers a search)
    triggerSearchPublication(urgent);

    // search with double date
    cy.get(route.searchPublications.dateType).select('Datum beslissing');
    cy.get(route.search.from)
      .find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(fields.decisionDate);
    cy.get(route.search.to)
      .find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(fields.decisionDate);
    triggerSearchPublication();
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 2)
      .contains(fieldsWithDoubleDates.number);

    // search with status and regulation type
    cy.get(appuniversum.checkbox)
      .contains(fieldsWithDoubleDates.status)
      .click();
    triggerSearchPublication(fieldsWithDoubleDates.regulationType);
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains(fieldsWithDoubleDates.number);
    // add third minister
    cy.get(utils.ministerFilter.pastMinisters).click();
    triggerSearchPublication(mandatee3.fullName); // this one
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains(fieldsWithDoubleDates.number);

    // change status
    cy.get(appuniversum.checkbox)
      .contains(fieldsWithDoubleDates.status)
      .click();
    // search with searchterm + decisionDate + regulation-type but with different status
    triggerSearchPublication(fields2.status);
    cy.get(auk.emptyState.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');

    // filter on second minister
    triggerSearchPublication(mandatee2.fullName);
    cy.get(auk.emptyState.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');
    // search without date
    // *Note doesn't always work on a first click
    // when route is loading and clicking the clear button can result in the date coming back
    cy.wait(1000);
    cy.get(route.search.from).find(auk.datepicker.clear)
      .click();
    cy.get(route.search.from).find(auk.datepicker.datepicker)
      .should('have.value', '');
    cy.get(route.search.to).find(auk.datepicker.clear)
      .click();
    cy.get(route.search.to).find(auk.datepicker.datepicker)
      .should('have.value', '');
    cy.get(route.search.trigger).click();
    // remove regulation type
    triggerSearchPublication(fieldsWithDoubleDates.regulationType);
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1);
  });
});
