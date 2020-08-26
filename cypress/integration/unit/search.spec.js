/* global context, before, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />
import search from '../../selectors/search.selectors';

context('Search tests', () => {
  const options = [5, 10, 50, 100];

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
      cy.existsAndVisible('.ember-power-select-trigger')
        .click()
        .then(() => cy.selectOptionInSelectByText(option));
      cy.url().should('include', `aantal=${option}`);
    });
  };

  it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
    cy.visit('zoeken/agendapunten');
    searchFunction(options);
    cy.existsAndVisible('.ember-power-select-trigger')
      .click()
      .then(() => cy.selectOptionInSelectByText('20'));
    cy.url().should('not.include', 'aantal=20');
  });

  it('Should change the amount of elements to every value in selectbox in dossiers search view', () => {
    cy.visit('zoeken/dossiers');
    searchFunction(options);
    cy.existsAndVisible('.ember-power-select-trigger')
      .click()
      .then(() => cy.selectOptionInSelectByText('20'));
    cy.url().should('not.include', 'aantal=20');
  });
});
