/* global context, it, cy, Cypress, beforeEach, afterEach, it */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';

context('Search tests', () => {
  const options = [5, 10, 25, 50, 100];

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
    cy.visit('/zoeken/agendapunten');
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type('TestSearchSet');
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
      // cy.get(auk.auModal).should('not.exist');
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
      searchFunction(options);
    });

    it('Should change the amount of elements to every value in selectbox in dossiers search view', () => {
      cy.visit('zoeken/dossiers');
      searchFunction(options);
    });

    it('Should change the amount of elements to every value in selectbox in kort-bestek search view', () => {
      cy.visit('kort-bestek/zoeken');
      searchFunction(options);
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

      // Toggling decisions forces an empty datatable to ensure our searchTerm result is new, not the previous result
      cy.get(route.searchCases.toggleDecisions).parent()
        .click();
      wordsFromTreatmentPdf.forEach((searchTerm) => {
        cy.get(route.searchCases.toggleDecisions).parent()
          .click();
        cy.get(route.search.input).clear();
        cy.get(route.search.input).type(searchTerm);
        cy.get(route.search.trigger).click(); // no results found in documents
        cy.intercept('GET', `/decisionmaking-flows/search?**${encodeURIComponent(searchTerm)}**`).as('decisionsSearchCall');
        cy.get(route.searchCases.toggleDecisions).parent()
          .click(); // 1 result found in treatments
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

      cy.get(route.searchAgendaitems.row.shortTitle).eq(0)
        .contains('Hawaï');
      cy.get(route.searchAgendaitems.row.shortTitle).eq(1)
        .contains('accenten');

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(route.searchAgendaitems.sidebar.sortOptions).select('Relevantie');
      cy.wait('@searchCall2');
      cy.url().should('contain', 'sorteer=&');

      cy.get(route.searchAgendaitems.row.shortTitle).eq(0)
        .contains('accenten');
      cy.get(route.searchAgendaitems.row.shortTitle).eq(1)
        .contains('Hawaï');
    });
  });
});
