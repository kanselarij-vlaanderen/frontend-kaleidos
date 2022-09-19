/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import utils from '../../selectors/utils.selectors';

context('Publications proofs tests', () => {
  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open a publication, request translation and check CRUD', () => {
    const fields = {
      number: 1600,
      shortTitle: 'test drukproefaanvraag',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const numberOfPages = 5;
    const numberOfWords = 1000;
    const translationEndDate = Cypress.dayjs();
    const editedProofEndDate = translationEndDate.add(6, 'day');
    const corrector = 'Bob Bobson';
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('getTranslationsModel');

    cy.createPublication(fields);
    cy.get(publication.publicationNav.translations).click()
      .wait('@getTranslationsModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/vertalingen');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Opgestart');

    // new request
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
    // upload translation
    cy.get(publication.translationsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/translation-activities/*').as('patchTranslationActivities');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/translation-activities?filter**subcase**').as('reloadTranslationModel');
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.get(publication.translationUpload.save).click()
      .wait('@patchTranslationActivities')
      .wait('@getPieces')
      .wait('@reloadTranslationModel');

    // check rollback after cancel request
    cy.get(publication.publicationNav.proofs).click();
    cy.get(publication.proofsIndex.newRequest).click();
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 2);
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 3);
    cy.get(publication.proofRequest.message).scrollIntoView()
      .should('have.value', `Beste,\n\nIn bijlage voor drukproef:\nTitel: test drukproefaanvraag\t\nVO-dossier: ${fields.number}\n\nVragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand emailadres.\t\n\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(auk.modal.footer.cancel).click();
    // these p
    cy.wait('@deleteFile');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(publication.proofsIndex.panelBody).find(auk.emptyState.message);

    // new request to delete
    cy.get(publication.proofsIndex.newRequest).click();
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 2);
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 3);
    // uncheck the status update that is checked by default
    cy.get(publication.proofRequest.updateStatus).parent('label')
      .click();
    cy.intercept('POST', '/proofing-activities').as('postProofingActivities');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('reloadProofModel');
    cy.get(publication.proofRequest.save).click()
      .wait('@postProofingActivities')
      .wait('@getPieces')
      .wait('@reloadProofModel');
    cy.get(auk.modal.container).should('not.exist');
    // default status updates by request and receiving translations
    cy.get(publication.statusPill.contentLabel).should('contain', 'Vertaling in');
    cy.get(publication.requestActivityPanel.message)
      .contains(`VO-dossier: ${fields.number}`);
    // check delete
    cy.get(publication.requestActivityPanel.dropdown).click();
    cy.get(publication.requestActivityPanel.delete).click();
    cy.intercept('DELETE', '/proofing-activities/*').as('deleteProofing');
    cy.intercept('DELETE', '/emails/*').as('deleteEmails');
    cy.intercept('DELETE', '/files/*').as('deleteFiles');
    cy.intercept('DELETE', '/document-containers/*').as('deleteDocumentContainers');
    cy.intercept('DELETE', '/request-activities/*').as('deleteRequestActivities');
    cy.get(utils.alertDialog.confirm).click()
      .wait('@deleteProofing')
      .wait('@deleteEmails')
      .wait('@deleteFiles')
      .wait('@deleteDocumentContainers')
      .wait('@deleteRequestActivities');
    cy.get(publication.proofsIndex.panelBody).find(auk.emptyState.message);

    // new request
    cy.get(publication.proofsIndex.newRequest).click();
    // check if correct number of files is already present
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 2);
    // check update status
    cy.get(publication.proofRequest.updateStatus).should('be.checked'); // default checked
    cy.intercept('POST', '/proofing-activities').as('postProofingActivities');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('reloadProofModel');
    cy.get(publication.proofRequest.save).click()
      .wait('@postProofingActivities')
      .wait('@getPieces')
      .wait('@reloadProofModel');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Drukproef aangevraagd');
    cy.get(publication.requestActivityPanel.message)
      .contains(`VO-dossier: ${fields.number}`);

    // upload translation
    cy.get(publication.proofsIndex.upload).click();
    cy.get(publication.proofUpload.save).should('be.disabled');
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/proofing-activities/*').as('patchProofingActivities');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('reloadProofingModel');
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 1);
    // uncheck the status update that is checked by default
    cy.get(publication.proofUpload.updateStatus).parent('label')
      .click();
    cy.get(publication.proofUpload.save).click()
      .wait('@patchProofingActivities')
      .wait('@getPieces')
      .wait('@reloadProofingModel')
      .wait(500);
    cy.get(publication.statusPill.contentLabel).should('contain', 'Drukproef aangevraagd');
    // check edit and rollback
    cy.get(publication.proofReceivedPanel.endDate).contains(translationEndDate.format('DD-MM-YYYY'));
    // TODO flaky dropdown opening: Attempted to access the computed <frontend-kaleidos@component:attach-popover::ember486>._hideOn on a destroyed object, which is not allowed
    cy.wait(1000);
    cy.get(publication.proofReceivedPanel.dropdown).click();
    cy.get(publication.proofReceivedPanel.edit).click();
    cy.get(auk.datepicker).click();
    cy.setDateInFlatpickr(editedProofEndDate);
    cy.get(publication.proofReceivedPanel.corrector).click()
      .type(corrector);
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.proofInfoPanel.view.corrector).contains('-');
    cy.get(publication.proofReceivedPanel.endDate).contains(translationEndDate.format('DD-MM-YYYY'));
    // save
    cy.get(publication.proofReceivedPanel.dropdown).click();
    cy.get(publication.proofReceivedPanel.edit).click();
    cy.get(auk.datepicker).click();
    cy.setDateInFlatpickr(editedProofEndDate);
    cy.get(publication.proofReceivedPanel.corrector).click()
      .type(corrector);
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('reloadProofingModel2');
    cy.get(publication.proofReceivedPanel.save).click()
      .wait('@reloadProofingModel2');
    cy.get(publication.proofInfoPanel.view.corrector).contains(corrector);
    cy.get(publication.proofReceivedPanel.endDate).contains(editedProofEndDate.format('DD-MM-YYYY'));

    //  upload second translation and update status
    cy.get(publication.proofsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.get(publication.proofUpload.updateStatus).should('be.checked'); // default checked
    cy.intercept('PATCH', '/proofing-activities/*').as('patchProofingActivities2');
    cy.intercept('PATCH', '/publication-subcases/*').as('patchPublicationSubcases');
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlows');
    cy.intercept('POST', '/publication-status-changes').as('postPublicationStatusChanges');
    // these calls happen in a random order because of promises
    cy.get(publication.proofUpload.save).click()
      .wait('@patchProofingActivities2')
      .wait('@patchPublicationSubcases')
      .wait('@getPieces')
      .wait('@patchPublicationFlows')
      .wait('@postPublicationStatusChanges');
    cy.get(publication.statusPill.contentLabel).should('contain', 'Proef in');
    cy.get(publication.proofReceivedPanel.panel).find(publication.documentsList.piece)
      .should('have.length', 2);
  });

  it('should open a publication, upload proof without request, then request proof and check history', () => {
    const fields = {
      number: 1661,
      shortTitle: 'test drukproefaanvraag',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('getProofingModel');

    cy.createPublication(fields);
    cy.get(publication.publicationNav.proofs).click()
      .wait('@getProofingModel');
    // Make sure the page transitioned
    cy.url().should('contain', '/drukproeven');

    // upload proof without request
    cy.get(publication.proofsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('GET', '/pieces/**').as('getPieces');
    cy.intercept('GET', '/proofing-activities?filter**subcase**').as('reloadProofingModel');
    cy.get(publication.proofUpload.save).click()
      .wait('@getPieces')
      .wait('@reloadProofingModel');
    cy.get(publication.proofReceivedPanel.panel).should('have.length', 1);

    // request proof
    cy.get(publication.proofsIndex.newRequest).click();
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.wait('@createNewPiece');
    cy.get(auk.modal.container).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.intercept('POST', 'proofing-activities').as('createRequestActivity');
    cy.intercept('POST', 'emails').as('createEmail');
    cy.intercept('GET', 'request-activities/**/proofing-activity').as('getProofingsActivity');
    cy.get(publication.proofRequest.save).click();
    cy.wait('@createRequestActivity')
      .wait('@createEmail')
      .wait('@getProofingsActivity');

    // check history
    cy.get(publication.proofsIndex.panelBody).children()
      .as('panels');
    cy.get('@panels').should('have.length', 2);
    cy.get('@panels').eq(0)
      .contains('Aanvraag verzonden');
    cy.get('@panels').eq(1)
      .find(publication.proofReceivedPanel.panel)
      .contains('Drukproef ontvangen');
  });

  it('should start a proofrequest from a translation', () => {
    const fields = {
      number: 1662,
      shortTitle: 'test drukproefaanvraag via vertaling',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    // setup
    cy.createPublication(fields);
    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.translationsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/translation-subcases/**').as('patchtranslationSubcase');
    cy.get(publication.translationUpload.save).click()
      .wait('@patchtranslationSubcase');

    // open upload modal via received translation
    cy.get(publication.translationReceivedPanel.dropdown).click();
    cy.get(publication.translationReceivedPanel.proofRequest).click();

    // check data
    cy.get(auk.modal.header.title).contains(`Drukproef aanvragen voor publicatie ${fields.number}`);
    cy.get(publication.proofRequest.subject).contains(`Drukproefaanvraag VO-dossier: ${fields.number} - ${fields.shortTitle}`);
  });
});
