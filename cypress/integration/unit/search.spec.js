/* global context, before, it, cy,beforeEach, afterEach, Cypress, xit */
// / <reference types="Cypress" />
import search from '../../selectors/search.selectors';
import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import toolbar from '../../selectors/toolbar.selectors';
import dependency from '../../selectors/dependency.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Search tests', () => {
  const options = [5, 10, 50, 100];

  const dateToCreateAgenda = Cypress.moment().add(2, 'weeks')
    .day(1)
    .subtract(1, 'day');

  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const searchFunction = (elementsToCheck) => {
    elementsToCheck.forEach((option) => {
      cy.get(search.searchfield).type('test');
      cy.get(search.searchTrigger).click();
      cy.get(dependency.emberPowerSelect.trigger)
        .click()
        .then(() => cy.selectOptionInSelectByText(option));
      cy.url().should('include', `aantal=${option}`);
      cy.get(search.searchfield).clear();
    });
  };

  // TODO cy.server is used alot throughout these tests, but the one in before should be enough.

  it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
    cy.visit('zoeken/agendapunten');
    searchFunction(options);
  });

  it('Should change the amount of elements to every value in selectbox in dossiers search view', () => {
    cy.visit('zoeken/dossiers');
    searchFunction(options);
  });

  it('Add content for funky searchterms', () => {
    const testId = `testId=${currentTimestamp()}: `;

    const PLACE = 'Lāna Hawaï eiland';
    const KIND = 'Ministerraad';
    cy.createAgenda(KIND, dateToCreateAgenda, PLACE);
    // TODO opening agenda not needed yet
    cy.openAgendaForDate(dateToCreateAgenda);

    const case1TitleShort = `${testId}Cypress search dossier 1`;
    const type1 = 'Nota';
    // TODO new lines will be stripped during saving, why have them here ?
    const newSubcase1TitleShort = 'dit is de korte titel for search 🔍 Lāna Hawaï eiland\n\n';
    const subcase1TitleLong = 'dit is de lange titel for search and searching 🔎 Principiële accénten\n\n';
    const subcase1Type = 'In voorbereiding';
    const subcase1Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    const case2TitleShort = `${testId}Cypress search dossier 2`;
    const type2 = 'Nota';
    const newSubcase2TitleShort = `${testId} korte titel for batterij`;
    const subcase2TitleLong = `${testId} lange titel for peerd`;
    const subcase2Type = 'In voorbereiding';
    const subcase2Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case1TitleShort);
    cy.addSubcase(type1, newSubcase1TitleShort, subcase1TitleLong, subcase1Type, subcase1Name);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(dateToCreateAgenda);

    cy.createCase(false, case2TitleShort);
    cy.addSubcase(type2, newSubcase2TitleShort, subcase2TitleLong, subcase2Type, subcase2Name);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(dateToCreateAgenda);

    cy.openAgendaForDate(dateToCreateAgenda);
    // cy.contains('dit is de korte titel for search 🔍').click();
    // UTF8 extende set  does not seem to work on database on test server.
    // TODO use opendetailofagendaitem and newSubcase1TitleShort to open detail
    // TODO, is also not needed because addDocumentsToAgendaitem already does opendetailofagendaitem
    cy.contains('dit is de korte titel for search').click();

    const file = {
      folder: 'files', fileName: 'searchwords', fileExtension: 'pdf', newFileName: 'searchwords pdf', fileType: 'Nota',
    };
    const files = [file];
    cy.addDocumentsToAgendaitem(newSubcase2TitleShort, files);
    cy.addDocumentToTreatment(file); // TODO is this saved? Command does not include saving

    cy.openAgendaForDate(dateToCreateAgenda);
    // TODO use opendetailofagendaitem and newSubcase1TitleShort to open detail
    cy.contains('dit is de korte titel for search').click();
    cy.get(agenda.agendaitemTitlesView.edit).should('exist')
      .should('be.visible')
      .click();

    // TODO confidential toggle, use better selector ?
    cy.get(form.formVlToggle).should('exist')
      .click();

    // cy.get(agenda.agendaitemTitlesEdit.shorttitle).clear();
    // cy.get(agenda.agendaitemTitlesEdit.shorttitle).type('you shall find me in the codezz\n\n');
    //
    // cy.get(agenda.agendaitemTitlesEdit.title).clear();
    // cy.get(agenda.agendaitemTitlesEdit.title).type('dit is de lange titel\n\n');
    //
    // cy.get(agenda.agendaitemTitlesEdit.explanation).clear();
    // cy.get(agenda.agendaitemTitlesEdit.explanation).type('Dit is de opmerking');

    cy.get(agenda.agendaitemTitlesEdit.actions.save).should('exist')
      .should('be.visible')
      .click();
    // TODO we don't await patch calls, is data saved properly ?
  });

  it('Search for non existing searchterm in agendaitems', () => {
    cy.visit('/zoeken/agendapunten');
    cy.get('[data-test-searchfield]').clear();
    cy.get('[data-test-searchfield]').type('nietstezienhier');

    cy.server(); // TODO server here not needed ?
    cy.route('GET', '/agendaitems/search?**').as('searchCall');
    cy.get(search.searchTrigger).click();
    cy.wait('@searchCall');

    cy.get('[data-table]').should('not.exist');
    // TODO not existing of data table could have multiple reasons (still loading, error)
    // TODO check auk.emptyState and text instead "Er werden geen resultaten gevonden. Pas je trefwoord en filters aan."
  });

  it('Search for funky searchterms in agendaitems', () => {
    cy.visit('/zoeken/agendapunten');
    // TODO reenable to check if autocomplete works better now ? (+7 months later)
    const wordsToCheck1 = [
      'peerd',
      /* 'peer', // TODO autocomplete search does not yet work here.*/
      /* 'batter', // TODO autocomplete search does not yet work here.*/
      'batterij'
    ];
    wordsToCheck1.forEach((searchTerm) => {
      cy.get('[data-test-searchfield]').clear();
      cy.get('[data-test-searchfield]').type(searchTerm);

      cy.server();
      cy.route('GET', '/agendaitems/search?**').as('searchCall');
      cy.get(search.searchTrigger).click();
      cy.wait('@searchCall');

      // TODO use newSubcase2TitleShort instead of fixed data
      cy.get('[data-table]').contains('korte titel for batterij');
    });

    cy.get(toolbar.mHeader.settings).click();
    cy.wait(1000);
    cy.get(toolbar.mHeader.search).click();
    // TODO reenable reset test ?
    // https://github.com/kanselarij-vlaanderen/kaleidos-frontend/blob/a30ff5fa756691b824031c5c069d906b70d67b09/app/pods/search/index/route.js#L10
    // cy.wait(1000);
    // cy.get('[data-test-searchfield]').should('have.value', '');
  });

  it('Searchfield should be empty after revisting search page', () => {
    cy.visit('/zoeken/agendapunten');
    cy.get(search.searchfield).clear();
    cy.get(search.searchfield).type('TestSearchSet');
    cy.server();
    cy.get(search.searchTrigger).click();
    cy.wait(1000);
    cy.get(toolbar.mHeader.settings).click();
    cy.wait(1000);
    cy.get(toolbar.mHeader.search).click();
    // https://github.com/kanselarij-vlaanderen/kaleidos-frontend/blob/a30ff5fa756691b824031c5c069d906b70d67b09/app/pods/search/index/route.js#L10
    // cy.wait(1000);
    // cy.get(search.searchfield).should('have.value', '');
  });

  it('Search for funky searchterms in dossiers', () => {
    cy.visit('/zoeken/dossiers');
    const wordsToCheck2 = [
      'Principiële',
      'principiele',
      /* 'princi', // TODO stemming less search does not yet fully work here.*/
      'Lāna',
      'lana',
      'Hawaï',
      'hawaï',
      'search',
      'accénte', // this prefix (autocomplete search) does work - probably also stemming related.
      /* 'accent', // TODO autocomplete search does not yet work here.*/
      'accénten'
    ];
    wordsToCheck2.forEach((searchTerm) => {
      cy.get('[data-test-searchfield]').clear();
      cy.get('[data-test-searchfield]').type(searchTerm);

      cy.server();
      cy.route('GET', '/cases/search?**').as('casesSearchCall');
      cy.get(search.searchTrigger).click();
      cy.wait('@casesSearchCall');

      // TODO case1TitleShort instead of hardcoded text
      cy.get('[data-table]').contains('Cypress search dossier 1');
      // TODO assert some of the words will aso yield dosser 2 as result, some don't. Assert we dont always show all cases
    });
  });

  xit('Search for funky searchterms on dossiers ONLY beslissingsfiche', () => {
    cy.visit('/zoeken/dossiers');
    const wordsFromPdf = [
      'krokkettenmaker',
      'codez'
      // 'krokket'
    ];
    wordsFromPdf.forEach((searchTerm) => {
      cy.get('[data-test-searchfield]').clear();
      cy.get('[data-test-searchfield]').type(searchTerm);
      cy.get('[data-test-decisions-only-check] .auk-checkbox').click();

      cy.server();
      cy.route('GET', '/casesByDecisionText/search?**').as('decisionsSearchCall');
      cy.get(search.searchTrigger).click();
      cy.wait('@decisionsSearchCall');

      cy.get('[data-table]').contains('korte titel for batterij');
    });
  });

  it('Search for funky searchterms in agenda overview', () => {
    cy.openAgendaForDate(dateToCreateAgenda);

    // TODO use const data instead of harcoded text, better selectors
    cy.get('.vlc-agenda-items').contains('titel for batterij');
    cy.get('.vlc-agenda-items').contains('titel for search');

    cy.server();
    cy.route('GET', '/agendaitems/search?**IKBESTANIET**').as('searchCallOverview-IKBESTANIET');

    cy.get(agenda.agendaitemSearch.input).clear();
    cy.get(agenda.agendaitemSearch.input).type('IKBESTANIET');
    cy.wait(200);
    cy.wait('@searchCallOverview-IKBESTANIET');

    // Should find nothing.
    // TODO why twice ?
    cy.get('.vlc-agenda-items').contains('Er zijn nog geen agendapunten in deze agenda.');
    cy.get('.vlc-agenda-items').contains('Er zijn nog geen mededelingen in deze agenda.');

    const wordsToCheck1 = [
      'peerd',
      /* 'peer', // TODO autocomplete search does not yet work here.*/
      /* 'batter', // TODO autocomplete search does not yet work here.*/
      'batterij'
    ];
    const wordsToCheck2 = [
      'Principiële',
      'principiele',
      'principie',
      // 'princ',
      /* 'princi', // TODO stemming less search does not yet fully work here.*/
      'Lāna',
      'lana',
      'lan',
      'Hawaï',
      'hawaï',
      'hawai',
      'hawa',
      'search',
      'accénte', // this prefix (autocomplete search) does work - probably also stemming related.
      /* 'accent', // TODO autocomplete search does not yet work here.*/
      'accénten'
    ];
    wordsToCheck1.forEach((searchTerm) => {
      cy.route('GET', `/agendaitems/search?**${searchTerm}**`).as(`searchCallOverview-${searchTerm}`);
      cy.get(agenda.agendaitemSearch.input).clear();
      cy.get(agenda.agendaitemSearch.input).type(searchTerm);
      cy.wait(200);
      cy.wait(`@searchCallOverview-${searchTerm}`);
      cy.get('.vlc-agenda-items').contains('korte titel for batterij');
    });
    wordsToCheck2.forEach((searchTerm) => {
      cy.route('GET', `/agendaitems/search?**${searchTerm}**`).as(`searchCallOverview-${searchTerm}`);
      cy.get(agenda.agendaitemSearch.input).clear();
      cy.get(agenda.agendaitemSearch.input).type(searchTerm);
      cy.wait(200);
      cy.wait(`@searchCallOverview-${searchTerm}`);
      cy.get('.vlc-agenda-items').contains('korte titel for search');
    });
  });
});
