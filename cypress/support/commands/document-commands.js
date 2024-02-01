/* global cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
// ***********************************************

// ***********************************************
// Functions

/**
 * @description Adds a new document for each file in the "files"-array to an opened document upload modal
 * @name addNewDocumentsInUploadModal
 * @memberOf Cypress.Chainable#
 * @function
 * @param {{folder: String, fileName: String, fileExtension: String, [newFileName]: String, [fileType]: String}[]} files
 * @param {String} model - The name of the model
 */
function addNewDocumentsInUploadModal(files, model) {
  cy.log('addNewDocumentsInUploadModal');
  cy.get(auk.auModal.container).as('fileUploadDialog');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  files.forEach((file, index) => {
    cy.get('@fileUploadDialog').within(() => {
      cy.intercept('GET', '/concepts**559774e3-061c-4f4b-a758-57228d4b68cd**').as(`loadConceptsDocType_${randomInt}`);
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
      // ensure the new uploadedDocument component is visible before trying to continue
      cy.get(document.uploadedDocument.nameInput).should('have.length.at.least', index + 1);

      if (file.newFileName) {
        cy.get(document.uploadedDocument.nameInput).eq(index)
          .clear()
          .type(file.newFileName);
      }
    });

    if (file.fileType) {
      cy.wait(`@loadConceptsDocType_${randomInt}`, {
        timeout: 30000,
      });
      cy.get('@fileUploadDialog').find(document.uploadedDocument.container)
        .eq(index)
        .find(document.uploadedDocument.documentTypes)
        .as('radioOptions');
      cy.get(utils.radioDropdown.input).should('exist'); // the radio buttons should be loaded before the within or the .length returns 0
      cy.get('@radioOptions').within(($t) => {
        if ($t.find(`input[type="radio"][value="${file.fileType}"]`).length) {
          cy.get(utils.radioDropdown.input).check(file.fileType, {
            force: true,
          }); // CSS has position:fixed, which cypress considers invisible
        } else {
          cy.get('input[type="radio"][value="Andere"]').check({
            force: true,
          });
          cy.get(dependency.emberPowerSelect.trigger)
            .click()
            .parents('body') // we want to stay in the within, but have to search the options in the body
            .find(dependency.emberPowerSelect.option)
            .contains(file.fileType)
            .click(); // Match is not exact, ex. fileType "Advies" yields "Advies AgO" instead of "Advies"
        }
      });
    }
  });
  // Click save
  cy.intercept('POST', 'pieces').as('createNewPiece');
  cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
  cy.intercept('POST', 'submission-activities').as('createNewSubmissionActivity');
  cy.intercept('GET', '/submission-activities?filter**&include**').as(`getSubmissionActivity_${randomInt}`);
  cy.intercept('GET', `/pieces?filter**${model}**`).as(`loadPieces${model}`);
  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.wait('@createNewDocumentContainer', {
    timeout: 24000,
  });
  cy.wait('@createNewPiece', {
    timeout: 24000,
  });
  // Pieces are loaded differently in the subcase/documents route
  if (model === 'subcase') {
    cy.wait('@createNewSubmissionActivity', {
      timeout: 24000 + (6000 * files.length),
    }).wait(`@getSubmissionActivity_${randomInt}`, {
      timeout: 60000,
    });
  } else {
    cy.wait(`@loadPieces${model}`, {
      timeout: 24000 + (6000 * files.length),
    });
  }

  cy.log('/addNewDocumentsInUploadModal');
}

/**
 * @description Opens the new piece dialog and adds the file.
 * @name addNewPiece
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} oldFileName - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} file - The name of the file without the extension
 */
function addNewPiece(oldFileName, file, modelToPatch, hasSubcase = true) {
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
      // .wait('@getSubmissionActivity', {
      //   timeout: 12000,
      // });
    } else if (modelToPatch === 'subcases') {
      // NOTE: these 2 awaits don't happen for subcase not proposed for a meeting / no agenda-activity
      // cy.wait('@putAgendaitemDocuments', {
      //   timeout: 12000,
      // }).wait('@patchAgendaitem', {
      //   timeout: 12000,
      // });
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

/**
 * @description Add document to a meeting (notulen).
 * @name addDocumentsToMeeting
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string[]} files
 */
// NOTE: this is somewhat confusing because we are in the "agenda/documents" route with the model for "meeting"
function addDocumentsToMeeting(files) {
  cy.log('addDocumentsToMeeting');
  cy.clickReverseTab('Documenten');
  cy.get(route.agendaDocuments.addDocuments).click();
  return addNewDocumentsInUploadModal(files, 'meeting');
}

/**
 * @description Add document to a subcase.
 * @name addDocumentsToSubcase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string[]} files
 */
function addDocumentsToSubcase(files) {
  cy.log('addDocumentsToSubcase');
  cy.clickReverseTab('Documenten');
  cy.wait(1000); // clicking adding documents sometimes does nothing, page not loaded?
  cy.get(route.subcaseDocuments.add).click();
  return addNewDocumentsInUploadModal(files, 'subcase');
}

/**
 * @description Add document to agenda.
 * @name addDocumentToTreatment
 * @memberOf Cypress.Chainable#
 * @function
 * @param {} file
 */
function addDocumentToTreatment(file, shouldConfirm = true) {
  cy.log('addDocumentsToTreatment');
  cy.get(agenda.agendaitemNav.decisionTab).click();
  // 1 default item treatment exists
  cy.get(agenda.agendaitemDecision.uploadFile).click();

  cy.get(auk.auModal.container).within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
  });

  if (shouldConfirm) {
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@patchDecisionActivities');
  }
  cy.log('/addDocumentsToTreatment');
}

/**
 * @description Add a new piece to an meeting.
 * @name addNewPieceToMeeting
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} oldFileName
 * @param {string} file
 */
function addNewPieceToMeeting(oldFileName, file) {
  cy.log('addNewPieceToMeeting');
  cy.clickReverseTab('Documenten');
  return addNewPiece(oldFileName, file);
}

/**
 * @description Opens agendaitem with agendaitemTitle and clicks the document link.
 * @name openAgendaitemDocumentTab
 * @memberOf Cypress.Chainable#.
 * @function
 * @param {string} agendaitemTitle
 * @param {boolean} alreadyHasDocs
 */
function openAgendaitemDocumentTab(agendaitemTitle, alreadyHasDocs = false, isAdmin = true) {
  cy.log('openAgendaitemDocumentTab');
  // TODO-command the next command switches to case tab if when we are already on the documents tab.
  cy.openDetailOfAgendaitem(agendaitemTitle, isAdmin);
  cy.get(agenda.agendaitemNav.documentsTab)
    .click()
    .wait(2000); // Access-levels GET occured earlier, general wait instead
  if (alreadyHasDocs) {
    cy.wait(2000); // documents GET occured earlier, general wait instead
  }
  cy.log('/openAgendaitemDocumentTab');
}

/**
 * @description Add a new document to an agendaitem.
 * @name addDocumentsToAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemTitle
 * @param {string} files
 */
function addDocumentsToAgendaitem(agendaitemTitle, files) {
  cy.log('addDocumentsToAgendaitem');
  openAgendaitemDocumentTab(agendaitemTitle, false);

  // Open the modal, add files
  cy.get(route.agendaitemDocuments.add).click();
  addNewDocumentsInUploadModal(files, 'agendaitems');
}

/**
 * @description Add a new document to an agendaitem with isApproval = true.
 * @name addDocumentsToApprovalItem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemTitle
 * @param {string} files
 */
function addDocumentsToApprovalItem(agendaitemTitle, files) {
  cy.log('addDocumentsToApprovalItem');
  openAgendaitemDocumentTab(agendaitemTitle, false, false);

  // Open the modal, add files
  cy.get(route.agendaitemDocuments.add).click();
  addNewDocumentsInUploadModal(files, 'agendaitems');
}

/**
 * @description Add a new piece to an agendaitem
 * @name addNewPieceToAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemTitle
 * @param {string} oldFileName
 * @param {string} file
 */
function addNewPieceToAgendaitem(agendaitemTitle, oldFileName, file) {
  cy.log('addNewPieceToAgendaitem');
  openAgendaitemDocumentTab(agendaitemTitle, true);
  return addNewPiece(oldFileName, file, 'agendaitems');
}

/**
 * @description Add a new piece to an agendaitem
 * @name addNewPieceToApprovalItem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemTitle
 * @param {string} oldFileName
 * @param {string} file
 */
function addNewPieceToApprovalItem(agendaitemTitle, oldFileName, file) {
  cy.log('addNewPieceToApprovalItem');
  openAgendaitemDocumentTab(agendaitemTitle, true, false);
  return addNewPiece(oldFileName, file, 'agendaitems', false);
}

/**
 * @description Add a new piece to a subcase
 * @name addNewPieceToSubcase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} oldFileName
 * @param {string} file
 */
function addNewPieceToSubcase(oldFileName, file) {
  cy.log('addNewPieceToSubcase');
  cy.clickReverseTab('Documenten');
  return addNewPiece(oldFileName, file, 'subcases');
}

/**
 * @description Opens agendaitem with agendaitemTitle and clicks the document link.
 * @name openAgendaitemDossierTab
 * @memberOf Cypress.Chainable#.
 * @function
 * @param {string} agendaitemTitle
 */
function openAgendaitemDossierTab(agendaitemTitle) {
  cy.log('openAgendaitemDossierTab');
  cy.openDetailOfAgendaitem(agendaitemTitle);
  cy.get(agenda.agendaitemNav.caseTab)
    .click();
  cy.log('/openAgendaitemDossierTab');
}

/**
 * @description Uploads a file to an open document dialog window.
 * @name uploadFile
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} folder - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} fileName - The name of the file without the extension
 * @param {String} extension - The extension of the file
 */
function uploadFile(folder, fileName, extension, mimeType = 'application/pdf') {
  cy.log('uploadFile');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('POST', 'files').as(`createNewFile${randomInt}`);
  cy.intercept('GET', 'files/**').as(`getNewFile${randomInt}`);

  const fileFullName = `${fileName}.${extension}`;
  const filePath = `${folder}/${fileFullName}`;
  // note: double encoding is needed or pdf will be blank (cy.fixture also needs encoding)

  // cy.fixture(filePath, 'base64').then((fileContent) => {
  //   cy.get('[type=file]').attachFile(
  //     {
  //       fileContent,
  //       fileName: fileFullName,
  //       mimeType,
  //       encoding: 'base64',
  //     },
  //     {
  //       uploadType: 'input',
  //     }
  //   );
  // });
  cy.fixture(filePath, {
    encoding: null,
  }).then((fileContent) => {
    cy.get('[type=file]').selectFile(
      {
        contents: fileContent,
        fileName: fileFullName,
        mimeType,
      }
    );
  });

  cy.wait(`@createNewFile${randomInt}`);
  cy.wait(`@getNewFile${randomInt}`);
  cy.get(appuniversum.loader).should('not.exist');
  cy.log('/uploadFile');
}

/**
 * @description Add a new piece to a decision.
 * @name addNewPieceToDecision
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} oldFileName - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} file - The name of the file without the extension
 */
function addNewPieceToDecision(oldFileName, file) {
  cy.log('addNewPieceToDecision');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('POST', '/reports').as(`createNewPiece_${randomInt}`);
  cy.intercept('PATCH', '/decision-activities/*').as(`patchDecisionActivity_${randomInt}`);
  cy.intercept('GET', '/reports/*/previous-piece').as(`getPreviousPiece_${randomInt}`);

  cy.get(document.documentCard.name.value).contains(oldFileName)
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
    cy.wait(1000); // Cypress is too fast

    // Forcing because sometimes the actions menu is still open and blocking the button, seems to happen more in headless mode
    cy.get(auk.confirmationModal.footer.confirm).click({
      force: true,
    })
      .wait(`@createNewPiece_${randomInt}`);
  });
  cy.wait(`@patchDecisionActivity_${randomInt}`);
  cy.wait(`@getPreviousPiece_${randomInt}`);
  cy.get(auk.auModal.container).should('not.exist');
  cy.get(appuniversum.loader).should('not.exist');
  cy.log('/addNewPieceToDecision');
}

/**
 * @description Add a new version to a decision.
 * @name addNewPieceToGeneratedDecision
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} oldFileName - The relative path to the file in the cypress/fixtures folder excluding the fileName
 */
function addNewPieceToGeneratedDecision(oldFileName) {
  cy.log('addNewPieceToGeneratedDecision');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('POST', '/pieces').as(`createNewPiece_${randomInt}`);
  cy.intercept('PATCH', '/decision-activities/*').as(`patchDecisionActivity_${randomInt}`);
  cy.intercept('GET', '/generate-decision-report/*').as(`generateReport_${randomInt}`);

  cy.get(document.documentCard.name.value).contains(oldFileName)
    .parents(document.documentCard.card)
    .within(() => {
      cy.get(document.documentCard.actions)
        .should('not.be.disabled')
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.generateNewPiece).forceClick();
    });

  cy.wait(`@patchDecisionActivity_${randomInt}`);
  cy.wait(`@generateReport_${randomInt}`);
  cy.get(appuniversum.loader).should('not.exist',
    {
      timeout: 60000,
    });
  cy.log('/addNewPieceToGeneratedDecision');
}

/**
 * @description Adds documents to the already delivered documents list
 * @name addLinkedDocument
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String[]} filenames - The relative path to the file in the cypress/fixtures folder excluding the fileName
 */
function addLinkedDocument(filenames) {
  // NOTE: this works in subcase view, untested in agendaitem view
  cy.intercept('GET', 'pieces').as('createNewPiece');
  cy.intercept('GET', '/pieces?page**').as('getPiecesList');
  cy.log('addLinkedDocument');
  cy.get(document.linkedDocuments.add).click();
  cy.wait('@getPiecesList');
  cy.get(document.addExistingPiece.searchInput).click();

  filenames.forEach((name) => {
    cy.intercept('GET', `pieces?filter**${encodeURIComponent(name)}**`).as(`getFilteredPiece${name}`);
    cy.get(document.addExistingPiece.searchInput).clear()
      .type(name)
      .wait(`@getFilteredPiece${name}`);
    // For every char typed, a call to "/pieces?filter" occurs, causing constant reloads of the dom.
    cy.wait(1000);
    cy.get(document.addExistingPiece.checkbox).parent()
      .click();
  });
  cy.intercept('PATCH', '/subcases/*').as('patchSubcase');
  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.wait('@patchSubcase');
  cy.log('/addLinkedDocument');
}

/**
 * @description delete a piece in the history view of a document-card by using the index
 * @name deleteSinglePiece
 * @memberOf Cypress.Chainable#
 * @function
 * @param String fileName - The exact name of the file (as seen in document-card title)
 * @param Number indexToDelete - The index of the piece in the list
 */
function deleteSinglePiece(fileName, indexToDelete) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('DELETE', 'pieces/*').as(`deletePiece${randomInt}`);
  cy.intercept('PUT', '/agendaitems/**/pieces/restore').as(`putRestoreAgendaitems${randomInt}`);
  cy.log('deleteSinglePiece');

  cy.get(document.documentCard.name.value).contains(fileName)
    .parents(document.documentCard.card)
    .within(() => {
      cy.get(document.documentCard.versionHistory)
        .find(auk.accordion.header.button)
        .click();
      cy.get(document.vlDocument.piece).eq(indexToDelete)
        .find(document.vlDocument.delete)
        .click();
    });

  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.wait(`@deletePiece${randomInt}`, {
    timeout: 40000,
  }).wait(`@putRestoreAgendaitems${randomInt}`);
  cy.wait(2000);
  cy.log('/deleteSinglePiece');
}

/**
 * @description delete a piece row from the document batch editing view
 * @name deletePieceBatchEditRow
 * @memberOf Cypress.Chainable#
 * @function
 * @param String fileName - The exact name of the file (as seen in document-card title)
 * @param Number indexToDelete - The index of the row in the list
 */
function deletePieceBatchEditRow(fileName, indexToDelete, editSelector) {
  cy.log('deletePieceBatchEditRow');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('DELETE', 'pieces/*').as(`deletePiece${randomInt}`);
  cy.intercept('PUT', '/agendaitems/**/pieces/restore').as(`putRestoreAgendaitems${randomInt}`);
  cy.get(editSelector).click();
  cy.get(appuniversum.loader);
  cy.get(appuniversum.loader).should('not.exist');
  cy.get(document.documentDetailsRow.row).as('documentRows');
  cy.get('@documentRows').eq(indexToDelete)
    .find(document.documentDetailsRow.input)
    .should('have.value', fileName); // check if name matches
  cy.get('@documentRows').eq(indexToDelete)
    .find(document.documentDetailsRow.delete)
    .click();
  cy.get('@documentRows').eq(indexToDelete)
    .find(document.documentDetailsRow.undoDelete);
  cy.get(document.batchDocumentsDetails.save).click();
  cy.wait(`@deletePiece${randomInt}`, {
    timeout: 40000,
  }).wait(`@putRestoreAgendaitems${randomInt}`);
  cy.wait(2000);
  cy.log('/deletePieceBatchEditRow');
}

// ***********************************************
// Commands

Cypress.Commands.add('addNewDocumentsInUploadModal', addNewDocumentsInUploadModal);
Cypress.Commands.add('addDocumentsToSubcase', addDocumentsToSubcase); // same code, goes to reverse tab to add docs
Cypress.Commands.add('addDocumentsToMeeting', addDocumentsToMeeting);
Cypress.Commands.add('addDocumentToTreatment', addDocumentToTreatment);
Cypress.Commands.add('addDocumentsToAgendaitem', addDocumentsToAgendaitem);
Cypress.Commands.add('addDocumentsToApprovalItem', addDocumentsToApprovalItem);
Cypress.Commands.add('addNewPiece', addNewPiece);
Cypress.Commands.add('addNewPieceToMeeting', addNewPieceToMeeting);
Cypress.Commands.add('addNewPieceToAgendaitem', addNewPieceToAgendaitem);
Cypress.Commands.add('addNewPieceToApprovalItem', addNewPieceToApprovalItem);
Cypress.Commands.add('addNewPieceToSubcase', addNewPieceToSubcase);
Cypress.Commands.add('addNewPieceToDecision', addNewPieceToDecision);
Cypress.Commands.add('addNewPieceToGeneratedDecision', addNewPieceToGeneratedDecision);
Cypress.Commands.add('uploadFile', uploadFile);
Cypress.Commands.add('openAgendaitemDocumentTab', openAgendaitemDocumentTab);
Cypress.Commands.add('openAgendaitemDossierTab', openAgendaitemDossierTab);
Cypress.Commands.add('addLinkedDocument', addLinkedDocument);
Cypress.Commands.add('deleteSinglePiece', deleteSinglePiece);
Cypress.Commands.add('deletePieceBatchEditRow', deletePieceBatchEditRow);
