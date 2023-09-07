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

  it('should check the threadId field in proofs', () => {
    const threadId = 123456;
    const formattedThreadId = `thread::${threadId}::`;

    cy.visit('/publicaties/626FBC3BCB00108193DC4361/dossier');

    // setup
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.threadId).click()
      .clear()
      .type(threadId);
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.intercept('PATCH', '/publication-subcases/**').as('patchPublicationSubcase');
    cy.intercept('PATCH', '/identifications/**').as('patchThreadId1');
    cy.intercept('POST', '/identifications').as('postThreadId');
    cy.get(publication.publicationCaseInfo.editView.save).click();
    cy.wait('@patchPublicationFlow');
    cy.wait('@patchPublicationSubcase');
    cy.wait('@patchThreadId1');
    cy.wait('@postThreadId');

    // check if message contains thread id
    cy.get(publication.publicationNav.publications).click();
    cy.get(publication.publicationActivities.request).click();
    cy.get(publication.publicationRequest.message).invoke('val')
      .as('value');
    cy.get('@value').should(($p) => {
      expect($p).to.contain(formattedThreadId);
    });
    cy.get(auk.modal.footer.cancel).click();

    // remove id
    cy.get(publication.publicationNav.case).click();
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.threadId).click()
      .clear();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.intercept('PATCH', '/publication-subcases/**').as('patchPublicationSubcase');
    cy.intercept('PATCH', '/identifications/**').as('patchThreadId2');
    cy.intercept('DELETE', '/identifications/**').as('deleteThreadId');
    cy.get(publication.publicationCaseInfo.editView.save).click();
    cy.wait('@patchPublicationFlow');
    cy.wait('@patchPublicationSubcase');
    cy.wait('@patchThreadId2');
    cy.wait('@deleteThreadId');
    cy.get(publication.publicationCaseInfo.threadId).contains('-');

    // check if message does not contain thread id
    cy.get(publication.publicationNav.publications).click();
    cy.get(publication.publicationActivities.request).click();
    cy.get(publication.publicationRequest.message).invoke('val')
      .as('value');
    cy.get('@value').should(($p) => {
      expect($p).to.contain('De gewenste datum van publicatie is');
      expect($p).to.not.contain(formattedThreadId);
    });
  });
});
