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
  cy.route('POST', 'document-versions').as('createNewDocumentVersion');
  cy.route('POST', 'documents').as('createNewDocument');
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

  cy.wait('@createNewDocumentVersion', {
    timeout: 24000,
  });
  cy.wait('@createNewDocument', {
    timeout: 24000,
  });
  cy.wait('@patchModel', {
    timeout: 12000 + (6000 * files.length),
  });
  cy.get(modal.modalDialog).should('not.exist');
  cy.log('/addDocuments');
}

/**
 * @description Opens the new document version dialog and adds the file.
 * @name addNewDocumentVersion
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} oldFileName - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} file - The name of the file without the extension
 */
function addNewDocumentVersion(oldFileName, file, modelToPatch) {
  cy.log('addNewDocumentVersion');
  cy.route('POST', 'document-versions').as('createNewDocumentVersion');
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems' || modelToPatch === 'subcases') {
      cy.route('PATCH', '/subcases/**').as('patchSubcase');
      cy.route('PATCH', '/agendaitems/**').as('patchAgendaitem');
      cy.route('PUT', '/agendaitems/**/document-versions').as('putAgendaitemDocuments');
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
    .parents('.vlc-document-card')
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentUploadShowMore).click();
  });
  cy.get(document.documentUploadNewVersion)
    .should('be.visible')
    .click();

  cy.get(modal.baseModal.dialogWindow).as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.modalDocumentVersionUploadedFilename).should('contain', file.fileName);
  });
  cy.wait(1000); // Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(form.formSave).click();
  });
  cy.wait('@createNewDocumentVersion', {
    timeout: 12000,
  });

  // for agendaitems and subcases both are patched, not waiting causes flaky tests
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems') {
      cy.wait('@patchSubcase', {
        timeout: 12000,
      }).wait('@patchAgendaitem', {
        timeout: 12000,
      }).wait('@putAgendaitemDocuments', {
        timeout: 12000,
      });
    } else if (modelToPatch === 'subcases') {
      cy.wait('@putAgendaitemDocuments', {
        timeout: 12000,
      }).wait('@patchAgendaitem', {
        timeout: 12000,
      }).wait('@patchSubcase', {
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

  cy.log('/addNewDocumentVersion');
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
 * @description Add a new documentversion to an meeting.
 * @name addNewDocumentVersionToMeeting
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} oldFileName
 * @param {string} file
 */
function addNewDocumentVersionToMeeting(oldFileName, file) {
  cy.log('addNewDocumentVersionToMeeting');
  cy.clickReverseTab('Documenten');
  return addNewDocumentVersion(oldFileName, file, 'meetings');
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
 * @description Add a new documentversion to an agendaitem
 * @name addNewDocumentVersionToAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemTitle
 * @param {string} oldFileName
 * @param {string} file
 */
function addNewDocumentVersionToAgendaitem(agendaitemTitle, oldFileName, file) {
  cy.log('addNewDocumentVersionToAgendaitem');
  openAgendaitemDocumentTab(agendaitemTitle, true);
  return addNewDocumentVersion(oldFileName, file, 'agendaitems');
}

/**
 * @description Add a new documentversion to a subcase
 * @name addNewDocumentVersionToSubcase
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} oldFileName
 * @param {string} file
 */
function addNewDocumentVersionToSubcase(oldFileName, file) {
  cy.log('addNewDocumentVersionToSubcase');
  cy.clickReverseTab('Documenten');
  return addNewDocumentVersion(oldFileName, file, 'subcases');
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
function uploadFile(folder, fileName, extension) {
  cy.log('uploadFile');
  cy.route('POST', 'files').as('createNewFile');
  cy.route('GET', 'files/**').as('getNewFile');

  const fileFullName = `${fileName}.${extension}`;
  const filePath = `${folder}/${fileFullName}`;
  // TODO pdf is uploaded but all pages are blank, encoding issue? Irrelevant for test
  // let mimeType = 'text/plain';
  // if(extension == 'pdf'){
  //   mimeType = 'application/pdf';
  // }

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
 * @description Opens the new document version dialog and adds the file when it is a signed document.
 * @name addNewDocumentVersionToSignedDocument
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} oldFileName - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} file - The name of the file without the extension
 */
function addNewDocumentVersionToSignedDocument(oldFileName, file) {
  cy.log('addNewDocumentVersionToSignedDocument');
  cy.route('POST', 'document-versions').as('createNewDocumentVersion');

  cy.get('.vlc-document-card__content .vl-title--h6', {
    timeout: 12000,
  })
    .contains(oldFileName, {
      timeout: 12000,
    })
    .parents('.vlc-document-card')
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get(document.documentUploadShowMore).click();
  });
  cy.get(document.documentUploadNewVersion)
    .should('be.visible')
    .click();

  cy.get(modal.baseModal.dialogWindow).as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.modalDocumentVersionUploadedFilename).should('contain', file.fileName);
  });
  cy.wait(1000); // Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(form.formSave).click();
  });
  cy.wait('@createNewDocumentVersion', {
    timeout: 12000,
  });
  cy.log('/addNewDocumentVersionToSignedDocument');
}

/**
 * @description Adds documents to the already delivered documents list
 * @name addLinkedDocumentToAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String[]} filenames - The relative path to the file in the cypress/fixtures folder excluding the fileName
 */
function addLinkedDocumentToAgendaitem(filenames) {
  cy.route('GET', 'document-versions').as('createNewDocumentVersion');
  cy.log('addLinkedDocumentToAgendaitem');
  cy.get(document.addLinkedDocuments).click();
  cy.get(document.searchForLinkedDocumentsInput).click();

  filenames.forEach((name) => {
    cy.get(document.searchForLinkedDocumentsInput).type(name);
    cy.wait(200);
    cy.get('.vl-modal .data-table input[data-test-vl-checkbox]').click({
      force: true,
    });
    cy.get(document.searchForLinkedDocumentsInput).clear();
  });
  cy.get(form.formSave).click();
}

Cypress.Commands.add('addDocuments', addDocumentsToAgenda);
Cypress.Commands.add('addDocumentsToAgenda', addDocumentsToAgenda);
Cypress.Commands.add('addDocumentsToAgendaitem', addDocumentsToAgendaitem);
Cypress.Commands.add('addNewDocumentVersion', addNewDocumentVersion);
Cypress.Commands.add('addNewDocumentVersionToMeeting', addNewDocumentVersionToMeeting);
Cypress.Commands.add('addNewDocumentVersionToAgendaitem', addNewDocumentVersionToAgendaitem);
Cypress.Commands.add('addNewDocumentVersionToSubcase', addNewDocumentVersionToSubcase);
Cypress.Commands.add('addNewDocumentVersionToSignedDocument', addNewDocumentVersionToSignedDocument);
Cypress.Commands.add('uploadFile', uploadFile);
Cypress.Commands.add('uploadUsersFile', uploadUsersFile);
Cypress.Commands.add('openAgendaitemDocumentTab', openAgendaitemDocumentTab);
Cypress.Commands.add('openAgendaitemDossierTab', openAgendaitemDossierTab);
Cypress.Commands.add('addLinkedDocumentToAgendaitem', addLinkedDocumentToAgendaitem);
