/* global context, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
// import cases from '../../selectors/case.selectors';
import route from '../../selectors/route.selectors';
// import utils from '../../selectors/utils.selectors';

context('meeting actions tests', () => {
  const searchTerm = 'test';
  const date = Cypress.dayjs();

  function searchClearSearch(searchTerm, date) {
    cy.get(route.search.input).clear();
    cy.get(route.search.input).type(searchTerm);
    cy.get(route.search.from).find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(date);
    cy.get(route.search.to).find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(date);
    cy.get(route.search.trigger).click();
    cy.url().should('include', searchTerm);
    cy.url().should('include', date.format('DD-MM-YYYY'));

    cy.get(route.search.from).find(auk.datepicker.clear)
      .click();
    cy.get(route.search.from).find(auk.datepicker.datepicker)
      .should('have.value', '');
    cy.get(route.search.to).find(auk.datepicker.clear)
      .click();
    cy.get(route.search.to).find(auk.datepicker.datepicker)
      .should('have.value', '');

    cy.get(route.search.trigger).click();
    cy.url().should('include', searchTerm);
    cy.url().should('not.include', date.format('DD-MM-YYYY'));
  }

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should remove date from datepicker with x button in search agendapunten', () => {
    cy.visit('/zoeken/agendapunten');
    searchClearSearch(searchTerm, date);
  });

  it('should remove date from datepicker with x button in search dossiers', () => {
    cy.visit('/zoeken/dossiers');
    searchClearSearch(searchTerm, date);
  });

  it('should remove date from datepicker with x button in search publications', () => {
    cy.visit('/publicaties/overzicht/zoeken');
    searchClearSearch(searchTerm, date);
  });

  it('should remove date from datepicker with x button in search kort-bestek', () => {
    cy.visit('/kort-bestek/zoeken');
    searchClearSearch(searchTerm, date);
  });
});
