/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import auk from '../../selectors/auk.selectors';
import publication from '../../selectors/publication.selectors';
import utils from '../../selectors/utils.selectors';

context('Publications translation tests', () => {
  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open a publication, request translation and check CRUD', () => {
    const fields = {
      number: 1615,
      shortTitle: 'test vertalingsaanvraag',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const numberOfPages = 5;
    const numberOfWords = 1000;
    const translationEndDate = Cypress.dayjs();
    const editedTranslationEndDate = translationEndDate.add(1, 'day');
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('getTranslationsModel');

    cy.createPublication(fields);
    cy.get(publication.publicationNav.translations).click()
      .wait('@getTranslationsModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/vertalingen');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Opgestart');
    // Check empty state message
    cy.get(publication.translationsIndex.panelBody).find(auk.emptyState.message);

    // check rollback after cancel request
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.get(auk.datepicker).click();
    cy.setDateInFlatpickr(translationEndDate);
    cy.get(publication.translationRequest.numberOfPages).should('be.empty')
      .type(numberOfPages);
    cy.get(publication.translationRequest.numberOfWords).should('be.empty')
      .type(numberOfWords);
    // after updating pages and words, the text of the message updates, but cypress is faster then the update
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(publication.translationRequest.message).should('have.value', `Collega,\n\nHierbij ter vertaling:\nVO-dossier: ${fields.number}\nTitel: test vertalingsaanvraag\t\nUiterste vertaaldatum: ${translationEndDate.format('DD.MM.YYYY')}\t\nAantal pagina’s: ${numberOfPages}\t\nAantal woorden: ${numberOfWords}\t\nAantal documenten: 1\t\n\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(auk.modal.footer.cancel).click();
    cy.wait('@deleteFile');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(publication.translationsIndex.panelBody).find(auk.emptyState.message);

    // new request to delete
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.get(auk.datepicker).click();
    cy.setDateInFlatpickr(translationEndDate);
    cy.get(publication.translationRequest.numberOfPages).should('be.empty')
      .type(numberOfPages);
    cy.get(publication.translationRequest.numberOfWords).should('be.empty')
      .type(numberOfWords);
    // uncheck the status update that is checked by default
    cy.get(publication.translationRequest.updateStatus).parent('label')
      .click();
    // after updating pages and words, the text of the message updates, but cypress is faster then the update
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('POST', 'request-activities').as('createRequestActivity');
    cy.intercept('PATCH', 'translation-subcases/**').as('patchTranslationSubcase');
    cy.intercept('POST', 'emails').as('createEmail');
    cy.intercept('GET', 'request-activities/**/translation-activity').as('getTranslationsActivity');
    cy.get(publication.translationRequest.save).click();
    cy.wait('@createNewPiece')
      .wait('@createRequestActivity')
      .wait('@patchTranslationSubcase')
      .wait('@createEmail')
      .wait('@getTranslationsActivity');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Opgestart');
    cy.get(publication.requestActivityPanel.message)
      .contains(`VO-dossier: ${fields.number}`)
      .contains(`Uiterste vertaaldatum: ${translationEndDate.format('DD.MM.YYYY')}`)
      .contains(`Aantal pagina’s: ${numberOfPages}`)
      .contains(`Aantal woorden: ${numberOfWords}`);
    // check delete
    cy.get(publication.requestActivityPanel.dropdown).click();
    cy.get(publication.requestActivityPanel.delete).click();
    cy.intercept('DELETE', '/translation-activities/*').as('deleteTranslation');
    cy.intercept('DELETE', '/emails/*').as('deleteEmails');
    cy.intercept('DELETE', '/files/*').as('deleteFiles');
    cy.intercept('DELETE', '/document-containers/*').as('deleteDocumentContainers');
    cy.intercept('DELETE', '/request-activities/*').as('deleteRequestActivities');
    cy.get(utils.alertDialog.confirm).click()
      .wait('@deleteTranslation')
      .wait('@deleteEmails')
      .wait('@deleteFiles')
      .wait('@deleteDocumentContainers')
      .wait('@deleteRequestActivities');
    cy.get(publication.translationsIndex.panelBody).find(auk.emptyState.message);

    // new request
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.datepicker).click();
    cy.setDateInFlatpickr(translationEndDate);
    cy.get(publication.translationRequest.numberOfPages).should('be.empty')
      .type(numberOfPages);
    cy.get(publication.translationRequest.numberOfWords).should('be.empty')
      .type(numberOfWords);
    cy.get(publication.translationRequest.updateStatus).should('be.checked'); // default checked
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('POST', 'request-activities').as('createRequestActivity');
    cy.intercept('PATCH', 'translation-subcases/**').as('patchTranslationSubcase');
    cy.intercept('POST', 'emails').as('createEmail');
    cy.intercept('GET', 'request-activities/**/translation-activity').as('getTranslationsActivity');
    cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlows');
    cy.get(publication.translationRequest.save).click();
    cy.wait('@createNewPiece')
      .wait('@createRequestActivity')
      .wait('@patchTranslationSubcase')
      .wait('@createEmail')
      .wait('@patchPublicationFlows')
      .wait('@getTranslationsActivity');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Naar vertaaldienst');
    // check upload translation
    cy.get(publication.translationsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/translation-activities/*').as('patchTranslationActivities');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('reloadTranslationModel');
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 1);
    // uncheck the status update that is checked by default
    cy.get(publication.translationUpload.updateStatus).parent('label')
      .click();
    cy.get(publication.translationUpload.save).click()
      .wait('@patchTranslationActivities')
      .wait('@getPieces')
      .wait('@reloadTranslationModel')
      .wait(500); // the model reloaded but not fully processed, making DOM elements reload.
    cy.get(publication.statusPill.contentLabel).should('contain', 'Naar vertaaldienst');
    // check edit and rollback
    cy.get(publication.translationReceivedPanel.endDate).contains(translationEndDate.format('DD.MM.YYYY'));
    cy.get(publication.translationReceivedPanel.dropdown).click();
    cy.get(publication.translationReceivedPanel.edit).click();
    cy.get(auk.datepicker).click();
    cy.setDateInFlatpickr(editedTranslationEndDate);
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.translationReceivedPanel.endDate).contains(translationEndDate.format('DD.MM.YYYY'));
    cy.get(publication.translationReceivedPanel.dropdown).click();
    cy.get(publication.translationReceivedPanel.edit).click();
    cy.get(auk.datepicker).click();
    cy.setDateInFlatpickr(editedTranslationEndDate);
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('reloadTranslationModel2');
    cy.get(publication.translationActivityEdit.save).click()
      .wait('@reloadTranslationModel2');
    cy.get(publication.translationReceivedPanel.endDate).contains(editedTranslationEndDate.format('DD.MM.YYYY'));
    //  upload second translation
    cy.get(publication.translationsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.get(publication.translationUpload.updateStatus).should('be.checked'); // default checked
    cy.intercept('PATCH', '/translation-activities/*').as('patchTranslationActivities');
    cy.intercept('PATCH', '/translation-subcases/*').as('patchTranslationSubcases');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlows');
    cy.intercept('POST', '/publication-status-changes').as('postPublicationStatusChanges');
    // these calls happen in a random order because of promises
    cy.get(publication.translationUpload.save).click()
      .wait('@patchTranslationActivities')
      .wait('@patchTranslationSubcases')
      .wait('@getPieces')
      .wait('@patchPublicationFlows')
      .wait('@postPublicationStatusChanges');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Vertaling in');
    cy.get(publication.translationReceivedPanel.panel).find(publication.documentsList.piece)
      .should('have.length', 2);
  });
});
