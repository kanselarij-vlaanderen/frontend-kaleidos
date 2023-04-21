/* global context, it, cy, Cypress, beforeEach, afterEach, it */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';

function searchFunction(optionsToCheck, defaultOption) {
  optionsToCheck.forEach((option) => {
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

function triggerSearch() {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/decisionmaking-flows/search?**').as(`caseSearchCall${randomInt}`);
  cy.get(route.search.trigger).click();
  cy.wait(`@caseSearchCall${randomInt}`);
}

function searchDossier(searchTerm, Result) {
  cy.get(route.search.input).clear()
    .type(searchTerm);
  triggerSearch();
  cy.get(route.searchCases.row).contains(Result);
}

context('Search tests', () => {
  const options = [5, 10, 20, 25, 50, 100, 200];

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Search for non existing searchterm in agendaitems', () => {
    cy.visit('/zoeken/agendapunten');
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type('nietstezienhier');

    cy.intercept('GET', '/agendaitems/search?**').as('searchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@searchCall');

    cy.get(auk.emptyState.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');
  });

  it('Searchfield should be empty after revisiting search page', () => {
    const searchValue = 'TestSearchSet';
    cy.visit('/zoeken/agendapunten');
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchValue);
    cy.get(route.search.trigger).click();
    cy.wait(500);
    cy.get(utils.mHeader.settings).click();
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.input).should('have.value', '');
  });

  it('Search for htmlContent in kort-bestek and open the detail view by clicking row', () => {
    cy.visit('/kort-bestek/zoeken');
    // Testdata available in default data
    const searchTerm = 'Dit is een leuke beslissing';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);

    cy.intercept('GET', '/news-items/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    cy.get(route.searchNewsletters.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1);
    cy.get(route.searchNewsletters.row.title).contains(searchTerm);
    cy.get(route.searchNewsletters.row.decisionResult).contains('Uitgesteld');
    cy.get(route.searchNewsletters.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
    cy.url().should('contain', '/kort-bestek');
  });

  context('Search tests with actual data that is recently added or changed', () => {
    // ! enable search, elasticsearch and tika for this spec
    // const agendaDate = Cypress.dayjs('2022-02-28');
    const agendaLink = '/vergadering/62878EB2E1ADA5F6A459ABFD/agenda/62878EB3E1ADA5F6A459ABFE/agendapunten';

    // *data case 1
    // link to case: '/dossiers/E14FB529-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers'
    // link to subcase: '/dossiers/E14FB529-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/62879183E1ADA5F6A459AC04'
    // link to agendaitem detail: '/vergadering/62878EB2E1ADA5F6A459ABFD/agenda/62878EB3E1ADA5F6A459ABFE/agendapunten/6287924CE1ADA5F6A459AC09/documenten'
    const case1TitleShort = 'testId=1653051049: Cypress search dossier 1';
    const subcase1TitleShortNoIcon = 'testId=1653051049: dit is de korte titel for search'; // used for opening agendaitem
    // const newSubcase1TitleShort = 'testId=1653051049: dit is de korte titel for search 🔍 Lāna Hawaï eiland';
    // const subcase1TitleLong = 'testId=1653051049: dit is de lange titel for search and searching 🔎 Principiële accénten';
    // const fileAgendaitem1 = {
    //   // unieke woorden: Telefoon computer
    //   folder: 'files', fileName: 'search-agendaitem-piece_1', fileExtension: 'pdf', newFileName: 'piece 1 pdf', fileType: 'Nota',
    // };
    // const fileTreatment1 = {
    //   // unieke woorden: fax minidisc
    //   folder: 'files', fileName: 'search-agendaitem-treatment_1', fileExtension: 'pdf', newFileName: 'treatment 1 pdf',
    // };


    // *data case 2
    // link to case: '/dossiers/E14FB5C8-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers'
    // link to subcase: '/dossiers/E14FB5C8-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/6287918EE1ADA5F6A459AC05'
    // link to agendaitem detail: '/vergadering/62878EB2E1ADA5F6A459ABFD/agenda/62878EB3E1ADA5F6A459ABFE/agendapunten/62879264E1ADA5F6A459AC0D/documenten'
    const case2TitleShort = 'testId=1653051342: Cypress search dossier 2';
    const newSubcase2TitleShort = 'testId=1653051342: korte titel for batterij';
    const subcase2TitleLong = 'testId=1653051342: lange titel for peerd';
    // const fileAgendaitem2 = {
    //   // unieke woorden: Walkman stereo
    //   folder: 'files', fileName: 'search-agendaitem-piece_2', fileExtension: 'pdf', newFileName: 'piece 2 pdf', fileType: 'Nota',
    // };
    const fileTreatment2 = {
      // unieke woorden: codez krokkettenmaker
      folder: 'files', fileName: 'search-agendaitem-treatment_2', fileExtension: 'pdf', newFileName: 'treatment 2 pdf',
    };

    it('Add content for funky searchterms', () => {
      // *Existing data test: add this to setup, check ownership of files before zipping!
      // cy.visitAgendaWithLink('/vergadering/62878EB2E1ADA5F6A459ABFD/agenda/62878EB3E1ADA5F6A459ABFE/agendapunten/6287924CE1ADA5F6A459AC09/documenten');
      // cy.addDocumentsToAgendaitem(subcase1TitleShortNoIcon, [fileAgendaitem1]);
      // cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
      // cy.addDocumentToTreatment(fileTreatment1);
      // cy.get(auk.auModal.container).should('not.exist');
      // cy.wait('@patchDecisionActivities');

      // *Live data test: change agendaitem/subcase titles, upload treatment file (*piece* for future tests in comment).
      cy.visit('/dossiers/E14FB5C8-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/6287918EE1ADA5F6A459AC05');
      cy.intercept('PATCH', '/agendaitems/*').as('patchAgendaitem');
      cy.changeSubcaseAccessLevel(null, newSubcase2TitleShort, subcase2TitleLong);
      cy.wait('@patchAgendaitem');

      cy.visitAgendaWithLink('/vergadering/62878EB2E1ADA5F6A459ABFD/agenda/62878EB3E1ADA5F6A459ABFE/agendapunten/62879264E1ADA5F6A459AC0D/documenten');
      // cy.addDocumentsToAgendaitem(newSubcase2TitleShort, [fileAgendaitem2]);
      cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
      cy.addDocumentToTreatment(fileTreatment2);
      cy.get(auk.confirmationModal.footer.confirm).click();
      cy.wait('@patchDecisionActivities');
    });

    // *The next 3 tests do not use any of the context data, but are needed to give index the time to update
    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      cy.visit('zoeken/agendapunten');
      searchFunction(options, options[2]);
    });

    it('Should change the amount of elements to every value in selectbox in dossiers search view', () => {
      cy.visit('zoeken/dossiers');
      searchFunction(options, options[2]);
    });

    it('Should change the amount of elements to every value in selectbox in kort-bestek search view', () => {
      cy.visit('kort-bestek/zoeken');
      searchFunction(options, options[2]);
    });

    it('Search for funky searchterms in dossiers', () => {
      cy.visit('/zoeken/dossiers');
      // const case1TitleShort = 'Cypress search dossier 1';
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

        cy.intercept('GET', '/decisionmaking-flows/search?**').as('decisionmakingSearchCall');
        cy.get(route.search.trigger).click();
        cy.wait('@decisionmakingSearchCall');

        cy.get(route.searchCases.dataTable).find('tbody')
          .children('tr')
          .contains(case1TitleShort);
      });
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

    it('Search for funky searchterms on dossiers ONLY beslissingsfiche', () => {
      cy.visit('/zoeken/dossiers');
      // const wordsFromDocumentPdf = [
      //   'Telefoon',
      //   'computer'
      // ];
      const wordsFromTreatmentPdf = [
        'krokkettenmaker',
        'codez',
        'krok*'
      ];
      // wordsFromDocumentPdf.forEach((searchTerm) => {
      //   cy.get(route.search.input).clear();
      //   cy.get(route.search.input).type(searchTerm);
      //   cy.intercept('GET', `/decisionmaking-flows/search?**${encodeURIComponent(searchTerm)}`).as('decisionsSearchCall');
      //   cy.get(route.search.trigger).click();
      //   cy.wait('@decisionsSearchCall');

      //   cy.get(route.searchCases.dataTable).find('tbody')
      //     .children('tr')
      //     .contains(case1TitleShort);
      // });

      // TODO does this still work reliably after recent changes
      wordsFromTreatmentPdf.forEach((searchTerm) => {
        cy.intercept('GET', `/decisionmaking-flows/search?**${encodeURIComponent(searchTerm)}**`).as('decisionsSearchCall');
        cy.get(route.search.input).clear();
        cy.get(route.search.input).type(searchTerm);
        cy.get(route.search.trigger).click();
        cy.wait('@decisionsSearchCall');

        cy.get(route.searchCases.dataTable).find('tbody')
          .children('tr')
          .contains(case2TitleShort);
      });
    });

    it('Search for funky searchterms in agenda overview', () => {
      const searchText = 'IKBESTANIET';
      const alertMessageNota = 'Er zijn nog geen agendapunten in deze agenda.';
      const alertMessageRemark = 'Er zijn nog geen mededelingen in deze agenda.';
      cy.visitAgendaWithLink(agendaLink);

      cy.get(agenda.agendaOverviewItem.subitem).contains(newSubcase2TitleShort);
      cy.get(agenda.agendaOverviewItem.subitem).contains(subcase1TitleShortNoIcon);

      cy.intercept('GET', `/agendaitems/search?**${searchText}**`).as(`searchCallOverview-${searchText}`);

      cy.get(agenda.agendaitemSearch.input).clear();
      cy.get(agenda.agendaitemSearch.input).type(searchText);
      cy.wait(200);
      cy.wait(`@searchCallOverview-${searchText}`);
      cy.wait(500);

      // Should find nothing.
      cy.get(utils.auAlert.message).contains(alertMessageNota);
      cy.get(utils.auAlert.message).contains(alertMessageRemark);

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
        cy.wait(500);
        cy.get(agenda.agendaOverviewItem.subitem).contains(newSubcase2TitleShort);
      });
      wordsToCheck2.forEach((searchTerm) => {
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        cy.intercept('GET', `/agendaitems/search?**${encodedSearchTerm}**`).as(`searchCallOverview-${searchTerm}`);
        cy.get(agenda.agendaitemSearch.input).clear();
        cy.get(agenda.agendaitemSearch.input).type(searchTerm);
        cy.wait(200);
        cy.wait(`@searchCallOverview-${searchTerm}`);
        cy.wait(500);
        cy.get(agenda.agendaOverviewItem.subitem).contains(subcase1TitleShortNoIcon);
      });
    });

    it('Sort by relevance', () => {
      const agendaDate = Cypress.dayjs('2021-03-12');
      const currentTimestamp = Cypress.dayjs().unix();
      const subcaseTitleShort = `Cypress test: add subcase with accenten in title - ${currentTimestamp}`;
      const type = 'Nota';
      const subcaseTitleLong = 'Cypress test met accenten in title';
      const subcaseType = 'Principiële goedkeuring';
      const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

      cy.createAgenda(null, agendaDate, null);
      cy.visit('/dossiers/E14FB50A-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
      cy.addSubcase(type, subcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
      cy.openAgendaForDate(agendaDate);
      cy.addAgendaitemToAgenda(subcaseTitleShort);

      cy.visit('/zoeken/agendapunten');
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type('accenten');

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall');
      cy.get(route.search.trigger).click();
      cy.wait('@searchCall');

      // sorted default by relevance and not dates
      cy.get(route.searchAgendaitems.row.shortTitle).eq(0)
        .contains('accenten');
      cy.get(route.searchAgendaitems.row.shortTitle).eq(1)
        .contains('Hawaï');

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(utils.resultsHeader.type).select('Datum vergadering');
      cy.wait('@searchCall2');
      cy.url().should('contain', 'sorteer=-session-dates');

      cy.get(route.searchAgendaitems.row.shortTitle).eq(0)
        .contains('Hawaï');
      cy.get(route.searchAgendaitems.row.shortTitle).eq(1)
        .contains('accenten');
    });

    context('Search all fields', () => {
      const randomInt = Math.floor(Math.random() * Math.floor(10000));

      const agendaDate = Cypress.dayjs('2023-06-06');
      const caseTitle = `Cypress test - ${randomInt}: uniek precair interstellair, maar niet verstoken van enige flair`;
      const subcaseTitle1 = `Cypress test - ${randomInt}: uniek terracotta scherven die wij van ons moeder erven`;
      const subcaseTitle2 = `Cypress test - ${randomInt}: uniek de slijpschijf was zijn favoriete tijdsverdrijf`;
      const longTitle1 = `Cypress test - ${randomInt}: uniek dramatiek op de dansvloer zonder muziek`;
      const longTitle2 = `Cypress test - ${randomInt}: uniek ik eet mijn vla toch liever zonder sla`;
      const newsItemContent = `Cypress test - ${randomInt}: uniek voor wie het ondermaanse wat ondermaats vindt`;
      const fileNameDocs = 'search-agendaitem-piece_1';
      const fileNameTreatment = 'search-agendaitem-treatment_2';
      const fileNameSubcase = 'search-agendaitem-piece_2';
      const newFileNameDocs = `Cypress test - ${randomInt}: uniek we zijn de kaas niet de baas`;
      const newFileNameTreatment = `Cypress test - ${randomInt}: uniek een beetje blazé over het Oosterweeltracé`;
      const fileDocs = {
        folder: 'files', fileName: fileNameDocs, fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
      };
      const files = [fileDocs];
      const fileTreatment = {
        folder: 'files', fileName: fileNameTreatment, fileExtension: 'pdf', newFileName: newFileNameTreatment,
      };

      it('Search all fields setup', () => {
        cy.visit('/dossiers');
        cy.createCase(caseTitle);
        cy.addSubcase('Nota',
          subcaseTitle1,
          longTitle1,
          'Principiële goedkeuring',
          'Principiële goedkeuring m.h.o. op adviesaanvraag');
        cy.openSubcase(0, subcaseTitle1);
        cy.addSubcaseMandatee(4);
        cy.addDocumentsToSubcase([
          {
            folder: 'files', fileName: fileNameSubcase, fileExtension: 'pdf', newFileName: newFileNameDocs, fileType: 'Nota',
          }
        ]);
        cy.createAgenda(null, agendaDate, 'Zaal oxford bij Cronos Leuven');

        cy.openAgendaForDate(agendaDate);
        cy.addAgendaitemToAgenda(subcaseTitle1);
        cy.addDocumentsToAgendaitem(subcaseTitle1, files);
        cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
        cy.addDocumentToTreatment(fileTreatment);
        cy.get(auk.confirmationModal.footer.confirm).click();
        cy.wait('@patchDecisionActivities');

        cy.openAgendaitemKortBestekTab(subcaseTitle1);
        // create new KB
        cy.intercept('GET', '/themes**').as('getThemes');
        cy.intercept('POST', '/news-items').as('postNewsItem');
        cy.get(newsletter.newsItem.create).click();
        cy.wait('@postNewsItem');
        cy.wait('@getThemes');
        cy.get(newsletter.editItem.shortTitle).clear()
          .type(longTitle2);
        cy.get(newsletter.editItem.rdfaEditor).type(newsItemContent);
        cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
        cy.get(newsletter.editItem.save).click();
        cy.get(auk.confirmationModal.footer.confirm).click();
        cy.wait('@patchNewsItem');

        cy.setFormalOkOnItemWithIndex(0);
        cy.setFormalOkOnItemWithIndex(1);
        cy.approveDesignAgenda();

        cy.openAgendaitemKortBestekTab(subcaseTitle1);
        cy.get(newsletter.newsItem.edit).click();
        cy.get(newsletter.editItem.shortTitle).clear()
          .type(subcaseTitle2);
        cy.intercept('PATCH', '/news-items/*').as('patchNewsItems');
        cy.get(newsletter.editItem.save).click();
        cy.get(auk.confirmationModal.footer.confirm).click();
        cy.wait('@patchNewsItems');

        // wait for indexing
        cy.wait(60000);
      });

      it('Search all fields on case', () => {
        cy.visit('/zoeken/dossiers');

        // titles
        searchDossier(caseTitle, caseTitle);
        searchDossier(subcaseTitle1, caseTitle);
        searchDossier(subcaseTitle2, caseTitle);
        searchDossier(longTitle1, caseTitle);
        // mandatees
        searchDossier('Ben', caseTitle);
        searchDossier('Weyts', caseTitle);
        searchDossier('Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand', caseTitle);
        // news-item
        searchDossier(longTitle2, caseTitle);
        searchDossier(newsItemContent, caseTitle);
        // documents
        searchDossier(fileNameDocs, caseTitle);
        searchDossier(fileNameSubcase, caseTitle);
        searchDossier(newFileNameDocs, caseTitle);
        searchDossier('fax', caseTitle);
        searchDossier('Telefoon', caseTitle);
        // decision
        searchDossier(fileNameTreatment, caseTitle);
        searchDossier(newFileNameTreatment, caseTitle);
        searchDossier('krokkettenmaker', caseTitle);
      });
    });
  });
});
