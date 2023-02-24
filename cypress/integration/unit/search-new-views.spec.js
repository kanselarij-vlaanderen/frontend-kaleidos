/* global context, it, cy, beforeEach, afterEach, it */
// / <reference types="Cypress" />
// import agenda from '../../selectors/agenda.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';

context('New search views tests', () => {
  const options = [10, 25, 50, 100, 200];
  const emptyStateMessage = 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.';

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

  context('Test zoeken/dossiers', () => {
    beforeEach(() => {
      cy.visit('/zoeken/dossiers');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);

      cy.get(route.searchCases.toggleDecisions);

      cy.get(route.searchCases.removedCasesList);

      cy.get(route.searchConfidentialOnly.checkbox);
    });

    it('Search for non-existing and existing searchterm in dossiers', () => {
      const searchTerm = 'assign mandatee';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/decisionmaking-flows/search?**').as('searchCall1');
      cy.get(route.search.trigger).click()
        .wait('@searchCall1');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      // ! depends on mandatee-assigning.spec and could fail
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/decisionmaking-flows/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      // TODO-waits
      cy.wait(1000);
      cy.get(route.searchCases.dataTable).find('tbody')
        .children('tr')
        .should('have.length', 1);
      cy.get(route.searchCases.row.shortTitle).contains('mandatee');
    });
  });

  context('Test zoeken/agendapunten', () => {
    beforeEach(() => {
      cy.visit('/zoeken/agendapunten');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it.only('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);

      cy.get(route.searchAgendaitems.filter.type);

      cy.get(route.searchAgendaitems.filter.finalAgenda);
    });

    it('Search for non existing and existing searchterm in agendaitems', () => {
      const searchTerm = 'assign mandatee';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall1');
      cy.get(route.search.trigger).click()
        .wait('@searchCall1');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      // ! depends on mandatee-assigning.spec and could fail
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      cy.get(route.searchAgendaitems.dataTable).find('tbody')
        .children('tr')
        .should('have.length', 3);
      cy.get(route.searchAgendaitems.row.shortTitle).contains(searchTerm);
    });
  });

  context('Test zoeken/documenten', () => {
    beforeEach(() => {
      cy.visit('/zoeken/documenten');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);

      cy.get(route.searchConfidentialOnly.checkbox);

      cy.get(route.searchDocumentTypeFilter.list);
    });

    it('Search for non existing and existing searchterm in pieces', () => {
      const searchTerm = 'test pdf';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/pieces/search?**').as('searchCall');
      cy.get(route.search.trigger).click()
        .wait('@searchCall');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      cy.get(route.searchDocuments.dataTable).find('tbody')
        .children('tr');
      cy.get(route.searchNewsletters.row.title).contains(searchTerm);
    });
  });

  context('Test zoeken/beslissingen', () => {
    beforeEach(() => {
      cy.visit('/zoeken/beslissingen');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);
    });

    it('Search for non existing and existing searchterm in decisions', () => {
      const searchTerm = 'test';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall');
      cy.get(route.search.trigger).click()
        .wait('@searchCall');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      cy.get(route.searchDecisions.dataTable).find('tbody')
        .children('tr');
      cy.get(route.searchDecisions.row.title).contains(searchTerm);
    });
  });

  context('Test zoeken/kort-bestek', () => {
    beforeEach(() => {
      cy.visit('/zoeken/kort-bestek');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);
    });

    it('Search for non existing and existing searchterm in news-items', () => {
      const searchTerm = 'assign mandatee';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/news-items/search?**').as('searchCall');
      cy.get(route.search.trigger).click()
        .wait('@searchCall');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      // ! depends on mandatee-assigning.spec and could fail
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      cy.get(route.searchNewsletters.dataTable).find('tbody')
        .children('tr')
        .should('have.length', 3);
      cy.get(route.searchNewsletters.row.title).contains(searchTerm);
    });
  });
});
