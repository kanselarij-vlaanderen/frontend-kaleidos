/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

context('Table Row Click tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-publication add publication table row click test, make sure to have at least 1 publication in default set

  it('should open an agenda after clicking a row', () => {
    cy.intercept('GET', '/agendas/**').as('getAgendas');

    cy.get(route.agendasOverview.dataTable).find('tbody')
      .children('tr')
      .as('rows')
      .eq(0)
      .click();
    cy.wait('@getAgendas');
    cy.url().should('contain', 'agendapunten');
  });

  it('should open a case after clicking a row', () => {
    cy.intercept('GET', '/decisionmaking-flows**').as('getCases');
    cy.visit('/dossiers');
    cy.wait('@getCases');
    cy.get(route.casesOverview.dataTable).find('tbody')
      .children('tr')
      .as('rows')
      .eq(0)
      .click();
    cy.url().should('contain', 'deeldossiers');
  });

  it('should open a news-item after clicking a row', () => {
    cy.intercept('GET', '/meetings?**').as('getMeetings');
    cy.intercept('GET', '/agendaitems**').as('getAgendaitems');
    cy.visit('/kort-bestek');
    cy.wait('@getMeetings');
    cy.get(route.newsletters.dataTable).find('tbody')
      .children('tr')
      .as('rows')
      .eq(0)
      .click();
    cy.wait('@getAgendaitems', {
      timeout: 12000,
    });
    cy.url().should('contain', '/vergadering')
      .should('contain', '/kort-bestek');
  });

  it('should filter the agenda-page and remove the active filter afterwards', () => {
    cy.get(route.agendasOverview.dataTable).find('tbody')
      .children('tr')
      .should('not.have.length', 0);
    cy.get(route.agendasOverview.filter.input).click()
      .type('02/2019');
    cy.get(route.agendasOverview.filter.warning).should('be.visible');
    cy.get(route.agendasOverview.filter.warning).contains('Geen resultaten gevonden');
    cy.get(utils.changesAlert.message).contains('Deze data is gefilterd.');
    cy.get(utils.changesAlert.confirm).click();
    cy.get(route.agendasOverview.dataTable).find('tbody')
      .children('tr')
      .should('not.have.length', 0);
  });
});
