
/* global context, it, cy, beforeEach, afterEach, it */
// / <reference types="Cypress" />
import route from '../../selectors/route.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';

context('Search tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Search for title in kort-bestek and open the detail view by clicking icon', () => {
    cy.visit('/kort-bestek/zoeken');
    cy.wait(1500); // TODO-bug flakyness on this page, maybe cypress is too fast??
    // ! depends on mandatee-assigning.spec and could fail
    const searchTerm = 'assign mandatee';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);

    cy.intercept('GET', '/news-items/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    cy.get(route.searchNewsletters.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 3);
    // The search results are randomly sorted between each test run (mainly because of bad test data)
    // So we can't know what info is showing in each row, but we do know what should be showing in the 3 rows
    // the title and decision result will be the same for all 3, contains() gets the first one
    cy.get(route.searchNewsletters.row.title).contains(searchTerm);
    cy.get(route.searchNewsletters.row.decisionResult).contains('Goedgekeurd');
    cy.get(route.searchNewsletters.row.mandatees).contains('Jan Jambon, Hilde Crevits');
    cy.get(route.searchNewsletters.row.mandatees).contains('Jan Jambon, Hilde Crevits, Matthias Diependaele');
    cy.get(route.searchNewsletters.row.mandatees).contains('Jan Jambon, Hilde Crevits, Gwendolyn Rutten, Ben Weyts, Zuhal Demir');
    cy.get(route.searchNewsletters.row.goToAgendaitem).eq(0)
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
    cy.url().should('contain', '/kort-bestek');
  });

  it('Search for htmlContent in kort-bestek and open the detail view by clicking row', () => {
    cy.visit('/kort-bestek/zoeken');
    // ! depends on news-item.spec and could fail
    // *note: this test searches for data from news-item.spec and could fail
    // the reasoning behind this is for making sure that the index updates still work
    const searchTerm = 'this nota info should be visible in definitief';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);

    cy.intercept('GET', '/news-items/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    cy.get(route.searchNewsletters.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1);
    cy.get(route.searchNewsletters.row.title).contains(searchTerm);
  });

  it('Search for kort-bestek items that have links to multiple agendaitem/agenda versions', () => {
    cy.visit('/kort-bestek/zoeken');
    // ! depends on agendaitem-changes.spec and could fail
    const searchTerm = 'testId=1589266576';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);

    cy.intercept('GET', '/news-items/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    // amount of rows is too flaky (data from previous tests) and not tested. We expect at least 1 result
    cy.get(appuniversum.alert.container).should('not.exist');
    cy.get(route.searchNewsletters.row.title).contains(searchTerm);
  });

  it('Search for mandatee in kort-bestek', () => {
    cy.visit('/kort-bestek/zoeken');
    // ! depends on mandatee-assigning.spec and could fail
    const searchTerm = 'test';
    const mandateeSearchTerm = 'Jambon';
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);
    cy.get(route.search.mandatee).type(mandateeSearchTerm);

    cy.intercept('GET', '/news-items/search?**').as('newsletterSearchCall');
    cy.get(route.search.trigger).click();
    cy.wait('@newsletterSearchCall');

    // amount of rows is too flaky (data from previous tests) and not tested. We expect at least 1 result
    cy.get(appuniversum.alert.container).should('not.exist');
    cy.get(route.searchNewsletters.row.mandatees).contains('Jan Jambon');
  });
});
