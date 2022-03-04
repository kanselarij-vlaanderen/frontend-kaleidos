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

  function clickCheckbox(fileName) {
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

  it.skip('should open a publication, request translation, upload docs and mark as done', () => {
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
    const numberOfPages = 5;
    const editednumberOfPages = 6;
    const numberOfWords = 1000;
    const editednumberOfWords = 1001;
    const translationDueDate = Cypress.dayjs();
    const editedTranslationDueDate = Cypress.dayjs().add(1, 'weeks');
    const monthDutch = getTranslatedMonth(translationDueDate.month());

    cy.createPublication(fields);
    cy.get(publication.publicationNav.translations).click();
    // cy.get(publication.publicationTranslations.documents).click();
    // cy.get(auk.emptyState.message).contains(emptyStateMessage);
    // cy.get(publication.translationStatuspill.notStarted);
    cy.get(publication.translationsDocuments.requestTranslation).should('be.disabled');

    // check rollback after cancel
    uploadDocument(file, newFileName1, numberOfPages, numberOfWords);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(auk.modal.footer.cancel).click();
    cy.wait('@deleteFile');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(auk.emptyState.message).contains(emptyStateMessage);
    cy.get(publication.translationsDocuments.add).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.get(publication.documentsUpload.name).should('have.value', file.fileName)
      .clear()
      .type(newFileName1);
    cy.get(publication.documentsUpload.numberOfPages).should('be.empty')
      .type(5);
    cy.get(publication.documentsUpload.numberOfWords).should('be.empty')
      .type(1000);
    cy.get(publication.documentsUpload.proofPrint).should('be.empty');
    cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('GET', '/pieces?filter**').as('getPieces');
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait('@getPieces');

    // add extra docs for testing CRUD
    // waiting for getPieces should work, but waiting for it fails so general wait instead
    uploadDocument(file, newFileName2, numberOfPages, numberOfWords);
    cy.get(publication.documentsUpload.save).click();
    cy.wait('@createNewDocumentContainer')
      .wait('@createNewPiece')
      .wait(1000);
    uploadDocument(file, newFileName3, numberOfPages, numberOfWords);
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
    cy.intercept('DELETE', 'document-containers/**').as('deleteDocumentContainer');
    cy.intercept('DELETE', 'pieces/**').as('deletePiece');
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
    cy.get(publication.documentEdit.numberOfPages).should('have.value', numberOfPages)
      .click()
      .clear()
      .type(editednumberOfPages);
    cy.get(publication.documentEdit.words).should('have.value', numberOfWords)
      .click()
      .clear()
      .type(editednumberOfWords);
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
    cy.get(publication.documentEdit.numberOfPages).should('have.value', numberOfPages)
      .clear()
      .type(editednumberOfPages);
    cy.get(publication.documentEdit.words).should('have.value', numberOfWords)
      .clear()
      .type(editednumberOfWords);
    cy.intercept('PATCH', 'pieces/**').as('patchPieces');
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
    cy.get(publication.documentEdit.numberOfPages).should('have.value', editednumberOfPages);
    cy.get(publication.documentEdit.numberOfWords).should('have.value', editednumberOfWords);
    cy.get(auk.modal.footer.cancel).click();

    // check requestmodal without sidebar change and 1 document selected
    clickCheckbox(newFileName1);
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(auk.datepicker).should('have.value', translationDueDate.format('DD-MM-YYYY'));
    cy.get(publication.translationRequest.message).should('have.value', `Collega,\n\nHierbij ter vertaling:\n\nVO-dossier: ${fields.number}\nTitel: test vertalingsaanvraag\t\nUiterste vertaaldatum: ${translationDueDate.format('DD-MM-YYYY')}\t\nAantal pagina’s: ${editednumberOfPages}\t\nAantal woorden: ${editednumberOfWords}\t\nAantal documenten: 1\t\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
    cy.get(utils.documentList.item).should('have.length', 1);
    cy.get(auk.modal.footer.cancel).click();
    // check requestmodal with target end change and 2 documents selected
    cy.get(publication.publicationNav.activities).click();
    cy.get(publication.publicationsInfoPanel.edit).click();
    cy.get(publication.publicationsInfoPanel.targetEndDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(editedTranslationDueDate);
    cy.intercept('PATCH', '/publication-subcases/**').as('patchSubcase');
    cy.get(publication.publicationsInfoPanel.save).click();
    cy.wait('@patchSubcase');
    cy.get(publication.publicationNav.translations).click();
    clickCheckbox(newFileName3);
    cy.get(publication.translationsDocuments.requestTranslation).click();
    cy.get(auk.datepicker).should('have.value', editedTranslationDueDate.format('DD-MM-YYYY'));
    cy.get(publication.translationRequest.message).should('have.value', `Collega,\n\nHierbij ter vertaling:\n\nVO-dossier: ${fields.number}\nTitel: test vertalingsaanvraag\t\nUiterste vertaaldatum: ${editedTranslationDueDate.format('DD-MM-YYYY')}\t\nAantal pagina’s: ${numberOfPages + editednumberOfPages}\t\nAantal woorden: ${numberOfWords + editednumberOfWords}\t\nAantal documenten: 2\t\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n`);
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
    cy.intercept('PATCH', '/translation-subcases/**').as('patchTranslationSubcases');
    cy.intercept('POST', '/request-activities').as('postRequestActivities');
    cy.intercept('POST', '/translation-activities').as('postTranslationActivities');
    cy.intercept('POST', '/emails').as('postEmails');
    cy.intercept('GET', '/request-activities?filter**').as('getRequestActivities');
    cy.get(publication.translationRequest.save).click();
    cy.wait('@patchTranslationSubcases');
    cy.wait('@postRequestActivities');
    cy.wait('@postTranslationActivities');
    cy.wait('@postEmails')
      .wait('@getRequestActivities');

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
  });
});
