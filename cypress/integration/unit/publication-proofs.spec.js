/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import utils from '../../selectors/utils.selectors';

/**
 * @description Translates a month number to a dutch month in lowercase.
 * @name getTranslatedMonth
 * @memberOf Cypress.Chainable#
 * @function
 * @param month {number}  the number of the month to translate (from moment so starts from 0)
 * @returns {string} the month in dutch
 */
function getTranslatedMonth(month) {
  // cy.log('getTranslatedMonth');
  switch (month) {
    case 0:
      return 'januari';
    case 1:
      return 'februari';
    case 2:
      return 'maart';
    case 3:
      return 'april';
    case 4:
      return 'mei';
    case 5:
      return 'juni';
    case 6:
      return 'juli';
    case 7:
      return 'augustus';
    case 8:
      return 'september';
    case 9:
      return 'oktober';
    case 10:
      return 'november';
    case 11:
      return 'december';
    default:
      return '';
  }
}
context('Publications proofs tests', () => {
  const fields = {
    number: 1600,
    shortTitle: 'test vertalingsaanvraag',
  };
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };
  const emptyStateMessage = 'Er zijn nog geen documenten toegevoegd.';
  const newFileName1 = 'test proof filename1';
  const newFileName2 = 'test proof new filename2';
  const newFileName3 = 'test proof extra filename3';
  const numberOfPages = 5;
  const numberOfWords = 1000;
  const numacNumber = 123456;
  const targetEndDate = Cypress.dayjs().add(1, 'weeks');
  const monthDutch = getTranslatedMonth(Cypress.dayjs().month());
  const initialRequestTitle = `Publicatieaanvraag VO-dossier: ${fields.number} - ${fields.shortTitle}`;
  const initialRequestMessage = `Beste,\n\nIn bijlage voor drukproef:\nTitel: undefined\t\nVO-dossier: ${fields.number}\n\nVragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`;
  const extraRequestTitle = `BS-werknr: ${numacNumber} VO-dossier: ${fields.number} – Aanvraag nieuwe drukproef`;
  const extraRequestMessage = `Geachte,\n\nGraag een nieuwe drukproef voor:\nBS-werknummer: ${numacNumber}\nTitel: undefined\t\nVO-dossier: ${fields.number}\n\nVragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`;
  const finalRequestTitle = `Verbeterde drukproef BS-werknr: ${numacNumber} VO-dossier: ${fields.number}`;
  const finalRequestMessage = `Beste,\n\nHierbij de verbeterde drukproef :\n\nBS-werknummer: ${numacNumber}\nVO-dossier: ${fields.number}\n\nDe gewenste datum van publicatie is: ${targetEndDate.format('DD/MM/YYYY')}\t\n\nVragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaand email adres.\t\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`;

  function uploadDocument(file, newFileName, numberOfPages, numberOfWords) {
    cy.get(publication.translationsDocuments.add).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.documentsUpload.name).should('have.value', file.fileName)
      .clear()
      .type(newFileName);
    cy.get(publication.documentsUpload.numberOfPages)
      .type(numberOfPages);
    cy.get(publication.documentsUpload.numberOfWords)
      .type(numberOfWords);
    // cy.get(publication.documentsUpload.proofPrint).parent()
    //   .click();
  }

  function clickCheckboxProof(fileName) {
    cy.get(publication.proofsDocuments.row.documentName).contains(fileName)
      .parent(publication.proofsDocuments.tableRow)
      .find(publication.proofsDocuments.row.checkbox)
      .parent()
      .click();
  }

  function clickCheckboxTranslation(fileName) {
    cy.get(publication.translationsDocuments.row.documentName).contains(fileName)
      .parent(publication.translationsDocuments.tableRow)
      .find(publication.translationsDocuments.row.checkbox)
      .parent()
      .click();
  }

  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it.skip('should create translation docs and request', () => {
    cy.intercept('GET', '/translation-subcases/**').as('getTranslationSubcases');
    cy.createPublication(fields);
    cy.wait('@getTranslationSubcases');
    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.publicationTranslations.documents).click();

    // create all necessary docs for proof
    uploadDocument(file, newFileName1, numberOfPages, numberOfWords);
    cy.get(publication.documentsUpload.proofPrint).parent()
      .click();
    cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('GET', '/pieces**').as('getPieces');
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer');
    cy.wait('@createNewPiece');
    cy.wait('@getPieces');
    uploadDocument(file, newFileName2, numberOfPages, numberOfWords);
    cy.intercept('GET', '/pieces**').as('getPieces2');
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer');
    cy.wait('@createNewPiece');
    cy.wait('@getPieces2');
    uploadDocument(file, newFileName3, numberOfPages, numberOfWords);
    cy.intercept('GET', '/pieces**').as('getPieces3');
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer');
    cy.wait('@createNewPiece');
    cy.wait('@getPieces3');
    cy.wait(5000);

    clickCheckboxTranslation(newFileName2);
    clickCheckboxTranslation(newFileName3);
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.intercept('PATCH', '/translation-subcases/**').as('patchTranslationSubcases');
    cy.intercept('POST', '/request-activities').as('postRequestActivities');
    cy.intercept('POST', '/translation-activities').as('postTranslationActivities');
    cy.intercept('POST', '/emails').as('postEmails');
    cy.intercept('GET', '/request-activities?filter**').as('getRequestActivities');
    cy.get(publication.translationRequest.save).click();
    cy.wait('@patchTranslationSubcases');
    cy.wait('@postRequestActivities');
    cy.wait('@postTranslationActivities');
    cy.wait('@postEmails');
    cy.wait('@getRequestActivities');
  });

  it.skip('should upload proofs docs and make request', () => {
    cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('GET', '/pieces**').as('getPieces');
    cy.intercept('DELETE', '**/pieces/**').as('deletePieces');
    cy.intercept('DELETE', '**/files/**').as('deleteFiles');
    cy.intercept('DELETE', '**/document-containers/**').as('deleteDocumentContainers');

    // go to publication, then proofs, then documents and make checks
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields.number)
      .parent(publication.publicationTableRow.rows)
      .click();
    cy.get(publication.publicationNav.publishpreview).click();
    cy.get(publication.proofsDocuments.newRequest).should('be.disabled');
    cy.get(publication.proofsDocuments.row.documentName).contains(newFileName1)
      .parent(publication.proofsDocuments.tableRow)
      .within(() => {
        cy.get(publication.proofsDocuments.row.options).click();
        cy.get(publication.proofsDocuments.row.delete).click();
      });
    cy.wait('@deletePieces');
    cy.wait('@deleteFiles');
    cy.wait('@deleteDocumentContainers');
    cy.wait('@getPieces');
    cy.wait(1000);
    cy.get(auk.emptyState.message).contains(emptyStateMessage);
    cy.get(publication.proofsStatuspill.notStarted);

    // add source proofs (2)
    cy.get(publication.proofsDocuments.add).click();
    cy.get(publication.proofsDocuments.addSourceProof).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.proofUpload.name).should('have.value', file.fileName)
      .clear();
    cy.get(publication.proofUpload.save).should('be.disabled');
    cy.get(publication.proofUpload.name).type(newFileName1);
    cy.get(publication.proofUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait('@getPieces');
    cy.get(publication.proofsDocuments.add).click();
    cy.get(publication.proofsDocuments.addSourceProof).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.proofUpload.name).should('have.value', file.fileName)
      .clear()
      .type(newFileName2);
    cy.get(publication.proofUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait('@getPieces');
    // add corrected proof
    cy.get(publication.proofsDocuments.add).click();
    cy.get(publication.proofsDocuments.addCorrectedProof).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.proofUpload.name).should('have.value', file.fileName)
      .clear()
      .type(newFileName3);
    cy.get(publication.proofUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait('@getPieces');
    cy.wait(2000);
    cy.get(publication.proofsDocuments.row.documentName).contains(newFileName3)
      .parent(publication.proofsDocuments.tableRow)
      .find(publication.proofsDocuments.row.corrected)
      .find(auk.icon);
    // delete proof
    cy.get(publication.proofsDocuments.row.documentName).contains(newFileName1)
      .parent(publication.proofsDocuments.tableRow)
      .within(() => {
        cy.get(publication.proofsDocuments.row.options).click();
        cy.get(publication.proofsDocuments.row.delete).click();
      });
    cy.get(publication.proofsDocuments.row.documentName).contains(newFileName1)
      .should('not.exist');
    // edit proof
    cy.get(publication.proofsDocuments.row.documentName).contains(newFileName2)
      .parent(publication.proofsDocuments.tableRow)
      .within(() => {
        cy.get(publication.proofsDocuments.row.options).click();
        cy.get(publication.proofsDocuments.row.edit).click();
      });
    cy.get(publication.proofEdit.name).clear();
    cy.get(publication.proofEdit.save).should('be.disabled');
    cy.get(publication.proofEdit.name).type(newFileName1);
    cy.intercept('PATCH', '/pieces/**').as('patchPieces');
    cy.get(publication.proofEdit.save).click();
    cy.wait('@patchPieces');
    cy.wait(1000);

    // new initial request select 1 doc
    clickCheckboxProof(newFileName1);
    cy.get(publication.proofsDocuments.newRequest).click();
    cy.wait(1000);
    cy.get(publication.proofsDocuments.initialRequest).click();
    cy.get(publication.proofRequest.subject).should('have.value', initialRequestTitle);
    cy.get(publication.proofRequest.message).should('have.value', initialRequestMessage);
    cy.get(publication.proofRequest.attachments).children()
      .should('have.length', 1);
    cy.intercept('GET', '/request-activities**').as('getRequestActivities');
    cy.get(publication.proofRequest.save).click();
    cy.wait('@getRequestActivities');

    cy.get(publication.publicationProofs.documents).click();
    cy.get(publication.proofsDocuments.row.documentName).contains(newFileName1)
      .parent(publication.proofsDocuments.tableRow)
      .within(() => {
        cy.get(publication.proofsDocuments.row.options).click();
        cy.get(publication.proofsDocuments.row.delete).should('not.exist');
      });
    cy.get(publication.proofsStatuspill.inProgress);

    // new extra request select 2 doc and numac
    clickCheckboxProof(newFileName1);
    clickCheckboxProof(newFileName3);
    cy.get(publication.sidebar.open).click();
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${numacNumber}{enter}`);
    cy.get(publication.proofsDocuments.newRequest).click();
    cy.wait(1000);
    cy.get(publication.proofsDocuments.extraRequest).click();
    cy.get(publication.proofRequest.subject).should('have.value', extraRequestTitle);
    cy.get(publication.proofRequest.message).should('have.value', extraRequestMessage);
    cy.get(publication.proofRequest.attachments).children()
      .should('have.length', 2);
    cy.get(publication.proofRequest.save).click();
    cy.wait('@getRequestActivities');

    // check if request contains correct information and if upload works
    cy.get(publication.proofsRequests.request.emailSubject).contains(extraRequestTitle)
      .parents(publication.proofsRequests.request.container)
      .within(() => {
        cy.get(auk.accordionPanel.header.title).contains(monthDutch);
        cy.get(publication.proofsRequests.request.upload).should('not.be.disabled')
          .click();
      });
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.proofUpload.name).should('have.value', file.fileName)
      .clear();
    cy.get(publication.proofUpload.save).should('be.disabled');
    cy.get(publication.proofUpload.name).type(newFileName2);
    cy.get(publication.proofUpload.save).click();
    cy.get(publication.proofsRequests.request.emailSubject).contains(extraRequestTitle)
      .parents(publication.proofsRequests.request.container)
      .within(() => {
        cy.get(utils.documentList.item).should('have.length', 3);
        cy.get(utils.documentList.name).contains(newFileName1)
          .parent()
          .find(utils.documentList.fileExtension)
          .contains('PDF');
        cy.get(utils.documentList.name).contains(newFileName2)
          .parent()
          .find(utils.documentList.fileExtension)
          .contains('PDF');
        cy.get(utils.documentList.name).contains(newFileName3)
          .parent()
          .find(utils.documentList.fileExtension)
          .contains('PDF');
        cy.get(utils.documentList.viewDocument);
      });
    cy.get(publication.publicationProofs.documents).click();

    // new finalrequest
    clickCheckboxProof(newFileName1);
    cy.get(publication.sidebar.targetEndDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(targetEndDate);
    cy.get(publication.proofsDocuments.newRequest).click();
    cy.wait(1000);
    cy.get(publication.proofsDocuments.finalRequest).click();
    cy.get(publication.proofRequest.subject).should('have.value', finalRequestTitle);
    cy.get(publication.proofRequest.message).should('have.value', finalRequestMessage);
    cy.get(publication.proofRequest.attachments).children()
      .should('have.length', 1);
    cy.intercept('GET', '/request-activities**').as('getRequestActivities');
    cy.get(publication.proofRequest.save).click();
    cy.wait('@getRequestActivities');

    // check if 'finished' checkbox works
    cy.get(publication.publicationProofs.finished).parent()
      .click();
    cy.get(publication.proofsStatuspill.done);
    cy.get(publication.proofsRequests.request.upload).should('be.disabled');
    cy.get(publication.publicationProofs.documents).click();
    cy.get(publication.proofsDocuments.newRequest).should('be.disabled');
    cy.get(publication.proofsDocuments.add).should('be.disabled');
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields.number)
      .parent()
      .find(publication.publicationTableRow.row.proofsProgressBadge)
      .find(publication.proofsStatuspill.done);
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields.number)
      .parent()
      .click();
    cy.get(publication.publicationNav.publishpreview).click();
    cy.get(publication.publicationProofs.finished).parent()
      .click();
    cy.get(publication.proofsStatuspill.inProgress);
  });
});
