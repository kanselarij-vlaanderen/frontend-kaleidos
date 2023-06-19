/* global context, it, expect, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
// import utils from '../../selectors/utils.selectors';

context('Publications proofs tests', () => {
  beforeEach(() => {
    cy.login('OVRB');
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

  it('should check the targetEndDate field', () => {
    const lateEndDate = Cypress.dayjs().subtract(5, 'days');
    const formattedLateEndDate = lateEndDate.format('DD-MM-YYYY');

    cy.visit('/publicaties/626FBC3BCB00108193DC4361/publicatie');

    // set targetEndDate
    cy.get(publication.publicationsInfoPanel.edit).click();
    cy.get(publication.publicationsInfoPanel.editView.targetEndDate).find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(lateEndDate);
    cy.get(publication.publicationsInfoPanel.editView.save).click();
    // check if field is updated and warning shows
    cy.get(publication.publicationsInfoPanel.view.targetEndDate).contains(formattedLateEndDate);
    cy.get(auk.formHelpText).contains('Datum verstreken');
    // check if requestmessage contains the targetEndDate
    cy.get(publication.publicationActivities.request).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(publication.publicationRequest.message).invoke('val')
      .as('value');
    cy.get('@value').should(($p) => {
      expect($p).to.contain(formattedLateEndDate);
    });
  });
});
