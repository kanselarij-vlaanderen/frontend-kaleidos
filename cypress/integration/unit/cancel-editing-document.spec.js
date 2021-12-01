/* global context, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />


import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

function uploadFileToCancel(file) {
  cy.get(document.documentCard.name.value).contains(file.fileName)
    .parents(document.documentCard.card)
    .within(() => {
      cy.get(document.documentCard.actions).click();
      cy.get(document.documentCard.uploadPiece).click();
    });
  cy.get(utils.vlModal.dialogWindow).within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.vlUploadedDocument.filename).should('contain', file.fileName);
    cy.wait(1000);
  });
}

context('Tests for cancelling CRUD operations on document and pieces', () => {
  const typeNota = 'Nota';
  const agendaKind = 'Ministerraad';
  const agendaPlace = 'Cypress Room';

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Editing of a document or piece but cancelling should show old data', () => {
    const agendaDate = Cypress.moment().add(1, 'weeks')
      .day(1);
    const caseTitle = `Cypress test: cancel editing pieces - ${currentTimestamp()}`;
    const subcaseTitleShort = `Cypress test: cancel editing of documents on agendaitem - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het annuleren van editeren van een document aan een agendaitem';
    const fileName = 'test pdf';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
    };
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase(typeNota, subcaseTitleShort, subcaseTitleLong);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);

    cy.createAgenda(agendaKind, agendaDate, agendaPlace);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort, false);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaitemNav.documentsTab).click();

    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(file.newFileName);

    cy.addNewPieceToAgendaitem(subcaseTitleShort, file.newFileName, file);

    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}BIS`);
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').each(() => {
      cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    });
    cy.get(document.documentCard.versionHistory).click();

    // Cancel/save of document-type and access-level in editing view
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.type)
      .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Decreet')
      .click();
    cy.get(document.documentDetailsRow.type).contains('Decreet');

    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.accessLevel)
      .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .scrollIntoView()
      .click();
    cy.get(document.documentDetailsRow.accessLevel).contains('Publiek');
    cy.get(auk.modal.footer.cancel).click();

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // Verify nothing changed after cancel
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').each(() => {
      cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    });
    cy.get(document.documentCard.versionHistory).click();

    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.type)
      .contains('Nota');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.accessLevel)
      .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .scrollIntoView()
      .click();
    cy.get(document.batchDocumentsDetails.save).click();

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // Verify only 1 piece is affected by change
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.accessLevelPill.pill)
      .contains('Intern Overheid');
    cy.get('@pieces').eq(1)
      .find(document.accessLevelPill.pill)
      .contains('Intern Regering');
    cy.get(document.documentCard.versionHistory).click();

    // Cancel/save name in document card
    const extraName = (' - Nota');
    const savedName = `${fileName}BIS${extraName}`;
    cy.route('PATCH', '/pieces/**').as('patchPieces');

    cy.get(document.documentCard.name.value).contains(fileName)
      .click();
    cy.get(document.documentCard.name.input).type(extraName);
    cy.get(document.documentCard.name.cancel).click();
    // assert old value is back
    cy.get(document.documentCard.name.value).contains(fileName)
      .click();
    cy.get(document.documentCard.name.input).type(extraName);
    cy.get(document.documentCard.name.save).click();
    cy.wait('@patchPieces');
    // assert new value is set
    cy.get(document.documentCard.name.value)
      .contains(savedName);

    // Verify only 1 piece is affected by change
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.accessLevelPill.pill)
      .contains('Intern Overheid');
    cy.get('@pieces').eq(1)
      .find(document.accessLevelPill.pill)
      .contains('Intern Regering');
    cy.get(document.documentCard.versionHistory).click();

    // Cancel/save access-level in document card
    cy.get(document.accessLevelPill.pill).contains('Intern Overheid')
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();
    cy.get(document.accessLevelPill.cancel).click();
    cy.get(document.accessLevelPill.pill).contains('Intern Overheid')
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();
    cy.get(document.accessLevelPill.save).click();
    cy.wait('@patchPieces');
    cy.get(document.accessLevelPill.pill).contains('Publiek')
      .click();

    // Verify only 1 piece is affected by change
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.accessLevelPill.pill)
      .contains('Publiek');
    cy.get('@pieces').eq(1)
      .find(document.accessLevelPill.pill)
      .contains('Intern Regering');
    cy.get(document.documentCard.versionHistory).click();

    // delete the BIS piece
    cy.route('DELETE', '/files/**').as('deleteFile');
    cy.route('DELETE', '/pieces/**').as('deletePiece');
    // put call to restore pieces (won't do anything in this test, but should always be called)
    cy.route('PUT', '/agendaitems/**/pieces/restore').as('restoreAgendaitemPiece');
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.delete)
      .click();
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.undoDelete);
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@deleteFile').wait('@deletePiece')
      .wait('@restoreAgendaitemPiece');

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // check that BIS is now deleted, original piece is showing
    cy.get(document.documentCard.name.value).as('documentName');
    cy.get('@documentName').contains(savedName)
      .should('not.exist');
    cy.get('@documentName').contains(file.newFileName);
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).should('have.length', 1);
    cy.get(document.documentCard.versionHistory).click();

    // delete the last piece, should delete container
    cy.route('DELETE', '/document-containers/**').as('deleteContainer');
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.documentDetailsRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.documentDetailsRow.delete)
      .click();
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@deleteFile').wait('@deletePiece')
      .wait('@restoreAgendaitemPiece')
      .wait('@deleteContainer');

    // make sure modal is closed before continuing
    cy.get(document.documentDetailsRow.row).should('not.exist');

    // both documents and linked documents show emptyState
    cy.get(utils.vlAlert.message).should('have.length', 2)
      .eq(0)
      .contains('geen documenten');
  });

  it('Cancelling when adding new piece should not skip a piece the next time', () => {
    cy.route('DELETE', '/files/**').as('deleteFile');
    const agendaDate = Cypress.moment().add(2, 'weeks')
      .day(1); // friday in two weeks
    const caseTitle = `Cypress test: pieces - ${currentTimestamp()}`;
    const subcaseTitleShort = `Cypress test: cancelling a new piece - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het annuleren tijdens toevoegen van een nieuwe document versie';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase(typeNota, subcaseTitleShort, subcaseTitleLong);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);

    cy.createAgenda(agendaKind, agendaDate, agendaPlace);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort, false);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaitemNav.documentsTab).click();

    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(file.newFileName);

    cy.log('uploadFileToCancel 1');
    uploadFileToCancel(file);
    cy.get(utils.vlModalFooter.cancel).click()
      .wait('@deleteFile');

    cy.addNewPieceToAgendaitem(subcaseTitleShort, file.newFileName, file);
    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}BIS`);

    cy.log('uploadFileToCancel 2');
    uploadFileToCancel(file);
    cy.get(utils.vlModal.close).click()
      .wait('@deleteFile');
    cy.addNewPieceToAgendaitem(subcaseTitleShort, file.newFileName, file);
    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}TER`);

    cy.log('uploadFileToCancel 3');
    uploadFileToCancel(file);
    cy.get(document.vlUploadedDocument.deletePiece).should('exist')
      .click()
      .wait('@deleteFile');

    cy.log('uploadFileToCancel 4');
    cy.get(utils.vlModal.dialogWindow).within(() => {
      cy.get(utils.vlModalFooter.save).should('be.disabled');
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
      cy.wait(1000);
      cy.route('POST', '/pieces').as('createNewPiece');
      cy.route('POST', '/submission-activities').as('createNewSubmissionActivity');
      cy.route('PATCH', '/submission-activities').as('patchAgendaitem');
      cy.route('PUT', '/agendaitems/**/pieces').as('putAgendaitemDocuments');
      cy.route('GET', '/pieces?filter\\[agendaitems\\]\\[:id:\\]=*').as('loadPiecesAgendaitemQuater');
      cy.get(utils.vlModalFooter.save).should('not.be.disabled')
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

    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}QUATER`);

    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}QUATER`);
    cy.get('@pieces').eq(1)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}TER`);
    cy.get('@pieces').eq(2)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}BIS`);
    cy.get('@pieces').eq(3)
      .find(document.vlDocument.name)
      .contains(file.newFileName);
    cy.get(document.documentCard.versionHistory).click();

    cy.openCase(caseTitle);
    cy.openSubcase(0);
    cy.clickReverseTab('Documenten');
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}QUATER`);
    cy.get('@pieces').eq(1)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}TER`);
    cy.get('@pieces').eq(2)
      .find(document.vlDocument.name)
      .contains(`${file.newFileName}BIS`);
    cy.get('@pieces').eq(3)
      .find(document.vlDocument.name)
      .contains(file.newFileName);
    cy.get(document.documentCard.versionHistory).click();
  });
  it('should test batch document edit', () => {
    const agendaDate = Cypress.moment().add(2, 'weeks')
      .day(1);
    const subcaseTitle1 = 'Cypress test: cancelling a new piece';
    const fileName2 = 'test pdf 2';
    const filename3 = 'test pdfQUATER';
    const accesLevelOption1 = 'Intern Regering';
    const accesLevelOption3 = 'Publiek';
    const typeOption = 'IF';
    const typeOption2 = 'BVR';
    const typeSearchOption = 'Advies AgO';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName2, fileType: 'Nota',
    };
    const files = [file];
    cy.route('PATCH', '/pieces/**').as('patchPieces');
    cy.route('PATCH', '/document-containers/**').as('patchdocumentContainers');
    cy.route('GET', '/pieces**').as('getPieces');

    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle1, true);

    // add docs for test
    cy.get(route.agendaitemDocuments.add).click();
    cy.addNewDocumentsInUploadModal(files, 'agendaitems');

    // change fields separately and save
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.wait(1000);
    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.accessLevel)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(2)
      .click();
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces');
    cy.wait('@patchdocumentContainers');
    cy.wait('@getPieces');
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.accessLevelPill.pill)
      .contains(accesLevelOption3);

    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.wait(1000);
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.type)
      .click();
    cy.wait(1000);
    cy.get(dependency.emberPowerSelect.option).eq(2)
      .click();
    cy.route('PATCH', '/pieces/**').as('patchPieces2');
    cy.route('PATCH', '/document-containers/**').as('patchdocumentContainers2');
    cy.route('GET', '/pieces**').as('getPieces2');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces2');
    cy.wait('@patchdocumentContainers2');
    cy.wait('@getPieces2');
    cy.get(document.documentCard.name.value).contains(filename3)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption);

    // change all rows
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.wait(1000);
    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.type)
      .click();
    cy.wait(1000);
    cy.get(dependency.emberPowerSelect.option).eq(1)
      .click();
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.type)
      .click();
    cy.wait(1000);
    cy.get(dependency.emberPowerSelect.option).eq(1)
      .click();
    cy.route('PATCH', '/pieces/**').as('patchPieces3');
    cy.route('PATCH', '/document-containers/**').as('patchdocumentContainers3');
    cy.route('GET', '/pieces**').as('getPieces3');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces3');
    cy.wait('@patchdocumentContainers3');
    cy.wait('@getPieces3');
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption2);
    cy.get(document.documentCard.name.value).contains(filename3)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeOption2);

    // check if cancel doesn't save data
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.wait(1000);
    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.accessLevel)
      .click();
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .click();
    cy.get(document.documentDetailsRow.row).eq(1)
      .find(document.documentDetailsRow.type)
      .click();
    cy.wait(1000);
    cy.get(dependency.emberPowerSelect.option).eq(2)
      .click();
    cy.get(auk.modal.footer.cancel).click();
    cy.wait(1000);

    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.accessLevelPill.pill)
      .should('not.contain', accesLevelOption1);
    cy.get(document.documentCard.name.value).contains(filename3)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .should('not.contain', typeOption);

    // search document type not in first 20 choices (in dropdown)
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.wait(1000);
    cy.get(document.documentDetailsRow.row).eq(0)
      .find(document.documentDetailsRow.type)
      .click();
    cy.wait(1000);
    cy.get(dependency.emberPowerSelect.searchInput).type(typeSearchOption);
    cy.wait(2000);
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .contains(typeSearchOption)
      .click();
    cy.route('PATCH', '/pieces/**').as('patchPieces4');
    cy.route('PATCH', '/document-containers/**').as('patchdocumentContainers4');
    cy.route('GET', '/pieces**').as('getPieces4');
    cy.get(document.batchDocumentsDetails.save).click();
    cy.wait('@patchPieces4');
    cy.wait('@patchdocumentContainers4');
    cy.wait('@getPieces4');
    cy.get(document.documentCard.name.value).contains(fileName2)
      .parents(document.documentCard.card)
      .find(document.documentCard.type)
      .contains(typeSearchOption);
  });
});
