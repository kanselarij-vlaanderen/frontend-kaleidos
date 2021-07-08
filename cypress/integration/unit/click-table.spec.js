/* global context, before, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

context('Table Row Click tests', () => {
  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-publication add publication table row click test, make sure to have at least 1 publication in default set

  it('should open an agenda after clicking a row', () => {
    cy.route('GET', '/agendas/**/agendaitems').as('getAgendas');

    cy.get(route.agendasOverview.dataTable).children()
      .as('rows')
      .eq(0)
      .click();
    cy.wait('@getAgendas');
    cy.url().should('contain', 'agendapunten');
  });

  it('should open a case after clicking a row', () => {
    cy.route('GET', '/cases**').as('getCases');
    cy.visit('/dossiers');
    cy.wait('@getCases', {
      timeout: 12000,
    });
    cy.get(route.casesOverview.dataTable).children()
      .as('rows')
      .eq(0)
      .click();
    cy.url().should('contain', 'deeldossiers');
  });

  it('should open a newsletter-info after clicking a row', () => {
    cy.route('GET', '/meetings?**').as('getMeetings');
    cy.route('GET', '/agendaitems**').as('getAgendaitems');
    cy.visit('/kort-bestek');
    cy.wait('@getMeetings', {
      timeout: 12000,
    });
    cy.get(route.newsletters.dataTable).children()
      .as('rows')
      .eq(0)
      .click();
    cy.wait('@getAgendaitems', {
      timeout: 12000,
    });
    cy.url().should('contain', '/vergadering')
      .should('contain', '/kort-bestek');
  });

  it.only('should filter the agenda-page and remove the active filter afterwards', () => {
    cy.route('GET', '/meetings?**').as('getMeetings');
    cy.wait('@getMeetings', {
      timeout: 30000,
    });
    cy.get(route.agendasOverview.dataTable).children()
      .should('not.have.length', 0);
    cy.get(route.agendasOverview.filter.input).click()
      .type('02/2019');
    cy.get(route.agendasOverview.filter.button).click();
    cy.get(utils.vlAlert.message).contains('Er zijn nog geen historische agenda\'s');
    cy.get(utils.changesAlert.alert).contains('Deze data is gefilterd.');
    cy.get(utils.changesAlert.close).click();
    cy.get(route.agendasOverview.dataTable).children()
      .should('not.have.length', 0);
  });
});
