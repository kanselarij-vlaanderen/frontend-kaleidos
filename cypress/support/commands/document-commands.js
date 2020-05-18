/*global cy, Cypress*/
/// <reference types="Cypress" />

import 'cypress-file-upload';
import document from '../../selectors/document.selectors';

import agenda  from '../../selectors/agenda.selectors';
import form  from '../../selectors/form.selectors';
import modal  from '../../selectors/modal.selectors';
// ***********************************************
// Commands

Cypress.Commands.add('addDocuments', addDocumentsToAgenda);
Cypress.Commands.add('addDocumentsToAgenda', addDocumentsToAgenda);
Cypress.Commands.add('addDocumentsToAgendaItem', addDocumentsToAgendaItem);
Cypress.Commands.add('addNewDocumentVersion', addNewDocumentVersion);
Cypress.Commands.add('addNewDocumentVersionToMeeting', addNewDocumentVersionToMeeting);
Cypress.Commands.add('addNewDocumentVersionToAgendaItem', addNewDocumentVersionToAgendaItem);
Cypress.Commands.add('addNewDocumentVersionToSubcase', addNewDocumentVersionToSubcase);
Cypress.Commands.add('addNewDocumentVersionToSignedDocument', addNewDocumentVersionToSignedDocument);
Cypress.Commands.add('uploadFile', uploadFile);
Cypress.Commands.add('uploadUsersFile', uploadUsersFile);
Cypress.Commands.add('openAgendaItemDocumentTab', openAgendaItemDocumentTab);
Cypress.Commands.add('openAgendaItemDossierTab', openAgendaItemDossierTab);


// ***********************************************
// Functions

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
  return addNewDocumentVersion(oldFileName, file, 'meetings')
}

/**
 * @description Add a new document to an agendaitem.
 * @name addDocumentsToAgendaItem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaItemTitle
 * @param {string} files
 * @param {boolean} isDetailView
 */
function addDocumentsToAgendaItem(agendaItemTitle, files,isDetailView=false) {
  cy.log('addDocumentsToAgendaItem');
  openAgendaItemDocumentTab(agendaItemTitle,false,isDetailView);
  return addDocuments(files)
}

/**
 * @description Add a new documentversion to an agendaitem
 * @name addNewDocumentVersionToAgendaItem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaItemTitle
 * @param {string} oldFileName
 * @param {string} file
 * @param {boolean} isDetailView
 */
function addNewDocumentVersionToAgendaItem(agendaItemTitle, oldFileName, file,isDetailView = false) {
  cy.log('addNewDocumentVersionToAgendaItem');
  openAgendaItemDocumentTab(agendaItemTitle, true,isDetailView);
  return addNewDocumentVersion(oldFileName, file, 'agendaitems')
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
  return addNewDocumentVersion(oldFileName, file, 'subcases')
}

/**
 * @description Opens agendaitem with agendaitemTitle and clicks the document link.
 * @name openAgendaItemDocumentTab
 * @memberOf Cypress.Chainable#.
 * @function
 * @param {string} agendaItemTitle
 * @param {boolean} alreadyHasDocs
 */
function openAgendaItemDocumentTab(agendaItemTitle, alreadyHasDocs = false, isDetailView = false) {
  cy.log('openAgendaItemDocumentTab');
  // cy.route('GET', 'documents**').as('getDocuments');
  if(isDetailView) {
    cy.get(agenda.agendaDetailSidebarSubitem)
      .contains(agendaItemTitle)
      .click()
      .wait(2000); // sorry
  } else {
    cy.openDetailOfAgendaitem(agendaItemTitle);
  }
  cy.get(agenda.agendaItemDocumentsTab)
    .click()
    .wait(2000); //Access-levels GET occured earlier, general wait instead
  if (alreadyHasDocs) {
    // cy.wait('@getDocuments')
    cy.wait(2000); //documents GET occured earlier, general wait instead
  }
  cy.log('/openAgendaItemDocumentTab');
}

/**
 * @description Opens agendaitem with agendaitemTitle and clicks the document link.
 * @name openAgendaItemDossierTab
 * @memberOf Cypress.Chainable#.
 * @function
 * @param {string} agendaItemTitle
 * @param {boolean} alreadyHasDocs
 */
function openAgendaItemDossierTab(agendaItemTitle) {
  cy.log('openAgendaItemDossierTab');
  // cy.route('GET', 'documents**').as('getDocuments');
  cy.openDetailOfAgendaitem(agendaItemTitle);
  cy.get(agenda.agendaItemDossierTab)
    .click()
    .wait(100); //Access-levels GET occured earlier, general wait instead
  cy.log('/openAgendaItemDossierTab');
}

/**
 * @description Opens the document add dialog and adds each file in the files array
 * @name addDocuments
 * @memberOf Cypress.Chainable#
 * @function
 * @param {{folder: String, fileName: String, fileExtension: String, [newFileName]: String, [fileType]: String}[]} files
 */
function addDocuments(files) {
  cy.log('addDocuments');
  cy.route('GET', 'document-types?**').as('getDocumentTypes');
  cy.route('POST', 'document-versions').as('createNewDocumentVersion');
  cy.route('POST', 'documents').as('createNewDocument');
  cy.route('PATCH', '**').as('patchModel');

  cy.contains('Documenten toevoegen').click();
  cy.get('.vl-modal-dialog').as('fileUploadDialog');

  files.forEach((file, index) => {
    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);

      cy.get('.vl-uploaded-document', { timeout: 10000 }).should('have.length', index+1).eq(index).within(() => {
        if(file.newFileName) {
          cy.get('.vlc-input-field-block').eq(0).within(() => {
            cy.get('.vl-input-field').clear().type(file.newFileName);
          });
        }
      });
    });

    if(file.fileType) {
      cy.get('@fileUploadDialog').within(() => {
        cy.get('.vl-uploaded-document').eq(index).within(() => {
          cy.get('.vlc-input-field-block').eq(1).within(() => {
            cy.get('.ember-power-select-trigger').click();
            cy.wait('@getDocumentTypes', { timeout: 12000 });
          });
        });
      });
      cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
        cy.contains(file.fileType).click();
      });
    }
  });
  cy.get('@fileUploadDialog').within(() => {
    cy.get('.vl-button').contains('Documenten toevoegen').click();
  });

  cy.wait('@createNewDocumentVersion', { timeout: 12000 });
  cy.wait('@createNewDocument', { timeout: 12000 });
  cy.wait('@patchModel', { timeout: 12000  + 6000 * files.length });
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
    if(modelToPatch === 'agendaitems' || modelToPatch === 'subcases') {
      cy.route('PATCH', `/subcases/**`).as('patchSubcase');
      cy.route('PATCH', `/agendaitems/**`).as('patchAgendaitem');
    } else {
      cy.route('PATCH', `/${modelToPatch}/**`).as('patchSpecificModel');
    }
  } else {
    cy.route('PATCH', '**').as('patchAnyModel');
  }

  cy.get('.vlc-document-card__content .vl-title--h6', { timeout: 12000 })
    .contains(oldFileName, { timeout: 12000 })
    .parents('.vlc-document-card').as('documentCard');

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
  cy.wait(1000); //Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(form.formSave).click();
  });
  cy.wait('@createNewDocumentVersion', { timeout: 12000 });


  // for agendaitems and subcases both are patched, not waiting causes flaky tests
  if (modelToPatch) {
    if (modelToPatch === 'agendaitems') {
      cy.wait('@patchSubcase', { timeout: 12000 }).wait('@patchAgendaitem', { timeout: 12000 });
    } else if(modelToPatch === 'subcases') {
      cy.wait('@patchAgendaitem', { timeout: 12000 }).wait('@patchSubcase', { timeout: 12000 });
    } else {
      cy.wait('@patchSpecificModel', { timeout: 12000 });
    }
  } else {
    cy.wait('@patchAnyModel', { timeout: 12000 });
  }
  cy.log('/addNewDocumentVersion');
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

  const fileFullName = fileName + '.' + extension;
  const filePath = folder + '/' + fileFullName;
  //TODO pdf is uploaded but all pages are blank, encoding issue? Irrelevant for test
  // let mimeType = 'text/plain';
  // if(extension == 'pdf'){
  //   mimeType = 'application/pdf';
  // }

  cy.fixture(filePath).then(fileContent => {
    cy.get('[type=file]').upload(
        {fileContent, fileName: fileFullName, mimeType: 'application/pdf'},
        {uploadType: 'input'},
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
  cy.route('GET', 'users?**').as('getNewFile');
  const fileFullName = fileName + '.' + extension;
  const filePath = folder + '/' + fileFullName;

  cy.fixture(filePath).then(fileContent => {
    cy.get('[type=file]').upload(
      {fileContent, fileName: fileFullName, mimeType: 'application/pdf'},
      {uploadType: 'input'},
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

  cy.get('.vlc-document-card__content .vl-title--h6', { timeout: 12000 })
    .contains(oldFileName, { timeout: 12000 })
    .parents('.vlc-document-card').as('documentCard');

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
  cy.wait(1000); //Cypress is too fast

  cy.get('@fileUploadDialog').within(() => {
    cy.get(form.formSave).click();
  });
  cy.wait('@createNewDocumentVersion', { timeout: 12000 });
  cy.log('/addNewDocumentVersionToSignedDocument');
}
