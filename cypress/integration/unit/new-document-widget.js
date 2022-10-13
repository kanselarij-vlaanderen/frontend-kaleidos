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

  it.only('should check pdf replace, word upload, replace and delete', () => {
    const fileName = 'test pdf to replace';
    const agendaKind = 'Ministerraad';
    const agendaPlace = 'Cypress Room';
    const replaceFilename = 'replace';
    const wordExtension = 'docx';

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
    cy.get(document.edit.replace).click();
    cy.get(document.edit.pdfFileUploader).within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });
    cy.intercept('DELETE', '/files/**').as('deleteFile1');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@deleteFile1')
      .wait('@patchPieces1');

    // upload wordFile
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.edit.sourceFileUploader).within(() => {
      cy.uploadFile(file.folder, file.fileName, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces2');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@patchPieces2');
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `${file.fileName}.${wordExtension}`);

    // replace wordFile
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.edit.sourceFileReplace).click();
    cy.get(document.edit.sourceFileReplacer).within(() => {
      cy.uploadFile(file.folder, replaceFilename, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces3');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@patchPieces3');
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `${replaceFilename}.${wordExtension}`);

    // delete wordFile
    cy.get(document.documentCard.actions).should('not.be.disabled')
      .click();
    cy.get(document.documentCard.editPiece).click();
    cy.get(document.edit.sourceFileDelete).click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces4');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@patchPieces4');
    cy.get(document.documentCard.primarySourceCreated).should('not.exist');
  });
});
