/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import publication from '../../selectors/publication.selectors';
import utils from '../../selectors/utils.selectors';

context('Publications translation tests', () => {
  beforeEach(() => {
    cy.login('OVRB');
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
    const formattedTranslationEndDate = translationEndDate.format('DD-MM-YYYY');
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
    cy.get(auk.datepicker.datepicker).click();
    // TODO-publication get datepicker in specific modal or in div
    cy.setDateInFlatpickr(translationEndDate);
    cy.get(publication.translationRequest.numberOfPages).should('be.empty')
      .type(numberOfPages);
    cy.get(publication.translationRequest.numberOfWords).should('be.empty')
      .type(numberOfWords);
    // after updating pages and words, the text of the message updates, but cypress is faster then the update
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(publication.translationRequest.message).should('have.value', `Collega,\n\nHierbij ter vertaling:\nVO-dossier: ${fields.number}\n\nTitel: test vertalingsaanvraag\t\n\nUiterste vertaaldatum: ${translationEndDate.format('DD-MM-YYYY')}\t\n\nAantal pagina’s: ${numberOfPages}\t\nAantal woorden: ${numberOfWords}\t\nAantal documenten: 1\t\n\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(auk.modal.footer.cancel).click();
    cy.wait('@deleteFile');
    cy.get(publication.translationsInfoPanel.dueDate).contains('-');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(publication.translationsIndex.panelBody).find(auk.emptyState.message);

    // new request to delete
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.get(auk.datepicker.datepicker).click();
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
    cy.get(publication.translationsInfoPanel.dueDate).contains(formattedTranslationEndDate);
    cy.get(publication.requestActivityPanel.message)
      .contains(`VO-dossier: ${fields.number}`)
      .contains(`Uiterste vertaaldatum: ${translationEndDate.format('DD-MM-YYYY')}`)
      .contains(`Aantal pagina’s: ${numberOfPages}`)
      .contains(`Aantal woorden: ${numberOfWords}`);
    // check delete
    cy.get(publication.requestActivityPanel.dropdown)
      .children(appuniversum.button)
      .click();
    cy.get(publication.requestActivityPanel.delete).forceClick();
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
    cy.get(publication.translationsInfoPanel.dueDate).contains(formattedTranslationEndDate);
    cy.get(publication.translationsIndex.panelBody).find(auk.emptyState.message);

    // new request
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(publication.translationRequest.save).should('be.disabled');
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.datepicker.datepicker).click();
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
    cy.get(publication.translationReceivedPanel.endDate).contains(translationEndDate.format('DD-MM-YYYY'));
    cy.get(publication.translationReceivedPanel.dropdown)
      .children(appuniversum.button)
      .click();
    cy.get(publication.translationReceivedPanel.edit).forceClick();
    cy.get(auk.datepicker.datepicker).click();
    cy.setDateInFlatpickr(editedTranslationEndDate);
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.translationReceivedPanel.endDate).contains(translationEndDate.format('DD-MM-YYYY'));
    cy.get(publication.translationReceivedPanel.dropdown)
      .children(appuniversum.button)
      .click();
    cy.get(publication.translationReceivedPanel.edit).forceClick();
    cy.get(auk.datepicker.datepicker).click();
    cy.setDateInFlatpickr(editedTranslationEndDate);
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('reloadTranslationModel2');
    cy.get(publication.translationActivityEdit.save).click()
      .wait('@reloadTranslationModel2');
    cy.get(publication.translationReceivedPanel.endDate).contains(editedTranslationEndDate.format('DD-MM-YYYY'));
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

  it('should open a publication, upload translation without request, then request translation and check history', () => {
    const fields = {
      number: 1616,
      shortTitle: 'test vertalingsaanvraag',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const translationEndDate = Cypress.dayjs();
    // const translationDueDate = Cypress.dayjs().add('days', 1);
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('getTranslationsModel');

    cy.createPublication(fields);
    cy.get(publication.publicationNav.translations).click()
      .wait('@getTranslationsModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/vertalingen');

    // upload translation without request
    cy.get(publication.translationsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/translation-subcases/*').as('patchTranslationSubcases');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlows');
    cy.intercept('POST', '/publication-status-changes').as('postPublicationStatusChanges');
    // these calls happen in a random order because of promises
    cy.get(publication.translationUpload.save).click()
      .wait('@patchTranslationSubcases')
      .wait('@getPieces')
      .wait('@patchPublicationFlows')
      .wait('@postPublicationStatusChanges');
    cy.get(publication.translationReceivedPanel.panel).should('have.length', 1);

    // request translation
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(auk.datepicker.datepicker).click();
    cy.setDateInFlatpickr(translationEndDate);
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

    // check history
    cy.get(publication.translationsIndex.panelBody).children()
      .as('panels');
    cy.get('@panels').should('have.length', 2);
    cy.get('@panels').eq(0)
      // TODO can't put selector on accordion panel, is this good enough?
      // .find(publication.requestActivityPanel.panel)
      .contains('Aanvraag verzonden');
    cy.get('@panels').eq(1)
      .find(publication.translationReceivedPanel.panel)
      .contains('Vertaling ontvangen');
  });

  it('should set duedate, check expiration warning then check if duedate is prefilled in uploadmodal', () => {
    const lateDueDate = Cypress.dayjs().subtract(5, 'days');
    const formattedLateDueDate = lateDueDate.format('DD-MM-YYYY');

    cy.visit('/publicaties/626FBC3BCB00108193DC4361/vertalingen');

    // set duedate
    cy.get(publication.translationsInfoPanel.edit).click();
    cy.get(publication.translationsInfoPanel.editView.dueDate).find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(lateDueDate);
    cy.get(publication.translationsInfoPanel.save).click();
    // check if warning shows and autofill happens
    cy.get(auk.formHelpText).contains('Datum verstreken');
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(auk.datepicker.datepicker).should('have.value', formattedLateDueDate);
    cy.get(auk.modal.footer.cancel).click();

    // remove duedate
    cy.get(publication.translationsInfoPanel.edit).click();
    cy.get(publication.translationsInfoPanel.editView.dueDate).find(auk.datepicker.datepicker)
      .click()
      .clear()
      .type('{enter}');
    cy.get(publication.translationsInfoPanel.save).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(auk.formHelpText).should('not.exist');
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(auk.datepicker.datepicker).should('have.value', '');
  });
});
