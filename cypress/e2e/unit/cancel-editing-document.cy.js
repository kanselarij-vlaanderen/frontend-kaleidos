/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';

function uploadFileToCancel(file) {
  cy.get(document.documentCard.name.value).contains(file.fileName)
    .parents(document.documentCard.card)
    .within(() => {
      cy.get(document.documentCard.actions)
        .should('not.be.disabled')
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece).forceClick();
    });
  cy.get(auk.auModal.container).within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.vlUploadedDocument.filename).should('contain', file.fileName);
  });
}

function openAgendaitemDocumentBatchEdit() {
  cy.intercept('GET', '/concepts?**').as('getConcepts');
  cy.get(route.agendaitemDocuments.batchEdit).click();
  cy.wait('@getConcepts');
}

context('Tests for cancelling CRUD operations on document and pieces', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Editing of a document or piece but cancelling should show old data', () => {
    // const agendaDate = Cypress.dayjs('2022-04-12');
    const subcaseTitleShort = 'Cypress test: cancel editing - agendaitem pieces - short title - 1652689020';
    const fileName = 'test pdf';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
    };

    // *Setup of this test:
    // Designagenda A with 1 proposed subcase with 1 document uploaded

    cy.visitAgendaWithLink('/vergadering/628208B47D8287D7ED094CE9/agenda/628208B57D8287D7ED094CEA/agendapunten/628208DB7D8287D7ED094CF0/documenten');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(file.newFileName);

    cy.addNewPieceToAgendaitem(subcaseTitleShort, file.newFileName, file);

    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}BIS`);
    // TODO-access-level verification of access-level no longer in history
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();
    // cy.get(document.vlDocument.piece).as('pieces');
    // cy.get('@pieces').each(() => {
    //   cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    // });
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();

    // Cancel/save of document-type and access-level in editing view
    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.type)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Decreet')
      .click();
    cy.get(document.documentDetailsRow.type).contains('Decreet');

    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.accessLevel)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .scrollIntoView()
      .click();
    cy.get(document.documentDetailsRow.accessLevel).contains('Publiek');
    cy.get(auk.modal.footer.cancel).click();

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // Verify nothing changed after cancel
    // TODO-access-level verification of access-level no longer in history
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();
    // cy.get(document.vlDocument.piece).as('pieces');
    // cy.get('@pieces').each(() => {
    //   cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    // });
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();

    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.type)
      .contains('Nota');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.accessLevel)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .scrollIntoView()
      .click();
    cy.get(document.batchDocumentsDetails.save).click();

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // Verify only 1 piece is affected by change
    // TODO-access-level verification of access-level no longer in history
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();
    // cy.get(document.vlDocument.piece).as('pieces');
    // cy.get('@pieces').eq(0)
    //   .find(document.accessLevelPill.pill)
    //   .contains('Intern Overheid');
    // cy.get('@pieces').eq(1)
    //   .find(document.accessLevelPill.pill)
    //   .contains('Intern Regering');
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();

    // Cancel/save name in document card
    const extraName = (' - Nota');
    const savedName = `${fileName}BIS${extraName}`;
    cy.intercept('PATCH', '/pieces/**').as('patchPieces');

    cy.get(document.documentCard.name.value).contains(fileName);
    cy.get(document.documentCard.actions)
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.editPiece).forceClick();
    cy.get(document.documentEdit.nameInput).type(extraName);
    cy.get(auk.confirmationModal.footer.cancel).click();
    // assert old value is back
    cy.get(document.documentCard.name.value).contains(fileName);
    cy.get(document.documentCard.actions)
      .children(appuniversum.button)
      .click();
    cy.get(document.documentCard.editPiece).forceClick();
    cy.get(document.documentEdit.nameInput).type(extraName);
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@patchPieces');
    // assert new value is set
    cy.get(document.documentCard.name.value)
      .contains(savedName);

    // Verify only 1 piece is affected by change
    // TODO-access-level verification of access-level no longer in history
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();
    // cy.get(document.vlDocument.piece).as('pieces');
    // cy.get('@pieces').eq(0)
    //   .find(document.accessLevelPill.pill)
    //   .contains('Intern Overheid');
    // cy.get('@pieces').eq(1)
    //   .find(document.accessLevelPill.pill)
    //   .contains('Intern Regering');
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();

    // Cancel/save access-level in document card
    cy.get(document.accessLevelPill.pill).contains('Intern Overheid');
    cy.get(document.accessLevelPill.edit).click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();
    cy.get(document.accessLevelPill.cancel).click();
    cy.get(document.accessLevelPill.pill).contains('Intern Overheid');
    cy.get(document.accessLevelPill.edit).click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();
    cy.get(document.accessLevelPill.save).click();
    cy.wait('@patchPieces');
    cy.get(document.accessLevelPill.pill).contains('Publiek');

    // Verify only 1 piece is affected by change
    // TODO-access-level verification of access-level no longer in history
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();
    // cy.get(document.vlDocument.piece).as('pieces');
    // cy.get('@pieces').eq(0)
    //   .find(document.accessLevelPill.pill)
    //   .contains('Publiek');
    // cy.get('@pieces').eq(1)
    //   .find(document.accessLevelPill.pill)
    //   .contains('Intern Regering');
    // cy.get(document.documentCard.versionHistory)
    //   .find(auk.accordion.header.button)
    //   .click();

    // delete the BIS piece
    cy.intercept('DELETE', '/files/**').as('deleteFileBis');
    cy.intercept('DELETE', '/pieces/**').as('deletePieceBis');
    // put call to restore pieces (won't do anything in this test, but should always be called)
    cy.intercept('PUT', '/agendaitems/**/pieces/restore').as('restoreAgendaitemPieceBis');
    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.delete)
      .click();
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.undoDelete);
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@deleteFileBis').wait('@deletePieceBis')
      .wait('@restoreAgendaitemPieceBis');

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // check that BIS is now deleted, original piece is showing
    cy.get(document.documentCard.name.value).as('documentName');
    cy.get('@documentName').contains(savedName)
      .should('not.exist');
    cy.get('@documentName').contains(file.newFileName);
    cy.get(document.documentCard.versionHistory).should('not.exist');

    // delete the last piece, should delete container
    cy.intercept('DELETE', '/files/**').as('deleteLastFile');
    cy.intercept('DELETE', '/pieces/**').as('deleteLastPiece');
    cy.intercept('DELETE', '/document-containers/**').as('deleteContainer');
    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.delete)
      .click();
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@deleteLastFile').wait('@deleteLastPiece')
      .wait('@deleteContainer');

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // both documents and linked documents show emptyState
    cy.get(appuniversum.alert.message).should('have.length', 2)
      .eq(0)
      .contains('geen documenten');
  });

  it('Cancelling when adding new piece should not skip a piece the next time', () => {
    // const agendaDate = Cypress.dayjs('2022-04-13');
    // const caseTitle = 'Cypress test: cancel editing - new agendaitem pieces - 1652689139';
    const subcaseTitleShort = 'Cypress test: cancel editing - new agendaitem pieces - short title - 1652689139';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    // *Setup of this test:
    // Designagenda A with 1 proposed subcase with 1 document uploaded

    cy.visitAgendaWithLink('/vergadering/6282091A7D8287D7ED094CF6/agenda/6282091B7D8287D7ED094CF7/agendapunten/6282093A7D8287D7ED094CFD/documenten');

    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(file.newFileName);

    cy.log('uploadFileToCancel 1');
    uploadFileToCancel(file);
    cy.intercept('DELETE', '/files/**').as('deleteFile1');
    cy.get(auk.confirmationModal.footer.cancel).click()
      .wait('@deleteFile1');

    cy.addNewPieceToAgendaitem(subcaseTitleShort, file.newFileName, file);
    cy.get(auk.auModal.container).should('not.exist');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}BIS`);

    cy.log('uploadFileToCancel 2');
    uploadFileToCancel(file);
    cy.intercept('DELETE', '/files/**').as('deleteFile2');
    cy.get(auk.auModal.header.close).click()
      .wait('@deleteFile2');
    cy.addNewPieceToAgendaitem(subcaseTitleShort, file.newFileName, file);
    cy.get(auk.auModal.container).should('not.exist');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}TER`);

    cy.log('uploadFileToCancel 3');
    uploadFileToCancel(file);
    cy.intercept('DELETE', '/files/**').as('deleteFile3');
    cy.get(document.vlUploadedDocument.deletePiece).should('exist')
      .click()
      .wait('@deleteFile3');

    cy.log('uploadFileToCancel 4');
    cy.get(auk.auModal.container).within(() => {
      cy.get(auk.confirmationModal.footer.confirm).should('be.disabled');
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
      cy.wait(1000);
      cy.intercept('POST', '/pieces').as('createNewPiece');
      cy.intercept('POST', '/submission-activities').as('createNewSubmissionActivity');
      cy.intercept('PATCH', '/submission-activities').as('patchAgendaitem');
      cy.intercept('PUT', '/agendaitems/**/pieces').as('putAgendaitemDocuments');
      cy.intercept('GET', '/pieces?filter**agendaitems**').as('loadPiecesAgendaitemQuater');
      cy.get(auk.confirmationModal.footer.confirm).should('not.be.disabled')
        .click();
      cy.wait('@createNewPiece', {
        timeout: 12000,
      }).wait('@createNewSubmissionActivity', {
        timeout: 12000,
      })
        .wait('@patchAgendaitem', {
          timeout: 12000,
        })
        .wait('@putAgendaitemDocuments', {
          timeout: 12000,
        });
      cy.wait('@loadPiecesAgendaitemQuater');
    });

    cy.get(auk.auModal.container).should('not.exist');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}QUATER`);

    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}TER`);
    cy.get('@pieces').eq(1)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}BIS`);
    cy.get('@pieces').eq(2)
      .find(document.vlDocument.name)
      .contains(file.newFileName);
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();

    // verify history in subcase view
    cy.visitCaseWithLink('/dossiers/E14FB4D9-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/628208FF7D8287D7ED094CF2/documenten');
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}TER`);
    cy.get('@pieces').eq(1)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}BIS`);
    cy.get('@pieces').eq(2)
      .find(document.vlDocument.name)
      .contains(file.newFileName);
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
  });

  it('should test batch document edit', () => {
    // const agendaDate = Cypress.dayjs('2022-04-14');
    // const subcaseTitleShort = 'Cypress test: Batch editing - agendaitem pieces - short title - 1652693433';
    const fileName2 = 'Rij 2 test pdf 2';
    const filename1 = 'Rij 1 test pdf';
    const accesLevelOption1 = 'Intern Regering';
    const accesLevelOption3 = 'Publiek';
    const accesLevelOption4 = 'Vertrouwelijk';
    const typeOption = 'Advies Inspectie Financiën';
    const typeOption2 = 'Besluit Vlaamse Regering';
    const typeOption3 = 'Groenboek';
    const typeSearchOption = 'Advies agentschap overheidspersoneel';

    // *Setup of this test:
    // Designagenda A with 1 proposed subcase with 2 pieces uploaded
    // Pieces 1 has 2 version, original and a BIS
    // Pieces 2 has only 1 version

    cy.visitAgendaWithLink('/vergadering/62821A1F3EC31C17C53F45B4/agenda/62821A1F3EC31C17C53F45B5/agendapunten/62821A423EC31C17C53F45BB/documenten');
    // change fields separately and save
    openAgendaitemDocumentBatchEdit();
    // TODO-batchEdit name instead of index?
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.accessLevel)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(4)
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces');
    cy.intercept('PATCH', '/document-containers/**').as('patchdocumentContainers');
    cy.intercept('GET', '/pieces**').as('getPieces');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces');
    cy.wait('@patchdocumentContainers');
    cy.wait('@getPieces');
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.accessLevelPill.pill)
      .contains(accesLevelOption3);

    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.type)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(2)
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces2');
    cy.intercept('PATCH', '/document-containers/**').as('patchdocumentContainers2');
    cy.intercept('GET', '/pieces**').as('getPieces2');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces2');
    cy.wait('@patchdocumentContainers2');
    cy.wait('@getPieces2');
    cy.get(document.documentCard.name.value).contains(filename1)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption);

    // change all rows
    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.type)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(1)
      .click();
    cy.wait(500); // minor wait between ember power selects to ensure the previous one closed
    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.type)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(1)
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces3');
    cy.intercept('PATCH', '/document-containers/**').as('patchdocumentContainers3');
    cy.intercept('GET', '/pieces**').as('getPieces3');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces3');
    cy.wait('@patchdocumentContainers3');
    cy.wait('@getPieces3');
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption2);
    cy.get(document.documentCard.name.value).contains(filename1)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption2);

    // check if cancel doesn't save data
    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.accessLevel)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .click();
    cy.wait(500); // minor wait between ember power selects to ensure the previous one closed
    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.type)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(2)
      .click();
    cy.get(auk.modal.footer.cancel).click();

    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.accessLevelPill.pill)
      .should('not.contain', accesLevelOption1);
    cy.get(document.documentCard.name.value).contains(filename1)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .should('not.contain', typeOption);

    // search document type not in first 20 choices (in dropdown)
    openAgendaitemDocumentBatchEdit();
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.type)
      .click();
    cy.get(dependency.emberPowerSelect.searchInput).type(typeSearchOption);
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .contains(typeSearchOption)
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces4');
    cy.intercept('PATCH', '/document-containers/**').as('patchdocumentContainers4');
    cy.intercept('GET', '/pieces**').as('getPieces4');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces4');
    cy.wait('@patchdocumentContainers4');
    cy.wait('@getPieces4');
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeSearchOption);

    // use top row to edit multiple rows at once
    openAgendaitemDocumentBatchEdit();
    cy.get(document.batchDocumentsDetails.selectAll).parent()
      .click();
    cy.get(document.batchEditingRow.type)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(typeOption3)
      .click();

    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.type)
      .contains(typeOption3);
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.type)
      .contains(typeOption3);

    cy.get(document.batchEditingRow.accesLevel)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(accesLevelOption4)
      .click();

    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.accessLevel)
      .contains(accesLevelOption4);
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.accessLevel)
      .contains(accesLevelOption4);

    cy.intercept('PATCH', '/pieces/**').as('patchPieces5');
    cy.intercept('PATCH', '/document-containers/**').as('patchdocumentContainers5');
    cy.intercept('GET', '/pieces**').as('getPieces5');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces5');
    cy.wait('@patchdocumentContainers5');
    cy.wait('@getPieces5');
    cy.get(document.documentCard.name.value).contains(filename1)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption3);
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption3);

    cy.get(document.documentCard.name.value).contains(filename1)
      .parents(document.documentCard.card)
      .find(document.accessLevelPill.pill)
      .contains(accesLevelOption4);
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.accessLevelPill.pill)
      .contains(accesLevelOption4);
  });
});
