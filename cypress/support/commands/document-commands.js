/* global cy, Cypress */
// / <reference types="Cypress" />

import 'cypress-file-upload';
import document from '../../selectors/document.selectors';

import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import modal from '../../selectors/modal.selectors';
// ***********************************************

// ***********************************************
// Functions

/**
 * @description Opens the document add dialog and adds each file in the files array
 * @name addDocuments
 * @memberOf Cypress.Chainable#
 * @function
 * @param {{folder: String, fileName: String, fileExtension: String, [newFileName]: String, [fileType]: String}[]} files
 */
function addDocuments(files) {
  cy.log('addDocuments');
  cy.route('POST', 'pieces').as('createNewPiece');
  cy.route('POST', 'document-containers').as('createNewDocumentContainer');
  cy.route('PATCH', '**').as('patchModel');

  cy.contains('Documenten toevoegen').click();
  cy.get('.vl-modal-dialog').as('fileUploadDialog');

  files.forEach((file, index) => {
    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);

      cy.get('.vl-uploaded-document', {
        timeout: 10000,
      }).should('have.length', index + 1)
        .eq(index)
        .within(() => {
          if (file.newFileName) {
            cy.get('.vlc-input-field-block').eq(0)
              .within(() => {
                cy.get('.vl-input-field').clear()
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
            cy.get('.vlc-input-field-block').eq(1)
              .within(($t) => {
                if ($t.find(`input[type="radio"][value="${file.fileType}"]`).length) {
                  cy.get('input[type="radio"]').check(file.fileType, {
                    force: true,
                  }); // CSS has position:fixed, which cypress considers invisible
                } else {
                  cy.get('input[type="radio"][value="Andere"]').check({
                    force: true,
                  });
                  cy.get('.ember-power-select-trigger')
                    .click()
                    .parents('body')
                    .within(() => {
                      cy.get('.ember-power-select-option', {
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
  cy.get('@fileUploadDialog').within(() => {
    cy.get('.vl-button').contains('Documenten toevoegen')
      .click();
  });

  cy.wait('@createNewPiece', {
    timeout: 24000,
  });
  cy.wait('@createNewDocumentContainer', {
    timeout: 24000,
  });
  cy.wait('@patchModel', {
    timeout: 12000 + (6000 * files.length),
  });
  cy.get(modal.modalDialog).should('not.exist');
  cy.log('/addDocuments');
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
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems' || modelToPatch === 'subcases') {
      cy.route('PATCH', '/subcases/**').as('patchSubcase');
      cy.route('PATCH', '/agendaitems/**').as('patchAgendaitem');
      cy.route('PUT', '/agendaitems/**/pieces').as('putAgendaitemDocuments');
    } else {
      cy.route('PATCH', `/${modelToPatch}/**`).as('patchSpecificModel');
    }
  } else {
    cy.route('PATCH', '**').as('patchAnyModel');
  }

  cy.get('.vlc-document-card__content .vl-title--h6', {
    timeout: 12000,
  })
    .contains(oldFileName, {
      timeout: 12000,
    })
    .parents(document.documentCard)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentUploadShowMore).click();
    cy.get(document.documentUploadNewPiece)
      .should('be.visible')
      .click();
  });

  cy.get(modal.baseModal.dialogWindow).as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.modalPieceUploadedFilename).should('contain', file.fileName);
  });
  cy.wait(1000); // Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(form.formSave).click()
      .wait(`@createNewPiece_${randomInt}`, {
        timeout: 12000,
      });
  });

  // for agendaitems and subcases both are patched, not waiting causes flaky tests
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems') {
      cy.wait('@patchSubcase', {
        timeout: 12000,
      }).wait('@patchAgendaitem', {
        timeout: 12000,
      })
        .wait('@putAgendaitemDocuments', {
          timeout: 12000,
        });
    } else if (modelToPatch === 'subcases') {
      cy.wait('@putAgendaitemDocuments', {
        timeout: 12000,
      }).wait('@patchAgendaitem', {
        timeout: 12000,
      })
        .wait('@patchSubcase', {
          timeout: 12000,
        });
    } else {
      cy.wait('@patchSpecificModel', {
        timeout: 12000,
      });
    }
  } else {
    cy.wait('@patchAnyModel', {
      timeout: 12000,
    });
  }
  cy.wait(1000); // Cypress is too fast

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
  return addDocuments(files);
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
  cy.get(agenda.agendaitemDecisionTab).click();
  // 1 default item treatment exists
  cy.get(agenda.uploadDecisionFile).click();

  cy.contains('Document opladen').click();
  cy.get(modal.baseModal.dialogWindow).as('fileUploadDialog');

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
  return addNewPiece(oldFileName, file, 'meetings');
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
  cy.get(agenda.agendaitemDocumentsTab)
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
  addDocuments(files); // patch to subcase happens here (1 patchModel is checked)
  cy.wait('@patchModel', { // patch to agendaitems also happens, patch route is defined in addDocuments
    timeout: 12000 + (6000 * files.length),
  });
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
  cy.get(agenda.agendaitemDossierTab)
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

  cy.get('.vlc-document-card__content .vl-title--h6', {
    timeout: 12000,
  })
    .contains(oldFileName, {
      timeout: 12000,
    })
    .parents(document.documentCard)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentUploadShowMore).click();
    cy.get(document.documentUploadNewPiece)
      .should('be.visible')
      .click();
  });

  cy.get(modal.baseModal.dialogWindow).as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.modalPieceUploadedFilename).should('contain', file.fileName);
  });
  cy.wait(1000); // Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(form.formSave).click();
  });
  cy.wait(`@createNewPiece_${randomInt}`, {
    timeout: 12000,
  });
  cy.log('/addNewPieceToSignedDocumentContainer');
}

/**
 * @description Adds documents to the already delivered documents list
 * @name addLinkedDocumentToAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String[]} filenames - The relative path to the file in the cypress/fixtures folder excluding the fileName
 */
function addLinkedDocumentToAgendaitem(filenames) {
  cy.route('GET', 'pieces').as('createNewPiece');
  cy.log('addLinkedDocumentToAgendaitem');
  cy.get(document.addLinkedDocuments).click();
  cy.get(document.searchForLinkedDocumentsInput).click();

  filenames.forEach((name) => {
    cy.get(document.searchForLinkedDocumentsInput).type(name);
    cy.wait(200);
    cy.get('.vl-modal .data-table [data-test-vl-checkbox-label]').click({
      force: true,
    });
    cy.get(document.searchForLinkedDocumentsInput).clear();
  });
  cy.get(form.formSave).click();
  cy.log('/addLinkedDocumentToAgendaitem');
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

  cy.get('.vlc-document-card__content .vl-title--h6', {
    timeout: 12000,
  })
    .contains(fileName, {
      timeout: 12000,
    })
    .parents(document.documentCard)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.showPiecesHistory).click();
    cy.get(document.singlePieceHistory).eq(indexToDelete)
      .within(() => {
        cy.get(document.deletePieceFromhistory)
          .should('be.visible')
          .click();
      });
  });

  cy.get(modal.modal).within(() => {
    cy.get('button').contains('Verwijderen')
      .click();
  });
  cy.wait('@deletePiece', {
    timeout: 20000,
  }).wait('@putRestoreAgendaitems', {
    timeout: 20000,
  });
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

  cy.get('.vlc-document-card__content .vl-title--h6', {
    timeout: 12000,
  })
    .contains(fileName, {
      timeout: 12000,
    })
    .parents(document.documentCard)
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.showPiecesHistory).click();
    cy.get(document.singlePieceHistory).eq(indexToCheck)
      .within(() => {
        if (shouldBeDeletable) {
          cy.get(document.deletePieceFromhistory).should('be.visible');
        } else {
          cy.get(document.deletePieceFromhistory).should('not.exist');
        }
      });
  });

  cy.log('/isPieceDeletable');
}

/**
 * Add an extra version.
 *
 * @param file object.
 */
function addExtraDocumentVersion(file) {
  cy.log('addExtraDocumentVersion');
  cy.get('[data-test-documents-show-more]').click();
  cy.server();
  cy.route('/subcases?**').as('subcasesExtraFileversionupload');
  cy.get('[data-test-document-upload-new-piece]').click();
  cy.wait('@subcasesExtraFileversionupload');

  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.route('POST', 'pieces').as(`createNewPiece_${randomInt}`);

  cy.route('PATCH', '**').as('patchModel');

  cy.get('.vl-modal-dialog').as('fileUploadDialog');
  cy.get('@fileUploadDialog').within(() => {
    const index = 0;
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get('.vl-uploaded-document', {
      timeout: 10000,
    }).should('have.length', index + 1);
  });

  cy.get('@fileUploadDialog').within(() => {
    cy.get('.vl-button').contains('Toevoegen')
      .click();
  });

  cy.wait(`@createNewPiece_${randomInt}`, {
    timeout: 24000,
  });

  cy.get(modal.modalDialog).should('not.exist');
  cy.wait('@patchModel', {
    timeout: 12000 + (6000 * 1),
  });

  cy.get(modal.modalDialog).should('not.exist');
  cy.wait(3000);
  cy.log('/addExtraDocumentVersion');
}

Cypress.Commands.add('addDocuments', addDocuments);
Cypress.Commands.add('addExtraDocumentVersion', addExtraDocumentVersion);
Cypress.Commands.add('addDocumentsToSubcase', addDocumentsToAgenda); // same code, goes to reverse tab to add docs
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
Cypress.Commands.add('addLinkedDocumentToAgendaitem', addLinkedDocumentToAgendaitem);
Cypress.Commands.add('deleteSinglePiece', deleteSinglePiece);
Cypress.Commands.add('isPieceDeletable', isPieceDeletable);
