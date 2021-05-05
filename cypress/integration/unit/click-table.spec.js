/* global context, before, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

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

  // TODO add publication table row click test, make sure to have at least 1 publication in default set

  it('should open an agenda after clicking a row', () => {
    cy.route('GET', '/agendas/**/agendaitems').as('getAgendas');

    cy.get('.data-table > tbody').children()
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
    cy.get('.data-table > tbody').children()
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
    cy.get('.data-table > tbody').children()
      .as('rows')
      .eq(0)
      .click();
    cy.wait('@getAgendaitems', {
      timeout: 12000,
    });
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/kort-bestek');
  });

  // TODO, this test does not belong in click-table spec
  it('should filter the agenda-page and remove the active filter afterwards', () => {
    cy.route('GET', '/meetings?**').as('getMeetings');
    cy.wait('@getMeetings', {
      timeout: 12000,
    });
    cy.get('.auk-input').as('inputField')
      .click()
      .type('02/2019');
    cy.get('.auk-button.auk-button--secondary.auk-button--icon').as('searchButton')
      .click();
    // TODO filtering can fail (showing all agendas) but this message will always show when filtered. Count the agendas
    cy.get('.vl-alert__content').should('exist')
      .contains('Deze data is gefilterd.');
    // TODO should('exist') is overkill, if it doesn't exist, we can't cy.get it anyway
    cy.get('.auk-button.auk-button--warning-primary').should('exist')
      .contains('Reset filter');
    cy.get('.auk-button.auk-button--warning-primary').contains('Reset filter')
      .click();
    // TODO this assert proves nothing, this table row never exists. Check the number of agenda's before filter, and after resetting filter
    cy.get('td').contains('No data')
      .should('not.exist');
  });
});
