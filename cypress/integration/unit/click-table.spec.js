/* eslint-disable no-undef */
/// <reference types="Cypress" />

context("Table Row Click tests", () => {
	beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it("should open an agenda after clicking a row", () => {
		cy.route('GET', '/meetings?**').as('getMeetings');
		cy.route('GET', '/agendas/**/agendaitems').as('getAgendas');

		cy.clickReverseTab('Historiek');
		cy.wait('@getMeetings');
		cy.get('.data-table > tbody').children().as('rows').eq(0).click();
		cy.wait('@getAgendas');
		cy.url().should('contain', 'agendapunten');
	});
	
	it("should open a case after clicking a row", () => {
		cy.route('GET', '/cases**').as('getCases');
		cy.visit('/dossiers');
		cy.wait('@getCases', {timeout: 12000});
		cy.get('.data-table > tbody').children().as('rows').eq(0).click();
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
});
