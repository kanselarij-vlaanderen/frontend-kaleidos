
/* eslint-disable no-undef */
import 'cypress-file-upload';
// ***********************************************
// Commands

Cypress.Commands.add('addDocuments', addDocumentsToAgenda);
Cypress.Commands.add('addDocumentsToAgenda', addDocumentsToAgenda);
Cypress.Commands.add('addDocumentsToAgendaItem', addDocumentsToAgendaItem);
Cypress.Commands.add('addNewDocumentVersion', addNewDocumentVersionToAgenda);
Cypress.Commands.add('addNewDocumentVersionToAgenda', addNewDocumentVersionToAgenda);
Cypress.Commands.add('addNewDocumentVersionToAgendaItem', addNewDocumentVersionToAgendaItem);
Cypress.Commands.add('uploadFile', uploadFile);

// ***********************************************
// Functions

function addDocumentsToAgenda(files) {
  cy.clickReverseTab('Documenten');
  return addDocuments(files)
}

function addNewDocumentVersionToAgenda(oldFileName, file) {
  cy.clickReverseTab('Documenten');
  return addNewDocumentVersion(oldFileName, file)
}

function addDocumentsToAgendaItem(agendaItemTitle, files) {
  openAgendaItemDocumentTab(agendaItemTitle);
  return addDocuments(files)
}

function addNewDocumentVersionToAgendaItem(agendaItemTitle, oldFileName, file) {
  openAgendaItemDocumentTab(agendaItemTitle, true);
  return addNewDocumentVersion(oldFileName, file)
}

function openAgendaItemDocumentTab(agendaItemTitle, alreadyHasDocs = false) {
  cy.route('GET', 'access-levels').as('getAccessLevels');
  cy.route('GET', 'documents**').as('getDocuments');
  cy.get('li.vlc-agenda-items__sub-item h4')
    .contains(agendaItemTitle)
    .click()
    .wait(2000); // sorry
  cy.get('.vl-tab > a.vl-tab__link')
    .contains('Documenten')
    .should('be.visible')
    .click()
    // .wait('@getAccessLevels');
    .wait(2000); //Access-levels GET occured earlier, general wait instead
  if (alreadyHasDocs) {
    // cy.wait('@getDocuments')
    cy.wait(2000); //documents GET occured earlier, general wait instead
  }
}

/**
 * Opens the document add dialog and adds each file in the files array
 *
 * @param {{folder: String, fileName: String, fileExtension: String, [newFileName]: String, [fileType]: String}[]} files
 *
 */
function addDocuments(files) {
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
  cy.wait('@patchModel', { timeout: 12000  + 2000 * files.length });
}

/**
 * Opens the new document version dialog and adds the file
 *
 * @param {{folder: String, fileName: String, fileExtension: String} file
 *
 */
function addNewDocumentVersion(oldFileName, file) {

  cy.route('GET', 'document-types?**').as('getDocumentTypes');
  cy.route('POST', 'document-versions').as('createNewDocumentVersion');
  cy.route('PATCH', '**').as('patchModel');

  cy.get('.vlc-document-card__content .vl-title--h6', { timeout: 12000 })
    .contains(oldFileName, { timeout: 12000 })
    .parents('.vlc-document-card').as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get('.vl-vi-nav-show-more-horizontal').click();
  });
  cy.get('.vl-link--block')
    .contains('Nieuwe versie uploaden', { timeout: 12000 })
    .should('be.visible')
    .click();

  cy.get('.vl-modal-dialog').as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
  });

  cy.get('@fileUploadDialog').within(() => {
    cy.get('.vl-button').contains('Toevoegen').click();
  });

  cy.wait('@createNewDocumentVersion', { timeout: 12000 });
  cy.wait('@patchModel', { timeout: 12000 });
}

/**
 * Uploads a file to an open document dialog window
 *
 * @param {String} folder - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} fileName - The name of the file without the extension
 * @param {String} extension - The extension of the file
 *
 */
function uploadFile(folder, fileName, extension) {
  cy.route('POST', 'files').as('createNewFile');

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
}
