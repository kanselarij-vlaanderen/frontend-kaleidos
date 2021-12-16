/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
// import dependency from '../../selectors/dependency.selectors';
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
  cy.log('getTranslatedMonth');
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
context('Publications translation tests', () => {
  function uploadDocument(file, newFileName, pages, words) {
    cy.get(publication.translationsDocuments.add).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.documentsUpload.name).should('have.value', file.fileName)
      .clear()
      .type(newFileName);
    cy.get(publication.documentsUpload.pages)
      .type(pages);
    cy.get(publication.documentsUpload.words)
      .type(words);
    // cy.get(publication.documentsUpload.proofPrint).parent()
    //   .click();
  }

  function clickCheckbox(fileName) {
    cy.get(publication.translationsDocuments.row.documentName).contains(fileName)
      .parent(publication.translationsDocuments.tableRow)
      .find(publication.translationsDocuments.row.checkbox)
      .parent()
      .click();
  }

  beforeEach(() => {
    cy.server();
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open a publication, request translation, upload docs and mark as done', () => {
    const fields = {
      number: 1615,
      shortTitle: 'test vertalingsaanvraag',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const emptyStateMessage = 'Er zijn nog geen vertalingen.';
    const newFileName1 = 'test filename1';
    const newFileName2 = 'test new filename2';
    const newFileName3 = 'test for new filename3';
    const pageCount = 5;
    const editedPageCount = 6;
    const wordCount = 1000;
    const editedWordcount = 1001;
    const translationDueDate = Cypress.moment();
    const editedTranslationDueDate = Cypress.moment().add(1, 'weeks');
    const monthDutch = getTranslatedMonth(translationDueDate.month());

    cy.route('GET', '/translation-subcases/**').as('getTranslationSubcases');
    cy.createPublication(fields);
    cy.wait('@getTranslationSubcases');
    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.publicationTranslations.documents).click();
    cy.get(auk.emptyState.message).contains(emptyStateMessage);
    cy.get(publication.translationStatuspill.notStarted);
    cy.get(publication.translationsDocuments.requestTranslation).should('be.disabled');

    // check rollback after cancel
    uploadDocument(file, newFileName1, pageCount, wordCount);
    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.get(auk.modal.footer.cancel).click();
    cy.wait('@deleteFile');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(auk.emptyState.message).contains(emptyStateMessage);
    cy.get(publication.translationsDocuments.add).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.documentsUpload.name).should('have.value', file.fileName)
      .clear()
      .type(newFileName1);
    cy.get(publication.documentsUpload.pages).should('be.empty')
      .type(5);
    cy.get(publication.documentsUpload.words).should('be.empty')
      .type(1000);
    cy.get(publication.documentsUpload.proofPrint).should('be.empty');
    cy.route('POST', 'document-containers').as('createNewDocumentContainer');
    cy.route('POST', 'pieces').as('createNewPiece');
    cy.route('GET', '/pieces?filter**').as('getPieces');
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait('@getPieces');

    // add extra docs for testing CRUD
    // waiting for getPieces should work, but waiting for it fails so general wait instead
    uploadDocument(file, newFileName2, pageCount, wordCount);
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait(1000);
    uploadDocument(file, newFileName3, pageCount, wordCount);
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait(1000);

    // check if request functions correctly with none, some and all rows checked
    cy.get(publication.translationsDocuments.tableRow).should('have.length', 3);
    cy.get(publication.translationsDocuments.requestTranslation).should('be.disabled');
    clickCheckbox(newFileName1);
    clickCheckbox(newFileName2);
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(utils.documentList.item).should('have.length', 2);
    cy.get(auk.modal.footer.cancel).click();
    clickCheckbox(newFileName3);
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(utils.documentList.item).should('have.length', 3);
    cy.get(auk.modal.footer.cancel).click();

    // check delete and edit functions and rollback
    cy.route('DELETE', 'document-containers/**').as('deleteDocumentContainer');
    cy.route('DELETE', 'pieces/**').as('deletePiece');
    cy.get(publication.translationsDocuments.row.documentName).contains(newFileName1)
      .parent(publication.translationsDocuments.tableRow)
      .within(() => {
        cy.get(publication.translationsDocuments.row.options).click();
        cy.get(publication.translationsDocuments.row.delete).click()
          .wait('@deletePiece')
          .wait('@deleteDocumentContainer');
      });
    cy.get(publication.translationsDocuments.tableRow).should('have.length', 2);
    cy.get(publication.translationsDocuments.row.documentName).contains(newFileName2)
      .parent(publication.translationsDocuments.tableRow)
      .within(() => {
        cy.get(publication.translationsDocuments.row.options).click();
        cy.get(publication.translationsDocuments.row.edit).click();
      });
    cy.get(publication.documentEdit.documentName).should('have.value', newFileName2)
      .click()
      .clear()
      .type(newFileName1);
    cy.get(publication.documentEdit.pages).should('have.value', pageCount)
      .click()
      .clear()
      .type(editedPageCount);
    cy.get(publication.documentEdit.words).should('have.value', wordCount)
      .click()
      .clear()
      .type(editedWordcount);
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.translationsDocuments.row.documentName).contains(newFileName2)
      .parent(publication.translationsDocuments.tableRow)
      .within(() => {
        cy.get(publication.translationsDocuments.row.options).click();
        cy.get(publication.translationsDocuments.row.edit).click();
      });
    cy.get(publication.documentEdit.documentName).should('have.value', newFileName2)
      .clear()
      .type(newFileName1);
    cy.get(publication.documentEdit.pages).should('have.value', pageCount)
      .clear()
      .type(editedPageCount);
    cy.get(publication.documentEdit.words).should('have.value', wordCount)
      .clear()
      .type(editedWordcount);
    cy.route('PATCH', 'pieces/**').as('patchPieces');
    cy.get(publication.documentEdit.save).click();
    cy.wait('@patchPieces');
    cy.wait(2000);
    // verify changes made with edit
    cy.get(publication.translationsDocuments.row.documentName).contains(newFileName1)
      .parent(publication.translationsDocuments.tableRow)
      .within(() => {
        cy.get(publication.translationsDocuments.row.options).click();
        cy.get(publication.translationsDocuments.row.edit).click();
      });
    cy.get(publication.documentEdit.documentName).should('have.value', newFileName1);
    cy.get(publication.documentEdit.pages).should('have.value', editedPageCount);
    cy.get(publication.documentEdit.words).should('have.value', editedWordcount);
    cy.get(auk.modal.footer.cancel).click();

    // check requestmodal without sidebar change and 1 document selected
    clickCheckbox(newFileName1);
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(auk.datepicker).should('have.value', translationDueDate.format('DD-MM-YYYY'));
    cy.get(publication.translationRequest.message).should('have.value', `Collega,\n\nHierbij ter vertaling:\n\nVO-dossier: ${fields.number}\nTitel: test vertalingsaanvraag\t\nUiterste vertaaldatum: ${translationDueDate.format('DD-MM-YYYY')}\t\nAantal pagina’s: ${editedPageCount}\t\nAantal woorden: ${editedWordcount}\t\nAantal documenten: 1\t\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
    cy.get(utils.documentList.item).should('have.length', 1);
    cy.get(auk.modal.footer.cancel).click();
    // check requestmodal with sidebar change and 2 documents selected
    clickCheckbox(newFileName3);
    cy.get(publication.sidebar.open).click();
    cy.get(publication.sidebar.translationDueDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(editedTranslationDueDate);
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(auk.datepicker).should('have.value', editedTranslationDueDate.format('DD-MM-YYYY'));
    cy.get(publication.translationRequest.message).should('have.value', `Collega,\n\nHierbij ter vertaling:\n\nVO-dossier: ${fields.number}\nTitel: test vertalingsaanvraag\t\nUiterste vertaaldatum: ${editedTranslationDueDate.format('DD-MM-YYYY')}\t\nAantal pagina’s: ${pageCount + editedPageCount}\t\nAantal woorden: ${wordCount + editedWordcount}\t\nAantal documenten: 2\t\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
    // check annex list
    cy.get(utils.documentList.item).should('have.length', 2);
    cy.get(utils.documentList.name).contains(newFileName1)
      .parent()
      .find(utils.documentList.fileExtension)
      .contains('PDF');
    cy.get(utils.documentList.name).contains(newFileName3)
      .parent()
      .find(utils.documentList.fileExtension)
      .contains('PDF');
    cy.get(utils.documentList.viewDocument);// .invoke('removeAttr', 'target')
    //   .eq(0)
    //   .click();
    // cy.url().should('contain', '/document_2/');
    // cy.go('back');
    cy.route('PATCH', '/translation-subcases/**').as('patchTranslationSubcases');
    cy.route('POST', '/request-activities').as('postRequestActivities');
    cy.route('POST', '/translation-activities').as('postTranslationActivities');
    cy.route('POST', '/emails').as('postEmails');
    cy.route('GET', '/request-activities?filter**').as('getRequestActivities');
    cy.get(publication.translationRequest.save).click();
    cy.wait('@patchTranslationSubcases');
    cy.wait('@postRequestActivities');
    cy.wait('@postTranslationActivities');
    cy.wait('@postEmails')
      .wait('@getRequestActivities');
    cy.get(publication.translationStatuspill.inProgress);

    // check if request contains correct information and if upload works
    cy.get(auk.accordionPanel.header.title).contains(monthDutch);
    cy.get(publication.translationsRequests.request.upload).should('not.be.disabled')
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.translationUpload.name).should('have.value', file.fileName)
      .clear();
    cy.get(publication.translationUpload.save).should('be.disabled');
    cy.get(publication.translationUpload.name).type(newFileName2);
    cy.get(publication.translationUpload.save).click();
    cy.get(publication.translationsRequests.request.dueDate).contains(editedTranslationDueDate.format('DD-MM-YYYY'));
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
    // .should(($a) => {
    //   const href = $a.attr('href');
    //   const attr = $a.attr('target');

    //   expect(href).to.include(/document/);
    //   expect(attr).to.include('_blank');
    // });

    // check if 'finished' checkbox works
    cy.get(publication.publicationTranslations.finished).parent()
      .click();
    cy.get(publication.translationStatuspill.done);
    cy.get(publication.translationsRequests.request.upload).should('be.disabled');
    cy.get(publication.publicationTranslations.documents).click();
    cy.get(publication.translationsDocuments.requestTranslation).should('be.disabled');
    cy.get(publication.translationsDocuments.add).should('be.disabled');
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.number).contains(fields.number)
      .parent()
      .find(publication.publicationTableRow.row.translationProgressBadge)
      .find(publication.translationStatuspill.done);
    cy.get(publication.publicationTableRow.row.number).contains(fields.number)
      .parent()
      .click();
    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.publicationTranslations.finished).parent()
      .click();
    cy.get(publication.translationStatuspill.inProgress);
  });
});
