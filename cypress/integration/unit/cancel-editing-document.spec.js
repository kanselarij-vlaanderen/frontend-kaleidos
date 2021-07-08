/* global context, before, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />

import document from '../../selectors/document.selectors';
import agenda from '../../selectors/agenda.selectors';
import dependency from '../../selectors/dependency.selectors';
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
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Editing of a document or piece but cancelling should show old data', () => {
    const caseTitle = `Cypress test: cancel editing pieces - ${currentTimestamp()}`;
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: cancel editing of documents on agendaitem - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het annuleren van editeren van een document aan een agendaitem';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const fileName = 'test pdf';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
    };
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);
    const agendaDate = Cypress.moment().add(1, 'weeks')
      .day(1);

    cy.createAgenda('Ministerraad', agendaDate, 'Test annuleren van editeren documenten');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.clickAgendaitemTab(agenda.agendaitemNav.documentsTab);

    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(file.newFileName);

    cy.addNewPieceToAgendaitem(SubcaseTitleShort, file.newFileName, file);

    cy.get(document.documentCard.card).eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(`${file.newFileName}BIS`);
      });
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').each(() => {
      cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    });

    // Cancel/save of document-type and access-level in editing view
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.editDocumentRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.editDocumentRow.type)
      .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Decreet')
      .click();
    cy.get(document.editDocumentRow.type).contains('Decreet');

    cy.get('@documentRows').eq(0)
      .find(document.editDocumentRow.accessLevel)
      .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .scrollIntoView()
      .click();
    cy.get(document.editDocumentRow.accessLevel).contains('Publiek');
    cy.get(document.batchDocumentEdit.cancel).click();

    // Verify nothing changed after cancel
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').each(() => {
      cy.get(document.accessLevelPill.pill).contains('Intern Regering');
    });

    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.editDocumentRow.row).as('documentRows');
    cy.get('@documentRows').eq(0)
      .find(document.editDocumentRow.type)
      .contains('Nota');
    cy.get('@documentRows').eq(0)
      .find(document.editDocumentRow.accessLevel)
      .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .scrollIntoView()
      .click();
    cy.get(document.batchDocumentEdit.save).click();

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

    // TODO duplicate asserts, we want to check name here
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
  });

  it('Cancelling when adding new piece should not skip a piece the next time', () => {
    cy.route('DELETE', '/files/**').as('deleteFile');

    const caseTitle = `Cypress test: pieces - ${currentTimestamp()}`;
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: cancelling a new piece - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het annuleren tijdens toevoegen van een nieuwe document versie';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);
    const agendaDate = Cypress.moment().add(2, 'weeks')
      .day(1); // friday in two weeks

    cy.createAgenda('Ministerraad', agendaDate, 'Test document-versies annuleren');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.clickAgendaitemTab(agenda.agendaitemNav.documentsTab);

    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(file.newFileName);

    cy.log('uploadFileToCancel 1');
    uploadFileToCancel(file);
    cy.get(utils.vlModalFooter.cancel).click()
      .wait('@deleteFile');

    cy.addNewPieceToAgendaitem(SubcaseTitleShort, file.newFileName, file);
    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}BIS`);

    cy.log('uploadFileToCancel 2');
    uploadFileToCancel(file);
    cy.get(utils.vlModal.close).click()
      .wait('@deleteFile'); // TODO this causes fails sometimes because the piece is not deleted fully
    cy.addNewPieceToAgendaitem(SubcaseTitleShort, file.newFileName, file);
    cy.get(utils.vlModal.dialogWindow).should('not.be.visible');
    cy.get(document.documentCard.card).eq(0)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}TER`);

    cy.log('uploadFileToCancel 3');
    uploadFileToCancel(file);
    cy.get(document.vlUploadedDocument.deletePiece).should('exist')
      .click()
      .wait('@deleteFile'); // TODO this causes fails sometimes because the piece is not deleted fully

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

    // TODO pressing ESC key on the modal should be tested once implemented
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
});
