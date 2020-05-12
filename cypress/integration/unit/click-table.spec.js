/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />

context("Table Row Click tests", () => {

  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it("should open an agenda after clicking a row", () => {
		cy.route('GET', '/agendas/**/agendaitems').as('getAgendas');

		cy.get('.data-table > tbody').children().as('rows').eq(0).click();
		cy.wait('@getAgendas');
		cy.url().should('contain', 'agendapunten');
	});

	it("should open a case after clicking a row", () => {
		cy.route('GET', '/cases/search**').as('getCases');
		cy.visit('/dossiers');
    cy.wait('@getCases', {timeout: 12000});
    cy.openCase('Eerste dossier');
		cy.url().should('contain', 'deeldossiers');
	});

	it("should open a newsletter-info after clicking a row", () => {
		cy.route('GET', '/meetings?**').as('getMeetings');
		cy.route('GET', '/agendaitems**').as('getAgendaitems');
		cy.visit('/kort-bestek');
		cy.wait('@getMeetings', {timeout: 12000});
		cy.get('.data-table > tbody').children().as('rows').eq(0).click();
		cy.wait('@getAgendaitems', {timeout: 12000});
		cy.url().should('contain', '/kort-bestek/');
  });

	it("should filter the agenda-page and remove the active filter afterwards", () => {
    cy.route('GET', '/meetings?**').as('getMeetings');
    cy.wait('@getMeetings', {timeout: 12000});
    cy.get('.vl-input-field').as('inputField').click().type('02/2019');
    cy.get('.vl-button.vl-button--secondary.vl-button--icon').as('searchButton').click();
    cy.get('.vl-alert__content').should('exist').contains('Deze data is gefilterd.');
    cy.get('.vl-button.vl-button--narrow.vl-button--reset').should('exist').contains('Reset filter');
    cy.get('.vl-button.vl-button--narrow.vl-button--reset').contains('Reset filter').click();
    cy.get('td').contains('No data').should('not.exist');
  })
});
