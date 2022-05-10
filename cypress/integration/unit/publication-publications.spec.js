/* global context, it, cy, beforeEach, afterEach */

// / <reference types="Cypress" />
import publication from '../../selectors/publication.selectors';
// import auk from '../../selectors/auk.selectors';
// import utils from '../../selectors/utils.selectors';

context('Publications proofs tests', () => {
  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open a publication and upload publication without request', () => {
    const fields = {
      number: 1666,
      shortTitle: 'test publicatie zonder request',
    };
    cy.intercept('GET', '/publication-activities?filter**subcase**').as('getPublicationModel');

    cy.createPublication(fields);
    cy.get(publication.publicationNav.publications).click()
      .wait('@getPublicationModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/publicatie');

    // upload publication without request
    cy.get(publication.publicationActivities.register).click();
    cy.intercept('GET', '/publication-activities?filter**subcase**').as('reloadPublicationModel');
    cy.get(publication.publicationRegistration.save).click()
      .wait('@reloadPublicationModel');
    cy.get(publication.publicationRegisteredPanel.panel).should('have.length', 1);
  });
});
