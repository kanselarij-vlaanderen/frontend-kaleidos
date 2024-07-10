/* global context, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
import auk from '../../selectors/auk.selectors';

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
    cy.get(document.documentCard.actions)
      .should('not.be.disabled')
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.editPiece).forceClick();
    cy.get(document.documentEdit.sourceFileReplace).click();
    cy.get(document.documentEdit.sourceFileReplacer).within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });
    cy.intercept('DELETE', '/files/**').as('deleteFile1');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    cy.wait(1000);
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@deleteFile1')
      .wait('@patchPieces1');

    // upload word file as derived file
    cy.get(document.documentCard.actions)
      .should('not.be.disabled')
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.editPiece).forceClick();
    cy.get(document.documentEdit.derivedFileUploader).within(() => {
      cy.uploadFile(file.folder, file.fileName, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces2');
    cy.wait(1000);
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchPieces2');
    // Derived file should link to uploaded word file
    cy.get(document.documentCard.name.value)
      .should('contain', `.${wordExtension}`);
    // Source file should still link to pdf
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `.${pdfExtension}`);
    // .should('contain', `${file.fileName}.${pdfExtension}`);

    // upload word file as source file and ensure derived pdf file is generated
    cy.get(document.documentCard.actions)
      .should('not.be.disabled')
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.editPiece).forceClick();
    cy.get(document.documentEdit.sourceFileReplace).click();
    cy.get(document.documentEdit.sourceFileReplacer).within(() => {
      cy.uploadFile(file.folder, file.fileName, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces3');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchPieces3');
    cy.wait(500); // cypress might be too fast
    // Derived file should be converted pdf file
    // *Note: as of 01/feb/2024, users don't want a new conversion of a docx if a pdf already exists
    // *this is a result of docx files being added to manually generated pdf's.
    // cy.get(document.documentCard.name.value)
    //   .should('contain', `.${pdfExtension}`);
    // *Note: as 20/june/2024, for digital agenda we do want to change the derived when changing the docx.
    // cy.get(document.documentCard.name.value)
    //   .should('contain', `.${wordExtension}`);
    cy.get(document.documentCard.name.value)
      .should('contain', `.${pdfExtension}`);
    // Source file should link to the uploaded word file
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `.${wordExtension}`);
    // .should('contain', `${file.fileName}.${wordExtension}`);

    // replace derived file
    cy.get(document.documentCard.actions)
      .should('not.be.disabled')
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.editPiece).forceClick();
    cy.get(document.documentEdit.derivedFileReplace).click();
    cy.get(document.documentEdit.derivedFileReplacer).within(() => {
      cy.uploadFile(file.folder, replaceFilename, wordExtension);
    });
    cy.intercept('PATCH', '/pieces/**').as('patchPieces4');
    cy.wait(1000);
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchPieces4');
    // Derived file should now be uploaded word file
    cy.get(document.documentCard.name.value)
      .should('contain', `.${wordExtension}`);
    // Source file should still link to the word file
    cy.get(document.documentCard.primarySourceLink).invoke('attr', 'href')
      .should('contain', `.${wordExtension}`);
    // .should('contain', `${file.fileName}.${wordExtension}`);

    // delete derived file
    cy.get(document.documentCard.actions)
      .should('not.be.disabled')
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.editPiece).forceClick();
    cy.get(document.documentEdit.derivedFileDelete).click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces5');
    cy.wait(1000);
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchPieces4');
    cy.get(document.documentCard.primarySourceCreated).should('not.exist');
  });
});
