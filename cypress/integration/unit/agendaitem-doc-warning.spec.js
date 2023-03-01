/* global context, beforeEach, afterEach, it, cy, Cypress */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';

function clickNewPieceForFile(file) {
  cy.get(document.documentCard.name.value).contains(file)
    .parents(document.documentCard.card)
    .within(() => {
      cy.get(document.documentCard.actions).should('not.be.disabled')
        .click();
      cy.get(document.documentCard.uploadPiece).click();
    });
}

// TODO-command make new or add confirmation to existing
function addNewPieceWithConfirm(oldFileName, file, modelToPatch, hasSubcase = true) {
  cy.log('addNewPiece');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('POST', 'pieces').as(`createNewPiece_${randomInt}`);
  cy.intercept('GET', '/pieces?filter**').as(`loadPieces_${randomInt}`);
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems' || modelToPatch === 'subcases') {
      cy.intercept('GET', '/submission-activities?filter**').as('getSubmissionActivity');
      cy.intercept('POST', '/submission-activities').as('createNewSubmissionActivity');
      cy.intercept('PATCH', '/agendaitems/**').as('patchAgendaitem');
      cy.intercept('PUT', '/agendaitems/**/pieces').as('putAgendaitemDocuments');
    } else {
      cy.intercept('PATCH', `/${modelToPatch}/**`).as('patchSpecificModel');
    }
  }

  cy.get(document.documentCard.name.value).contains(oldFileName)
    .parents(document.documentCard.card)
    .within(() => {
      cy.get(document.documentCard.actions).should('not.be.disabled')
        .click();
      cy.get(document.documentCard.uploadPiece).click();
    });

  // warning
  cy.get(auk.confirmationModal.footer.confirm).click();

  cy.get(auk.auModal.container).within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.vlUploadedDocument.filename).should('contain', file.fileName);
  });
  cy.wait(1000); // Cypress is too fast

  cy.get(auk.confirmationModal.footer.confirm).click({
    force: true, // covered by the pop-up in headless tests where ut stays open while it shouldn't
  })
    .wait(`@createNewPiece_${randomInt}`);

  // for agendaitems and subcases both are patched, not waiting causes flaky tests
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems') {
      if (hasSubcase) {
        // we always POST submission activity here
        cy.wait('@createNewSubmissionActivity')
          .wait('@patchAgendaitem')
          .wait('@putAgendaitemDocuments');
      } else {
        cy.wait('@patchAgendaitem')
          .wait('@putAgendaitemDocuments');
      }
    } else if (modelToPatch === 'subcases') {
      // We always get the submission activities after post or patch
      cy.wait('@getSubmissionActivity');
    } else {
      cy.wait('@patchSpecificModel');
    }
  }
  cy.wait(`@loadPieces_${randomInt}`); // This call does not happen when loading subcase/documents route, but when loading the documents in that route
  cy.wait(1000); // Cypress is too fast
  cy.log('/addNewPiece');
}

context('Agendaitem document warning tests', () => {
  const agendaDate = Cypress.dayjs().add(6, 'weeks')
    .day(4);
  const agendaitemTitle = 'Goedkeuring van het verslag van de vergadering van';
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };
  const newFile = {
    folder: 'files', fileName: 'replace', fileExtension: 'pdf',
  };

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // currently not possible to test concurrency, check if we can mock something

  it('setup', () => {
    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addDocumentsToApprovalItem(agendaitemTitle, [file]);
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
    cy.approveAndCloseDesignAgenda();
  });

  it('should test the warnings when adding documments on old/closed agendaversions', () => {
    const recentVersionAvailable = 'Er is een recentere versie van deze agenda.';
    const editDocsOnApproved = 'Bent U zeker dat U de documenten wilt wijzigen op deze goedgekeurde agendaversie?';
    cy.openAgendaForDate(agendaDate);

    // check warning and cancel on A
    cy.changeSelectedAgenda('Agenda A');
    cy.openAgendaitemDocumentTab(agendaitemTitle, false, false);
    cy.get(route.agendaitemDocuments.add).click();
    cy.get(auk.auModal.body).contains(recentVersionAvailable);
    cy.get(auk.auModal.body).contains(editDocsOnApproved);
    cy.get(auk.confirmationModal.footer.cancel).click();
    // uploadwindow should not appear, if it does test will fail
    cy.get(auk.auModal.container).should('not.exist');

    // check flow after confirm
    cy.get(route.agendaitemDocuments.add).click();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.intercept('PATCH', '/agendaitems/**').as('patchAgendaitems1');
    cy.addNewDocumentsInUploadModal([newFile], 'agendaitems');
    cy.wait('@patchAgendaitems1');
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.name.value).contains(newFile.fileName);

    // check upload new piece and cancel
    clickNewPieceForFile(file.fileName);
    cy.get(auk.auModal.body).contains(recentVersionAvailable);
    cy.get(auk.auModal.body).contains(editDocsOnApproved);
    cy.get(auk.confirmationModal.footer.cancel).click();
    // uploadwindow should not appear, if it does test will fail
    cy.get(auk.auModal.container).should('not.exist');

    // check upload new piece and confirm
    addNewPieceWithConfirm(file.fileName, file, 'agendaitems', false);
    cy.get(document.documentCard.name.value).contains(`${file.fileName}BIS`);

    // new doc and BIS should not exist on B
    cy.changeSelectedAgenda('Agenda B');
    cy.openAgendaitemDocumentTab(agendaitemTitle, false, false);
    cy.get(document.documentCard.name.value).contains(file.fileName);
    cy.get(document.documentCard.name.value).contains(newFile.fileName)
      .should('not.exist');
    cy.get(document.documentCard.name.value).contains(`${file.fileName}BIS`)
      .should('not.exist');

    // check warning and cancel on B (closed agenda)
    cy.get(route.agendaitemDocuments.add).click();
    cy.get(auk.auModal.body).contains(editDocsOnApproved);
    cy.get(auk.confirmationModal.footer.cancel).click();
    // uploadwindow should not appear, if it does test will fail
    cy.get(auk.auModal.container).should('not.exist');

    // check flow after confirm
    cy.get(route.agendaitemDocuments.add).click();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.intercept('PATCH', '/agendaitems/**').as('patchAgendaitems2');
    cy.intercept('GET', '/pieces?filter**').as('loadNewPiece');
    cy.addNewDocumentsInUploadModal([newFile], 'agendaitems');
    cy.wait('@patchAgendaitems2');
    cy.wait('@loadNewPiece');
    cy.get(auk.auModal.container).should('not.exist');
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(document.documentCard.name.value).contains(newFile.fileName);

    // check upload new piece and cancel
    clickNewPieceForFile(file.fileName);
    cy.get(auk.auModal.body).contains(editDocsOnApproved);
    cy.get(auk.confirmationModal.footer.cancel).click();
    // uploadwindow should not appear, if it does test will fail
    cy.get(auk.auModal.container).should('not.exist');

    // check upload new piece and confirm
    addNewPieceWithConfirm(file.fileName, file, 'agendaitems', false);
    cy.get(document.documentCard.name.value).contains(`${file.fileName}TER`);
  });
});
