/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';

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
    const emptyStateMessage = 'Er zijn nog geen vertalingen.';
    const numberOfPages = 5;
    const numberOfWords = 1000;
    const translationEndDate = Cypress.dayjs();
    const editedTranslationEndDate = translationEndDate.add(1, 'day');
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('getTranslationsModel');

    cy.createPublication(fields);
    cy.get(publication.publicationNav.translations).click()
      .wait('@getTranslationsModel');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Opgestart');
    cy.get(auk.emptyState.message).contains(emptyStateMessage);
    cy.get(publication.translationsDocuments.upload).should('be.disabled');

    // check rollback after cancel request
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.get(publication.translationRequest.numberOfPages).should('be.empty')
      .type(numberOfPages);
    cy.get(publication.translationRequest.numberOfWords).should('be.empty')
      .type(numberOfWords);
    // after updating pages and words, the text of the message updates, but cypress is faster then the update
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(publication.translationRequest.message).should('have.value', `Collega,\n\nHierbij ter vertaling:\nVO-dossier: ${fields.number}\nTitel: test vertalingsaanvraag\t\nUiterste vertaaldatum: ${translationEndDate.format('DD-MM-YYYY')}\t\nAantal pagina’s: ${numberOfPages}\t\nAantal woorden: ${numberOfWords}\t\nAantal documenten: 1\t\n\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(auk.modal.footer.cancel).click();
    cy.wait('@deleteFile');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(auk.emptyState.message).contains(emptyStateMessage);

    // new request
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.get(publication.translationRequest.numberOfPages).should('be.empty')
      .type(numberOfPages);
    cy.get(publication.translationRequest.numberOfWords).should('be.empty')
      .type(numberOfWords);
    // after updating pages and words, the text of the message updates, but cypress is faster then the update
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.get(publication.translationRequest.save).click();
    cy.wait('@createNewPiece');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Naar vertaaldienst');
    cy.get(publication.requestActivityPanel.message)
      .contains(`VO-dossier: ${fields.number}`)
      .contains(`Uiterste vertaaldatum: ${translationEndDate.format('DD-MM-YYYY')}`)
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
    cy.get(auk.alertDialog.confirm).click()
      .wait('@deleteTranslation')
      .wait('@deleteEmails')
      .wait('@deleteFiles')
      .wait('@deleteDocumentContainers')
      .wait('@deleteRequestActivities');
    cy.get(auk.emptyState.message).contains(emptyStateMessage);

    // new request
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(publication.translationRequest.numberOfPages).should('be.empty')
      .type(numberOfPages);
    cy.get(publication.translationRequest.numberOfWords).should('be.empty')
      .type(numberOfWords);
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.get(publication.translationRequest.save).click();
    cy.wait('@createNewPiece');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Naar vertaaldienst');
    // check upload translation
    cy.get(publication.translationsDocuments.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/translation-activities/*').as('patchTranslationActivities');
    cy.intercept('PATCH', '/translation-subcases/*').as('patchTranslationSubcases');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('reloadTranslationModel');
    cy.get(publication.translationUpload.piece).should('have.length', 1);
    cy.get(publication.translationUpload.save).click()
      .wait('@patchTranslationActivities')
      .wait('@patchTranslationSubcases')
      .wait('@getPieces')
      .wait('@reloadTranslationModel');
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
    cy.get(publication.translationsDocuments.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(publication.translationUpload.piece).should('have.length', 1);
    cy.get(publication.translationUpload.updateStatus).parent('label')
      .click();
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
    cy.get(publication.translationReceivedPanel.document).should('have.length', 2);
  });
});
