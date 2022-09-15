/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import publication from '../../selectors/publication.selectors';

context('Publications documents tests', () => {
  function checkUploadAndDelete(file) {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(publication.documentsList.piece).should('have.length', 1);
    cy.get(publication.documentsList.deletePiece).click();
    cy.get(publication.documentsList.piece).should('not.exist');
    cy.get(auk.modal.footer.cancel).click();
  }

  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open all the upload and request modals, select a file to upload and delete the selected file', () => {
    const fields = {
      number: 1690,
      shortTitle: 'test vertalingsaanvraag',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.createPublication(fields);

    // decision modal
    cy.intercept('GET', '/pieces?filter**publication-flow**').as('getPieces');
    cy.get(publication.publicationNav.decisions).click()
      .wait('@getPieces');
    // Make sure the page transitioned
    cy.url().should('contain', '/besluiten');
    cy.get(publication.decisionsIndex.uploadReference).click();
    checkUploadAndDelete(file);

    // translations modals
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('getTranslationsModel');
    cy.get(publication.publicationNav.translations).click()
      .wait('@getTranslationsModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/vertalingen');
    cy.get(publication.translationsIndex.upload).click();
    checkUploadAndDelete(file);
    cy.get(publication.translationsIndex.requestTranslation).click();
    checkUploadAndDelete(file);

    // proofs modals
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('getProofingModel');
    cy.get(publication.publicationNav.proofs).click()
      .wait('@getProofingModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/drukproeven');
    cy.get(publication.proofsIndex.upload).click();
    checkUploadAndDelete(file);
    cy.get(publication.proofsIndex.newRequest).click();
    checkUploadAndDelete(file);

    // publications modal
    cy.intercept('GET', '/publication-activities?filter**subcase**').as('getPublicationModel');
    cy.get(publication.publicationNav.publications).click()
      .wait('@getPublicationModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/publicatie');
    cy.get(publication.publicationActivities.request).click();
    checkUploadAndDelete(file);
  });
});
