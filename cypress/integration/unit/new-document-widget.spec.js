/* global context, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />

import utils from '../../selectors/utils.selectors';
import document from '../../selectors/document.selectors';

context('check the functions of the new document widget', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should check pdf replace, word upload, replace and delete', () => {
    const fileName = 'test pdf to replace';
    const agendaKind = 'Ministerraad';
    const agendaPlace = 'Cypress Room';
    const replaceFilename = 'replace';
    const wordExtension = 'docx';
    const pdfExtension = 'pdf';

    const agendaDate = Cypress.dayjs().add(3, 'weeks')
      .day(1);
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
    };
    const files = [file];
    const newVersionfile = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    // setup
    cy.createAgenda(agendaKind, agendaDate, agendaPlace);
    cy.openAgendaForDate(agendaDate);
    cy.addDocumentsToApprovalItem('Goedkeuring van het verslag', files);
    cy.addNewPieceToApprovalItem('Goedkeuring van het verslag', file.newFileName, newVersionfile);

    // replace pdf
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.documentEdit.sourceFileReplace).click();
    cy.get(document.documentEdit.sourceFileReplacer).within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });
    cy.intercept('DELETE', '/files/**').as('deleteFile1');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@deleteFile1')
      .wait('@patchPieces1');

    // upload word file as derived file
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.documentEdit.derivedFileUploader).within(() => {
      cy.uploadFile(file.folder, file.fileName, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces2');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@patchPieces2');
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `${file.fileName}.${wordExtension}`);

    // upload word file as source file and ensure derived pdf file is generated
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.documentEdit.sourceFileReplace).click();
    cy.get(document.documentEdit.sourceFileReplacer).within(() => {
      cy.uploadFile(file.folder, file.fileName, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces3');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@patchPieces3');
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `${file.fileName}.${pdfExtension}`);

    // replace derived file
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.documentEdit.derivedFileReplace).click();
    cy.get(document.documentEdit.derivedFileReplacer).within(() => {
      cy.uploadFile(file.folder, replaceFilename, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces4');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@patchPieces4');
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `${replaceFilename}.${wordExtension}`);

    // delete derived file
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.documentEdit.derivedFileDelete).click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces5');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@patchPieces4');
    cy.get(document.documentCard.primarySourceCreated).should('not.exist');
  });
});
