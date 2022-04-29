/* global context, it, cy, beforeEach, afterEach, Cypress, it */
// / <reference types="Cypress" />
import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import publication from '../../selectors/publication.selectors';

// function currentTimestamp() {
//   return Cypress.dayjs().unix();
// }

function checkPublicationSearch(searchTerm, result) {
  cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall');
  cy.get(route.search.input).clear();
  cy.get(route.search.input).type(searchTerm);
  cy.get(route.search.trigger).click();
  cy.wait('@publicationSearchCall');
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(result);
}

function checkPublicationSearchForDateType(dateType, date, pubNumber) {
  cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall');
  cy.get(route.searchPublications.dateType).select(dateType);
  cy.get(route.searchPublications.date).click();
  cy.setDateInFlatpickr(date);
  cy.get(route.search.trigger).click();
  cy.wait('@publicationSearchCall');
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(pubNumber);
}

function checkPublicationSearchForStatusType(status, pubNumber) {
  cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall');
  cy.get(auk.checkbox.checkbox).parent()
    .contains(status)
    .click()
    .wait('@publicationSearchCall');
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(pubNumber);
}

function changeRegulationType(regulationType) {
  cy.get(publication.publicationNav.decisions).click();
  cy.get(publication.decisionsInfoPanel.openEdit).click();
  cy.get(publication.decisionsInfoPanel.edit.regulationType).find(dependency.emberPowerSelect.trigger)
    .click();
  cy.get(dependency.emberPowerSelect.option).contains(regulationType)
    .scrollIntoView()
    .trigger('mouseover')
    .click();
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('PATCH', '/publication-flows/**').as(`patchPublicationFlow${randomInt}`);
  cy.get(publication.decisionsInfoPanel.save).click();
  cy.wait(`@patchPublicationFlow${randomInt}`);
}

function checkPublicationSearchForRegulationType(regulationType, pubNumber) {
  cy.intercept('GET', 'publication-flows/search**').as('publicationSearchCall');
  cy.get(auk.checkbox.checkbox).parent()
    .contains(regulationType)
    .click()
    .wait('@publicationSearchCall');
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(pubNumber);
}

context('Search tests', () => {
  // INFO: enable search, elasticsearch and tika for this spec
  const options = [5, 10, 25, 50, 100];

  const numacNumber = 123456;
  const publicationDate = Cypress.dayjs().add(9, 'weeks')
    .day(1);
  const fields = {
    number: 2001,
    shortTitle: 'Besluitvorming Vlaamse Regering Uniek',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen Origineel',
    decisionDate: publicationDate.subtract(5, 'day'),
    receptionDate: publicationDate.subtract(4, 'day'),
    targetPublicationdate: publicationDate.subtract(3, 'day'),
  };
  const publicationTargetEndDate = publicationDate.add(2, 'day');
  const translationDueDate = publicationDate.add(1, 'day');
  const requestActivityStartDate = Cypress.dayjs();
  const proofingActivityEndDate = Cypress.dayjs().add(1, 'day');

  const fields1 = {
    number: 2002,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
  };
  const fields2 = {
    number: 2003,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
  };
  const fields3 = {
    number: 2004,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
  };
  const newStatus1 = 'Naar vertaaldienst';
  const newStatus2 = 'Vertaling in';
  const newStatus3 = 'Drukproef aangevraagd';

  const fields4 = {
    number: 2005,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
  };
  const fields5 = {
    number: 2006,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
  };
  const fields6 = {
    number: 2007,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
  };
  const newRegulationType1 = 'Decreet';
  const newRegulationType2 = 'Besluit van de Vlaamse Regering';
  const newRegulationType3 = 'Ministerieel besluit';

  const fieldsWithDoubleDates = {
    number: 2010,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
    decisionDate: publicationDate.subtract(5, 'day'),
    receptionDate: publicationDate.subtract(4, 'day'),
    targetPublicationdate: publicationDate.subtract(3, 'day'),
  };

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const searchFunction = (elementsToCheck) => {
    elementsToCheck.forEach((option) => {
      cy.get(route.search.input).type('test');
      cy.get(route.search.trigger).click();
      cy.get(utils.numberPagination.container).find(dependency.emberPowerSelect.trigger)
        .click();
      cy.get(dependency.emberPowerSelect.option).contains(option)
        .click();
      cy.url().should('include', `aantal=${option}`);
      cy.get(route.search.input).clear();
    });
  };

  it('create a publication for testing the amount of elements', () => {
    const fields = {
      number: 1999,
      shortTitle: 'test',
      longTitle: 'test',
    };
    cy.createPublication(fields);
  });

  it('create a publication with all diferent types of dates, numac number and unique titles', () => {
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.createPublication(fields);

    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${numacNumber}{enter}`);
    cy.intercept('POST', '/identifications').as('postNumacNumber');
    cy.get(publication.publicationCaseInfo.editView.save).click();
    cy.wait('@postNumacNumber');

    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.translationsInfoPanel.openEdit).click();
    cy.get(publication.translationsInfoPanel.edit.dueDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(translationDueDate);
    cy.intercept('PATCH', '/translation-subcases/*').as('patchTranslationSubcases');
    cy.get(publication.translationsInfoPanel.edit.save).click()
      .wait('@patchTranslationSubcases');

    cy.get(publication.publicationNav.publishpreview).click();

    cy.get(publication.proofsIndex.newRequest).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', '/proofing-activities').as('postProofingActivities');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('reloadProofModel');
    cy.get(publication.proofRequest.save).click()
      .wait('@postProofingActivities')
      .wait('@getPieces')
      .wait('@reloadProofModel');

    cy.get(publication.proofsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(publication.proofUpload.receivedDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(proofingActivityEndDate);
    cy.intercept('PATCH', '/proofing-activities/*').as('patchProofingActivities');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('reloadProofingModel');
    cy.get(publication.proofUpload.save).click()
      .wait('@patchProofingActivities')
      .wait('@getPieces')
      .wait('@reloadProofingModel')
      .wait(500);

    cy.get(publication.publicationNav.publications).click();
    cy.get(publication.publicationsInfoPanel.edit).click();
    cy.get(publication.publicationsInfoPanel.targetEndDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(publicationTargetEndDate);
    cy.get(publication.publicationActivities.register).click();
    cy.get(publication.publicationRegistration.publicationDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(publicationDate);
    // TODO better waits
    cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlow');
    cy.get(publication.publicationRegistration.save).click()
      .wait('@patchPublicationFlow');
  });

  it('create publications with diferent types of statuses', () => {
    cy.createPublication(fields1);
    cy.changePublicationStatus(newStatus1);
    cy.createPublication(fields2);
    cy.changePublicationStatus(newStatus2);
    cy.createPublication(fields3);
    cy.changePublicationStatus(newStatus3);
  });

  it('create publications with diferent types of regulations', () => {
    cy.createPublication(fields4);
    changeRegulationType(newRegulationType1);
    cy.createPublication(fields5);
    changeRegulationType(newRegulationType2);
    cy.createPublication(fields6);
    changeRegulationType(newRegulationType3);
  });

  it('create publication for combined searches', () => {
    cy.createPublication(fieldsWithDoubleDates);
    cy.changePublicationStatus(newStatus1);
    changeRegulationType(newRegulationType1);
  });

  it('Should change the amount of elements to every value in selectbox in publicaties search view', () => {
    cy.visit('zoeken/publicaties');
    searchFunction(options);
  });

  it('search for all different unique searchterms in publicaties', () => {
    cy.visit('zoeken/publicaties');
    checkPublicationSearch(fields.number, fields.number);
    checkPublicationSearch(numacNumber, fields.number);
    checkPublicationSearch(fields.shortTitle, fields.number);
    checkPublicationSearch(fields.longTitle, fields.number);
  });

  it('search for all different dates in publicaties', () => {
    cy.visit('zoeken/publicaties');
    checkPublicationSearchForDateType('Datum beslissing', fields.decisionDate, fields.number);
    checkPublicationSearchForDateType('Datum ontvangst', fields.receptionDate, fields.number);
    checkPublicationSearchForDateType('Gevraagde publicatie datum', publicationTargetEndDate, fields.number);
    checkPublicationSearchForDateType('Limiet vertaling', translationDueDate, fields.number);
    checkPublicationSearchForDateType('Aanvraag drukproef', requestActivityStartDate, fields.number);
    checkPublicationSearchForDateType('Drukproef in', proofingActivityEndDate, fields.number);
    checkPublicationSearchForDateType('Publicatie datum', publicationDate, fields.number);
    checkPublicationSearchForDateType('Limiet publicatie', fields.targetPublicationdate, fields.number);
  });

  it('search for different statuses in publicaties', () => {
    cy.visit('zoeken/publicaties');
    checkPublicationSearchForStatusType(newStatus1, fields1.number);
    checkPublicationSearchForStatusType(newStatus2, fields2.number);
    checkPublicationSearchForStatusType(newStatus3, fields3.number);
  });

  it('search for different regulation types in publicaties', () => {
    cy.visit('zoeken/publicaties');
    checkPublicationSearchForRegulationType(newRegulationType1, fields1.number);
    checkPublicationSearchForRegulationType(newRegulationType2, fields2.number);
    checkPublicationSearchForRegulationType(newRegulationType3, fields3.number);
  });

  it('combined searches in publicaties', () => {
    const generalTerm = '"Besluitvorming Vlaamse Regering"';

    cy.visit('zoeken/publicaties');

    // search with vague term
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall1');
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(generalTerm);
    cy.get(route.search.trigger).click();
    cy.wait('@publicationSearchCall1');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 8);

    // search with double date
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall2');
    cy.get(route.search.input).clear();
    cy.get(route.searchPublications.dateType).select('Datum beslissing');
    cy.get(route.searchPublications.date).click();
    cy.setDateInFlatpickr(fields.decisionDate);
    cy.get(route.search.trigger).click();
    cy.wait('@publicationSearchCall2');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 2)
      .contains(fieldsWithDoubleDates.number);

    // search with status and regulation type
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall3');
    cy.get(route.search.input).clear();
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newStatus1)
      .click();
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newRegulationType1)
      .click()
      .wait('@publicationSearchCall3');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains(fieldsWithDoubleDates.number);

    // change status
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall4');
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newStatus1)
      .click();
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newStatus2)
      .click()
      .wait('@publicationSearchCall4');
    cy.get(utils.vlAlert.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');
  });
});
