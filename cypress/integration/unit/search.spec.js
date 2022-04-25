/* global context, it, cy, beforeEach, afterEach, Cypress, it */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import publication from '../../selectors/publication.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

function checkPublicationSearch(searchTerm, result) {
  cy.intercept('GET', '/publication-flows/search?**').as('pubicationSearchCall');
  cy.get(route.search.input).clear();
  cy.get(route.search.input).type(searchTerm);
  cy.get(route.search.trigger).click();
  cy.wait('@pubicationSearchCall');
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(result);
}

function checkPublicationSearchForDateType(dateType, date, pubNumber) {
  cy.intercept('GET', '/publication-flows/search?**').as('pubicationSearchCall');
  cy.get(route.searchPublications.dateType).select(dateType);
  cy.get(route.searchPublications.date).click();
  cy.setDateInFlatpickr(date);
  cy.get(route.search.trigger).click();
  cy.wait('@pubicationSearchCall');
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(pubNumber);
}

function checkPublicationSearchForStatusType(status, pubNumber) {
  cy.intercept('GET', '/publication-flows/search?**').as('pubicationSearchCall');
  cy.get(auk.checkbox.checkbox).parent()
    .contains(status)
    .click()
    .wait('@pubicationSearchCall');
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
  cy.get(publication.decisionsInfoPanel.save).click();
}

function checkPublicationSearchForRegulationType(regulationType, pubNumber) {
  cy.intercept('GET', 'publication-flows/search**').as('pubicationSearchCall');
  cy.get(auk.checkbox.checkbox).parent()
    .contains(regulationType)
    .click()
    .wait('@pubicationSearchCall');
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(pubNumber);
}

context('Search tests', () => {
  // INFO: enable musearch, elasticsearch and tika for this spec
  const options = [5, 10, 25, 50, 100];

  const dateToCreateAgenda = Cypress.dayjs().add(2, 'weeks')
    .day(1)
    .subtract(1, 'day');

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
    cy.get(publication.publicationRegistration.save).click()
      .wait(5000);
  });

  it('create publications with diferent types of statuses', () => {
    cy.createPublication(fields1);
    cy.changePublicationStatus(newStatus1);
    cy.createPublication(fields2);
    cy.changePublicationStatus(newStatus2);
    cy.createPublication(fields3);
    cy.changePublicationStatus(newStatus3);
    // TODO changePublicationStatus flakey?
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

  it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
    cy.visit('zoeken/agendapunten');
    searchFunction(options);
  });

  it('Should change the amount of elements to every value in selectbox in dossiers search view', () => {
    cy.visit('zoeken/dossiers');
    searchFunction(options);
  });

  it('Should change the amount of elements to every value in selectbox in kort-bestek search view', () => {
    cy.visit('zoeken/kort-bestek');
    searchFunction(options);
  });

  it('Should change the amount of elements to every value in selectbox in publicaties search view', () => {
    cy.visit('zoeken/publicaties');
    searchFunction(options);
  });

  it('Add content for funky searchterms', () => {
    const testId = `testId=${currentTimestamp()}: `;

    const PLACE = 'Lāna Hawaï eiland';
    const KIND = 'Ministerraad';
    cy.createAgenda(KIND, dateToCreateAgenda, PLACE);

    const case1TitleShort = `${testId}Cypress search dossier 1`;
    const type1 = 'Nota';
    const subcase1TitleShortNoIcon = 'dit is de korte titel for search'; // used for opening agendaitem
    const newSubcase1TitleShort = 'dit is de korte titel for search 🔍 Lāna Hawaï eiland';
    const subcase1TitleLong = 'dit is de lange titel for search and searching 🔎 Principiële accénten';
    const subcase1Type = 'In voorbereiding';
    const subcase1Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    const case2TitleShort = `${testId}Cypress search dossier 2`;
    const type2 = 'Nota';
    const newSubcase2TitleShort = `${testId} korte titel for batterij`;
    const subcase2TitleLong = `${testId} lange titel for peerd`;
    const subcase2Type = 'In voorbereiding';
    const subcase2Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(case1TitleShort);
    cy.addSubcase(type1, newSubcase1TitleShort, subcase1TitleLong, subcase1Type, subcase1Name);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(dateToCreateAgenda);

    cy.createCase(case2TitleShort);
    cy.addSubcase(type2, newSubcase2TitleShort, subcase2TitleLong, subcase2Type, subcase2Name);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(dateToCreateAgenda);

    cy.openAgendaForDate(dateToCreateAgenda);

    const file = {
      folder: 'files', fileName: 'searchwordsNoIcon', fileExtension: 'pdf', newFileName: 'searchwords pdf', fileType: 'Nota',
    };
    const files = [file];
    cy.intercept('PATCH', 'agenda-item-treatments/**').as('patchTreatments');
    cy.addDocumentsToAgendaitem(newSubcase2TitleShort, files);
    cy.addDocumentToTreatment(file);
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@patchTreatments');

    cy.openDetailOfAgendaitem(subcase1TitleShortNoIcon);
  });

  it('Search for non existing searchterm in agendaitems', () => {
    cy.visit('/zoeken/agendapunten');
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type('nietstezienhier');

    cy.intercept('GET', '/agendaitems/search?**').as('searchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@searchCall');

    cy.get(utils.vlAlert.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');
  });

  it('Search for funky searchterms in agendaitems', () => {
    cy.visit('/zoeken/agendapunten');
    const newSubcase2TitleShort = 'korte titel for batterij';
    // TODO-bug reenable to check if autocomplete works better now ? (+7 months later)
    const wordsToCheck1 = [
      'peerd',
      // 'peer', // TODO-bug autocomplete search does not yet work here.
      // 'batter', // TODO-bug autocomplete search does not yet work here.
      'batterij'
    ];
    wordsToCheck1.forEach((searchTerm) => {
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall');
      cy.get(route.search.trigger).click();
      cy.wait('@searchCall');

      cy.get(route.searchAgendaitems.dataTable).find('tbody')
        .children('tr')
        .contains(newSubcase2TitleShort);
    });

    cy.get(utils.mHeader.settings).click();
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.input).should('have.value', '');
  });

  it('Searchfield should be empty after revisiting search page', () => {
    cy.visit('/zoeken/agendapunten');
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type('TestSearchSet');
    cy.get(route.search.trigger).click();
    cy.wait(500);
    cy.get(utils.mHeader.settings).click();
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.input).should('have.value', '');
  });

  it('Search for funky searchterms in dossiers', () => {
    cy.visit('/zoeken/dossiers');
    const case1TitleShort = 'Cypress search dossier 1';
    const wordsToCheck2 = [
      'Principiële',
      'principiele',
      // 'princi', // TODO-bug stemming less search does not yet fully work here.
      'Lāna',
      'lana',
      'Hawaï',
      'hawaï',
      'search',
      'accénte', // this prefix (autocomplete search) does work - probably also stemming related.
      'accent',
      'accénten'
    ];
    wordsToCheck2.forEach((searchTerm) => {
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/cases/search?**').as('casesSearchCall');
      cy.get(route.search.trigger).click();
      cy.wait('@casesSearchCall');

      cy.get(route.searchCases.dataTable).find('tbody')
        .children('tr')
        .contains(case1TitleShort);
    });
  });

  it('Search for funky searchterms on dossiers ONLY beslissingsfiche', () => {
    cy.visit('/zoeken/dossiers');
    const caseTitleShort = 'Cypress search dossier 2';
    const wordsFromPdf = [
      'krokkettenmaker',
      'codez',
      'krok*'
    ];
    wordsFromPdf.forEach((searchTerm) => {
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);
      cy.get(route.searchCases.toggleDecisions).parent()
        .click();

      cy.intercept('GET', '/cases/search?**').as('decisionsSearchCall');
      cy.get(route.search.trigger).click();
      cy.wait('@decisionsSearchCall');

      cy.get(route.searchCases.dataTable).find('tbody')
        .children('tr')
        .contains(caseTitleShort);
    });
  });

  it('Search for funky searchterms in agenda overview', () => {
    const title = 'titel for batterij';
    const searchTitle = 'titel for search';
    const newSubcase1TitleShort = 'korte titel for search';
    const newSubcase2TitleShort = 'korte titel for batterij';
    const searchText = 'IKBESTANIET';
    const alertMessageNota = 'Er zijn nog geen agendapunten in deze agenda.';
    const alertMessageRemark = 'Er zijn nog geen mededelingen in deze agenda.';
    cy.openAgendaForDate(dateToCreateAgenda);

    cy.get(agenda.agendaOverviewItem.subitem).contains(title);
    cy.get(agenda.agendaOverviewItem.subitem).contains(searchTitle);

    cy.intercept('GET', `/agendaitems/search?**${searchText}**`).as(`searchCallOverview-${searchText}`);

    cy.get(agenda.agendaitemSearch.input).clear();
    cy.get(agenda.agendaitemSearch.input).type(searchText);
    cy.wait(200);
    cy.wait(`@searchCallOverview-${searchText}`);

    // Should find nothing.
    cy.get(utils.vlAlert.message).contains(alertMessageNota);
    cy.get(utils.vlAlert.message).contains(alertMessageRemark);

    const wordsToCheck1 = [
      'peerd',
      /* 'peer', // TODO-bug autocomplete search does not yet work here.*/
      /* 'batter', // TODO-bug autocomplete search does not yet work here.*/
      'batterij'
    ];
    const wordsToCheck2 = [
      'Principiële',
      'principiele',
      'principie',
      // 'princ',
      /* 'princi', // TODO-bug stemming less search does not yet fully work here.*/
      'Lāna',
      'lana',
      'lan',
      'Hawaï',
      'hawaï',
      'hawai',
      'hawa',
      'search',
      'accénte', // this prefix (autocomplete search) does work - probably also stemming related.
      /* 'accent', // TODO-bug autocomplete search does not yet work here.*/
      'accénten'
    ];
    wordsToCheck1.forEach((searchTerm) => {
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      cy.intercept('GET', `/agendaitems/search?**${encodedSearchTerm}**`).as(`searchCallOverview-${searchTerm}`);
      cy.get(agenda.agendaitemSearch.input).clear();
      cy.get(agenda.agendaitemSearch.input).type(searchTerm);
      cy.wait(200);
      cy.wait(`@searchCallOverview-${searchTerm}`);
      cy.get(agenda.agendaOverviewItem.subitem).contains(newSubcase2TitleShort);
    });
    wordsToCheck2.forEach((searchTerm) => {
      const encodedSearchTerm = encodeURIComponent(searchTerm);
      cy.intercept('GET', `/agendaitems/search?**${encodedSearchTerm}**`).as(`searchCallOverview-${searchTerm}`);
      cy.get(agenda.agendaitemSearch.input).clear();
      cy.get(agenda.agendaitemSearch.input).type(searchTerm);
      cy.wait(200);
      cy.wait(`@searchCallOverview-${searchTerm}`);
      cy.get(agenda.agendaOverviewItem.subitem).contains(newSubcase1TitleShort);
    });
  });

  it('Search for title in kort-bestek and open the detail view by clicking icon', () => {
    cy.visit('/zoeken/kort-bestek');
    // TODO-setup this test searches for data from other tests (mandatee-assigning.spec) and could fail
    const searchTerm = 'assign mandatee';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);

    cy.intercept('GET', '/newsletter-infos/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    cy.get(route.searchNewsletterInfos.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 3);
    // The search results are randomly sorted between each test run (mainly because of bad test data)
    // So we can't know what info is showing in each row, but we do know what should be showing in the 3 rows
    // the title and decision result will be the same for all 3, contains() gets the first one
    cy.get(route.searchNewsletterInfos.row.title).contains(searchTerm);
    cy.get(route.searchNewsletterInfos.row.decisionResult).contains('Goedgekeurd');
    cy.get(route.searchNewsletterInfos.row.mandatees).contains('Jan Jambon, Hilde Crevits');
    cy.get(route.searchNewsletterInfos.row.mandatees).contains('Jan Jambon, Hilde Crevits, Wouter Beke');
    cy.get(route.searchNewsletterInfos.row.mandatees).contains('Jan Jambon, Hilde Crevits, Bart Somers, Ben Weyts, Zuhal Demir');
    cy.get(route.searchNewsletterInfos.row.goToAgendaitem).eq(0)
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
    cy.url().should('contain', '/kort-bestek');
  });

  it('Search for richText in kort-bestek and open the detail view by clicking row', () => {
    cy.visit('/zoeken/kort-bestek');
    // TODO-setup this test searches for data from other tests (newsletter-info.spec) and could fail
    const searchTerm = 'Dit is een leuke beslissing';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);

    cy.intercept('GET', '/newsletter-infos/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    cy.get(route.searchNewsletterInfos.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1);
    cy.get(route.searchNewsletterInfos.row.title).contains(searchTerm);
    cy.get(route.searchNewsletterInfos.row.decisionResult).contains('Uitgesteld');
    cy.get(route.searchNewsletterInfos.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
    cy.url().should('contain', '/kort-bestek');
  });

  it('Search for kort-bestek items that have links to multiple agendaitem/agenda versions', () => {
    cy.visit('/zoeken/kort-bestek');
    // TODO-setup this test searches for data from other tests (agendaitem-changes.spec) and could fail
    const searchTerm = 'testId=1589266576';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);

    cy.intercept('GET', '/newsletter-infos/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    // amount of rows is too flaky (data from previous tests) and not tested. We expect at least 1 result
    cy.get(utils.vlAlert.container).should('not.exist');
    cy.get(route.searchNewsletterInfos.row.title).contains(searchTerm);
  });

  it('Search for mandatee in kort-bestek', () => {
    cy.visit('/zoeken/kort-bestek');
    // TODO-setup this test searches for data from other tests (mandatee-assigning.spec) and could fail
    const searchTerm = 'test';
    const mandateeSearchTerm = 'Jambon';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);
    cy.get(route.search.mandatee).type(mandateeSearchTerm);

    cy.intercept('GET', '/newsletter-infos/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    // amount of rows is too flaky (data from previous tests) and not tested. We expect at least 1 result
    cy.get(utils.vlAlert.container).should('not.exist');
    cy.get(route.searchNewsletterInfos.row.mandatees).contains('Jan Jambon');
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
    const vagueTerm = 'Besluitvorming';

    cy.visit('zoeken/publicaties');

    // search with vague term
    cy.intercept('GET', '/publication-flows/search?**').as('pubicationSearchCall1');
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(vagueTerm);
    cy.get(route.search.trigger).click();
    cy.wait('@pubicationSearchCall1');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 8);

    // search with double date
    cy.intercept('GET', '/publication-flows/search?**').as('pubicationSearchCall2');
    cy.get(route.search.input).clear();
    cy.get(route.searchPublications.dateType).select('Datum beslissing');
    cy.get(route.searchPublications.date).click();
    cy.setDateInFlatpickr(fields.decisionDate);
    cy.get(route.search.trigger).click();
    cy.wait('@pubicationSearchCall2');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 2)
      .contains(fieldsWithDoubleDates.number);

    // search with status and regulation type
    cy.intercept('GET', '/publication-flows/search?**').as('pubicationSearchCall3');
    cy.get(route.search.input).clear();
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newStatus1)
      .click();
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newRegulationType1)
      .click()
      .wait('@pubicationSearchCall3');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains(fieldsWithDoubleDates.number);

    // change status
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newStatus1)
      .click();
    cy.get(auk.checkbox.checkbox).parent()
      .contains(newStatus2)
      .click()
      .wait('@pubicationSearchCall');
    cy.get(utils.vlAlert.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');
  });
});
