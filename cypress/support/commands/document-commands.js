/* global cy, Cypress */
// / <reference types="Cypress" />

import 'cypress-file-upload';

import agenda from '../../selectors/agenda.selectors';
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
  cy.get('.auk-modal').as('fileUploadDialog');

  files.forEach((file, index) => {
    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);

      cy.get('.vl-uploaded-document', {
        timeout: 10000,
      }).should('have.length', index + 1)
        .eq(index)
        .within(() => {
          if (file.newFileName) {
            cy.get('.auk-form-group').eq(0)
              .within(() => {
                cy.get('.auk-input').clear()
                  .type(file.newFileName);
              });
          }
        });
    });

    if (file.fileType) {
      cy.get('@fileUploadDialog').within(() => {
        cy.get('.vl-uploaded-document').eq(index)
          .within(() => {
            cy.get('input[type="radio"]').should('exist'); // the radio buttons should be loaded before the within or the .length returns 0
            cy.get('.auk-form-group')
              .within(($t) => {
                if ($t.find(`input[type="radio"][value="${file.fileType}"]`).length) {
                  cy.get('input[type="radio"]').check(file.fileType, {
                    force: true,
                  }); // CSS has position:fixed, which cypress considers invisible
                } else {
                  cy.get('input[type="radio"][value="Andere"]').check({
                    force: true,
                  });
                  cy.get(dependency.emberPowerSelect.trigger)
                    .click()
                    .parents('body')
                    .within(() => {
                      cy.get(dependency.emberPowerSelect.option, {
                        timeout: 5000,
                      }).should('exist')
                        .then(() => {
                          cy.contains(file.fileType).click(); // Match is not exact, ex. fileType "Advies" yields "Advies AgO" instead of "Advies"
                        });
                    });
                }
              });
          });
      });
    }
  });
  // Click save
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.route('POST', 'pieces').as('createNewPiece');
  cy.route('POST', 'document-containers').as('createNewDocumentContainer');
  cy.route('POST', 'submission-activities').as('createNewSubmissionActivity');
  cy.route('GET', '/submission-activities?filter**').as(`getSubmissionActivity_${randomInt}`);
  cy.route('GET', `/pieces?filter\\[${model}\\]\\[:id:\\]=*`).as(`loadPieces${model}`);
  cy.get('@fileUploadDialog').within(() => {
    cy.get('.auk-button').contains('Documenten toevoegen')
      .click();
  });
  cy.wait('@createNewDocumentContainer', {
    timeout: 24000,
  });
  cy.wait('@createNewPiece', {
    timeout: 24000,
  });
  // TODO seperate command for subcase / split this command / do calls in higher commands
  // Pieces are loaded differently in the subcase/documents route
  if (model === 'subcase') {
    cy.wait('@createNewSubmissionActivity', {
      timeout: 24000 + (6000 * files.length),
    }).wait(`@getSubmissionActivity_${randomInt}`, {
      timeout: 24000,
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
function addNewPiece(oldFileName, file, modelToPatch) {
  cy.log('addNewPiece');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.route('POST', 'pieces').as(`createNewPiece_${randomInt}`);
  cy.route('GET', '/pieces?filter**').as(`loadPieces_${randomInt}`);
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems' || modelToPatch === 'subcases') {
      cy.route('GET', '/submission-activities?filter**').as('getSubmissionActivity');
      cy.route('POST', '/submission-activities').as('createNewSubmissionActivity');
      cy.route('PATCH', '/agendaitems/**').as('patchAgendaitem');
      cy.route('PUT', '/agendaitems/**/pieces').as('putAgendaitemDocuments');
    } else {
      cy.route('PATCH', `/${modelToPatch}/**`).as('patchSpecificModel');
    }
  }

  cy.get('.vlc-document-card__content .auk-h4', {
    timeout: 12000,
  })
    .contains(oldFileName, {
      timeout: 12000,
    })
    .parents(document.documentCard.card)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentCard.actions).click();
    cy.get(document.documentCard.uploadPiece)
      .should('be.visible')
      .click();
  });

  cy.get(utils.vlModal.dialogWindow).as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.vlUploadedDocument.filename).should('contain', file.fileName);
  });
  cy.wait(1000); // Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(utils.vlModalFooter.save).click()
      .wait(`@createNewPiece_${randomInt}`, {
        timeout: 12000,
      });
  });

  // for agendaitems and subcases both are patched, not waiting causes flaky tests
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems') {
      // we always POST submission activity here
      cy.wait('@createNewSubmissionActivity', {
        timeout: 12000,
      })
        .wait('@patchAgendaitem', {
          timeout: 12000,
        })
        .wait('@putAgendaitemDocuments', {
          timeout: 12000,
        });
      // .wait('@getSubmissionActivity', {
      //   timeout: 12000,
      // });
    } else if (modelToPatch === 'subcases') {
      // TODO these 2 awaits don't happen for subcase not proposed for a meeting / no agenda-activity
      // cy.wait('@putAgendaitemDocuments', {
      //   timeout: 12000,
      // }).wait('@patchAgendaitem', {
      //   timeout: 12000,
      // });
      // TODO we POST OR PATCH submission activity
      // We always get the submission activities after post or patch
      cy.wait('@getSubmissionActivity', {
        timeout: 12000,
      });
    } else {
      cy.wait('@patchSpecificModel', {
        timeout: 12000,
      });
    }
  }
  cy.wait(`@loadPieces_${randomInt}`); // This call does not happen when loading subcase/documents route, but when loading the documents in that route
  cy.wait(1000); // Cypress is too fast
  // TODO Check if the modal is gone, had 1 flaky where the modal was still showing after the patches
  cy.log('/addNewPiece');
}

/**
 * @description Add document to agenda.
 * @name addDocumentsToAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string[]} files
 */
function addDocumentsToAgenda(files) {
  cy.log('addDocumentsToAgenda');
  cy.clickReverseTab('Documenten');
  cy.contains('Documenten toevoegen').click();
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
  cy.contains('Documenten toevoegen').click();
  return addNewDocumentsInUploadModal(files, 'subcase');
}

/**
 * @description Add document to agenda.
 * @name addDocumentToTreatment
 * @memberOf Cypress.Chainable#
 * @function
 * @param {} file
 */
function addDocumentToTreatment(file) {
  cy.log('addDocumentsToTreatment');
  cy.get(agenda.agendaitemNav.decisionTab).click();
  // 1 default item treatment exists
  cy.get(agenda.agendaitemDecision.uploadFile).click();

  cy.contains('Document opladen').click();
  cy.get(utils.vlModal.dialogWindow).as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
  });
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
function openAgendaitemDocumentTab(agendaitemTitle, alreadyHasDocs = false) {
  cy.log('openAgendaitemDocumentTab');
  cy.openDetailOfAgendaitem(agendaitemTitle);
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

  // Click save
  // Dont save here, save in the general cy.addNewDocumentsInUploadModal
  // cy.route('POST', 'pieces').as('createNewPiece');
  // cy.route('POST', 'document-containers').as('createNewDocumentContainer');
  // cy.route('GET', '/pieces?filter\\[agendaitem\\]\\[:id:\\]=*').as('loadPieces');
  // cy.get('@fileUploadDialog').within(() => {
  //   cy.get('.auk-button').contains('Documenten toevoegen')
  //     .click();
  // });
  // cy.wait('@createNewDocumentContainer', {
  //   timeout: 24000,
  // });
  // cy.wait('@createNewPiece', {
  //   timeout: 24000,
  // });
  // cy.wait('@loadPieces', {
  //   timeout: 24000 + (6000 * files.length),
  // });
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
  cy.route('POST', 'files').as('createNewFile');
  cy.route('GET', 'files/**').as('getNewFile');

  const fileFullName = `${fileName}.${extension}`;
  const filePath = `${folder}/${fileFullName}`;
  // TODO pdf is uploaded but all pages are blank, encoding issue? Irrelevant for test

  cy.fixture(filePath).then((fileContent) => {
    cy.get('[type=file]').upload(
      {
        fileContent,
        fileName: fileFullName,
        mimeType,
        encoding: 'utf-8',
      },
      {
        uploadType: 'input',
      }
    );
  });
  cy.wait('@createNewFile');
  cy.wait('@getNewFile');
  cy.log('/uploadFile');
}

/**
 * @description Uploads a csv file with users..
 * @name uploadUsersFile
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} folder - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} fileName - The name of the file without the extension
 * @param {String} extension - The extension of the file
 */
function uploadUsersFile(folder, fileName, extension) {
  cy.log('uploadUsersFile');
  cy.route('POST', 'user-management-service/import-users').as('createNewFile');
  cy.route('GET', 'users?include**').as('getNewFile');
  const fileFullName = `${fileName}.${extension}`;
  const filePath = `${folder}/${fileFullName}`;

  cy.fixture(filePath).then((fileContent) => {
    cy.get('[type=file]').upload(
      {
        fileContent, fileName: fileFullName, mimeType: 'application/pdf',
      },
      {
        uploadType: 'input',
      }
    );
  });
  cy.wait('@createNewFile');
  cy.wait('@getNewFile');
  cy.log('/uploadUsersFile');
}

/**
 * @description Opens the new piece dialog and adds the file when it is a signed document.
 * @name addNewPieceToSignedDocumentContainer
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} oldFileName - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} file - The name of the file without the extension
 */
function addNewPieceToSignedDocumentContainer(oldFileName, file) {
  cy.log('addNewPieceToSignedDocumentContainer');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.route('POST', 'pieces').as(`createNewPiece_${randomInt}`);

  cy.get('.vlc-document-card__content .auk-h4', {
    timeout: 12000,
  })
    .contains(oldFileName, {
      timeout: 12000,
    })
    .parents(document.documentCard.card)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentCard.actions).click();
    cy.get(document.documentCard.uploadPiece)
      .should('be.visible')
      .click();
  });

  cy.get(utils.vlModal.dialogWindow).as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.vlUploadedDocument.filename).should('contain', file.fileName);
  });
  cy.wait(1000); // Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(utils.vlModalFooter.save).click();
  });
  cy.wait(`@createNewPiece_${randomInt}`, {
    timeout: 12000,
  });
  cy.log('/addNewPieceToSignedDocumentContainer');
}

/**
 * @description Adds documents to the already delivered documents list
 * @name addLinkedDocument
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String[]} filenames - The relative path to the file in the cypress/fixtures folder excluding the fileName
 */
function addLinkedDocument(filenames) {
  // TODO, this works in subcase view, untested in agendaitem view
  cy.route('GET', 'pieces').as('createNewPiece');
  cy.log('addLinkedDocument');
  cy.get(document.linkedDocuments.add).click();
  cy.get(document.addExistingPiece.searchInput).click();

  filenames.forEach((name) => {
    cy.get(document.addExistingPiece.searchInput).type(name);
    cy.wait(1000);
    cy.get('.auk-modal .data-table [data-test-vl-checkbox-label]').click({
      force: true,
    });
    cy.get(document.addExistingPiece.searchInput).clear();
  });
  cy.get(utils.vlModalFooter.save).click();
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
  cy.route('DELETE', 'pieces/*').as('deletePiece');
  cy.route('PUT', '/agendaitems/**/pieces/restore').as('putRestoreAgendaitems');
  cy.log('deleteSinglePiece');

  cy.get('.vlc-document-card__content .auk-h4', {
    timeout: 12000,
  })
    .contains(fileName, {
      timeout: 12000,
    })
    .parents(document.documentCard.card)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).eq(indexToDelete)
      .within(() => {
        cy.get(document.vlDocument.delete)
          .should('be.visible')
          .click();
      });
  });

  cy.get(utils.vlModalVerify.container).within(() => {
    cy.get('button').contains('Verwijderen')
      .click();
  });
  cy.wait('@deletePiece', {
    timeout: 40000,
  }).wait('@putRestoreAgendaitems', {
    timeout: 20000,
  });
  cy.wait(2000); // TODO, wait for loadpieces to happen
  cy.log('/deleteSinglePiece');
}

/**
 * @description verifies if a piece in the history view of a document-card should be deletable (show icon)
 * @name isPieceDeletable
 * @memberOf Cypress.Chainable#
 * @function
 * @param String fileName - The exact name of the file (as seen in document-card title)
 * @param Number indexToCheck - The index of the piece in the list
 * @param Boolean shouldBeDeletable - True if icon should be shown
 */
function isPieceDeletable(fileName, indexToCheck, shouldBeDeletable) {
  cy.log('isPieceDeletable');

  cy.get('.vlc-document-card__content .auk-h4', {
    timeout: 12000,
  })
    .contains(fileName, {
      timeout: 12000,
    })
    .parents(document.documentCard.card)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentCard.versionHistory).click();
    cy.get(document.vlDocument.piece).eq(indexToCheck)
      .within(() => {
        if (shouldBeDeletable) {
          cy.get(document.vlDocument.delete).should('be.visible');
        } else {
          cy.get(document.vlDocument.delete).should('not.exist');
        }
      });
  });

  cy.log('/isPieceDeletable');
}

Cypress.Commands.add('addNewDocumentsInUploadModal', addNewDocumentsInUploadModal);
Cypress.Commands.add('addDocumentsToSubcase', addDocumentsToSubcase); // same code, goes to reverse tab to add docs
Cypress.Commands.add('addDocumentsToAgenda', addDocumentsToAgenda); // TODO rename to addDocumentsToMeeting
Cypress.Commands.add('addDocumentToTreatment', addDocumentToTreatment);
Cypress.Commands.add('addDocumentsToAgendaitem', addDocumentsToAgendaitem);
Cypress.Commands.add('addNewPiece', addNewPiece);
Cypress.Commands.add('addNewPieceToMeeting', addNewPieceToMeeting);
Cypress.Commands.add('addNewPieceToAgendaitem', addNewPieceToAgendaitem);
Cypress.Commands.add('addNewPieceToSubcase', addNewPieceToSubcase);
Cypress.Commands.add('addNewPieceToSignedDocumentContainer', addNewPieceToSignedDocumentContainer);
Cypress.Commands.add('uploadFile', uploadFile);
Cypress.Commands.add('uploadUsersFile', uploadUsersFile);
Cypress.Commands.add('openAgendaitemDocumentTab', openAgendaitemDocumentTab);
Cypress.Commands.add('openAgendaitemDossierTab', openAgendaitemDossierTab);
Cypress.Commands.add('addLinkedDocument', addLinkedDocument);
Cypress.Commands.add('deleteSinglePiece', deleteSinglePiece);
Cypress.Commands.add('isPieceDeletable', isPieceDeletable);
