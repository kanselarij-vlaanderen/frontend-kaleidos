/* global cy, Cypress */
// / <reference types="Cypress" />

import publication from '../../selectors/publication.selectors';
import dependency from '../../selectors/dependency.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';

// ***********************************************
// Functions

/**
 * @description fills in all the desired fields in the new publication modal.
 * @name fillInNewPublicationFields
 * @memberOf Cypress.Chainable#
 * @function
 * @param {number: Number, suffix: String, decisionDate: Object, receptionDate: Object, publicationDueDate: Object, shortTitle: String, longTitle: String} fields The fields for the case
 */
function fillInNewPublicationFields(fields) {
  cy.log('fillInNewPublicationFields');
  if (fields.number) {
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(fields.number);
  }
  if (fields.suffix) {
    cy.get(publication.newPublication.suffix).click()
      .type(fields.suffix);
  }
  if (fields.decisionDate) {
    cy.get(auk.datepicker.datepicker).eq(0)
      .click();
    cy.setDateInFlatpickr(fields.decisionDate);
  }
  if (fields.receptionDate) {
    cy.get(auk.datepicker.datepicker).eq(1)
      .click();
    cy.setDateInFlatpickr(fields.receptionDate);
  }
  // Limiet publicatie
  if (fields.publicationDueDate) {
    cy.get(auk.datepicker.datepicker).eq(2)
      .click();
    cy.setDateInFlatpickr(fields.publicationDueDate);
  }
  if (fields.shortTitle) {
    cy.get(publication.newPublication.shortTitle).click()
      .type(fields.shortTitle);
  }
  if (fields.longTitle) {
    cy.get(publication.newPublication.longTitle).click()
      .type(fields.longTitle);
  }
  cy.log('/fillInNewPublicationFields');
}

/**
 * @description Goes to the publication overview and creates a new publication.
 * @name createPublication
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Object} fields The field data for the case
 * @returns {Promise<String>} the id of the created publication-flow
 */
function createPublication(fields) {
  cy.log('createPublication');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('POST', '/cases').as('createNewCase');
  cy.intercept('POST', '/publication-flows').as(`createNewPublicationFlow${randomInt}`);

  cy.visit('publicaties');
  cy.get(publication.publicationsIndex.newPublication).click();
  cy.fillInNewPublicationFields(fields);
  let publicationFlowId;

  cy.get(publication.newPublication.create).click()
    .wait('@createNewCase')
    .wait(`@createNewPublicationFlow${randomInt}`)
    .its('response.body')
    .then((responseBody) => {
      publicationFlowId = responseBody.data.id;
      // Check if we transitioned to dossier page of the publication-flow
      cy.url().should('contain', `publicaties/${publicationFlowId}/dossier`);
    })
    .then(() => new Cypress.Promise((resolve) => {
      resolve({
        publicationFlowId,
      });
    }));
  // TODO-publication this cypress promise needs to be the last command executed, move cy.log higher
  cy.log('/createPublication');
}

/**
 * @description Create a publication Changes the status from a publication and gos back to overview)
 * @name createPublicationWithStatus
 * @memberOf Cypress.Chainable#
 * @function
 * @param {number: Number, suffix: String, decisionDate: Object, receptionDate: Object, publicationDueDate: Object, shortTitle: String, longTitle: String, newStatus: String} fields The data for the new publication
 */
function createPublicationWithStatus(fields) {
  // TODO-COMMAND unused command for now
  cy.createPublication(fields);
  cy.changePublicationStatus(fields.newStatus);
  cy.get(publication.publicationNav.goBack).click();
}

/**
 * @description Changes the status from a publication, used when in the view of an invididual publication (/publicaties/ID/...)
 * @name changePublicationStatus
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} newStatus The new status to selected
 */
function changePublicationStatus(newStatus) {
  // TODO-COMMAND unused command for now
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('PATCH', '/publication-flows/**').as(`patchPublicationFlow${randomInt}`);
  cy.intercept('POST', '/publication-status-changes').as(`postPublicationStatusChange${randomInt}`);
  cy.get(publication.statusPill.changeStatus).click();
  cy.get(publication.publicationStatus.select).click();
  cy.get(dependency.emberPowerSelect.option).contains(newStatus)
    .click();
  cy.get(publication.publicationStatus.save).click();
  cy.wait(`@patchPublicationFlow${randomInt}`);
  cy.wait(`@postPublicationStatusChange${randomInt}`);
}

/**
 * @description Opens the document add dialog and adds each file in the files array
 * @name addPublicationDocuments
 * @memberOf Cypress.Chainable#
 * @function
 * @param {{folder: String, fileName: String, fileExtension: String, [newFileName]: String, [fileType]: String}[]} files
 */
function addPublicationDocuments(files) {
  cy.log('addPublicationDocuments');
  cy.intercept('POST', 'pieces').as('createNewPiece');
  cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');

  // TODO This part can be reused in future tests

  cy.get(auk.modal.container).as('fileUploadDialog');

  files.forEach((file, index) => {
    cy.get('@fileUploadDialog').within(() => {
      if (file.extension === 'docx') {
        cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else {
        cy.uploadFile(file.folder, file.fileName, file.fileExtension);
      }
      cy.get('.vl-uploaded-document').should('have.length', index + 1)
        .eq(index)
        .within(() => {
          if (file.newFileName) {
            cy.get('.auk-form-group').eq(0)
              .find(appuniversum.input)
              .clear()
              .type(file.newFileName);
          }
        });
    });

    // TODO will need refactoring if the current uploader changes to a new design for publication
    if (file.fileType) {
      cy.get('@fileUploadDialog').within(() => {
        cy.get('.vl-uploaded-document').eq(index)
          .within(() => {
            cy.get('input[type="radio"]').should('exist'); // the radio buttons should be loaded before the within or the .length returns 0
            cy.get('.au-c-control-group')
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
                    .find(dependency.emberPowerSelect.option)
                    .contains(file.fileType)
                    .click(); // Match is not exact, ex. fileType "Advies" yields "Advies AgO" instead of "Advies"
                }
              });
          });
      });
    }
  });
  cy.get(auk.modal.footer).find(publication.documentsUpload.save)
    .click;

  cy.wait('@createNewPiece', {
    timeout: 24000,
  });
  cy.wait('@createNewDocumentContainer', {
    timeout: 24000,
  });
  // patching of model case no longer happens, piece.case is set instead
  cy.get('@fileUploadDialog').should('not.exist');
  cy.log('/addPublicationDocuments');
}

/**
 * @description Opens the publicationsIndex config and checks each unchecked columnKey in the columnKeyNames array
 * @name checkColumnsIfUnchecked
 * @memberOf Cypress.Chainable#
 * @function
 * @param {{columnKeyName: String}[]} columnKeyNames
 */
function checkColumnsIfUnchecked(columnKeyNames) {
  cy.get(publication.publicationsIndex.configIcon).click();
  columnKeyNames.forEach((columnKeyName) => {
    cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).invoke('prop', 'checked')
      .then((checked) => {
        if (!checked) {
          cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).parent(appuniversum.checkbox)
            .click();
        }
      });
  });
  cy.get(publication.tableDisplayConfig.close).forceClick(); // close button may be out of view top right
}

// ***********************************************
// Commands
Cypress.Commands.add('fillInNewPublicationFields', fillInNewPublicationFields);
Cypress.Commands.add('createPublication', createPublication);
Cypress.Commands.add('createPublicationWithStatus', createPublicationWithStatus);
Cypress.Commands.add('changePublicationStatus', changePublicationStatus);
Cypress.Commands.add('addPublicationDocuments', addPublicationDocuments);
Cypress.Commands.add('checkColumnsIfUnchecked', checkColumnsIfUnchecked);
