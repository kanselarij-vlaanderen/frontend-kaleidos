/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import auk from '../../selectors/auk.selectors';

function formatmeetingDocumentsUrl(meetingId, agendaId) {
  return `/vergadering/${meetingId}/agenda/${agendaId}/documenten`;
}

context('Add files to an agenda', () => { // At the meeting-level
  beforeEach(() => {
    cy.login('Admin');
    cy.intercept('GET', '/pieces?filter**meeting**').as('loadPieces');
  });

  it('should open an agenda and add documents to it', () => {
    const meetingId = '5EBA8CB1DAB6BB0009000001';
    const agendaId = '5EBA8CB2DAB6BB0009000002';
    cy.visit(formatmeetingDocumentsUrl(meetingId, agendaId));
    cy.wait('@loadPieces');

    // Open the modal, add files
    cy.get(route.agendaDocuments.addDocuments).click();
    cy.addNewDocumentsInUploadModal([{
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    }], 'meeting');

    // Check the name of the document we just uploaded
    cy.get(document.documentCard.name.value).eq(0)
      .contains('test pdf');

    // Add a new version and check its name
    cy.addNewPieceToMeeting('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    // cy.wait('@loadPieces');
    cy.get(document.documentCard.card).eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/BIS/);
      });

    // Add a new version and check its name
    cy.addNewPieceToMeeting('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    // cy.wait('@loadPieces');
    cy.get(document.documentCard.card).eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/TER/);
      });
  });

  it('should add several documents that should be sorted', () => {
    const meetingId = '5EBA8CCADAB6BB0009000005';
    const agendaId = '5EBA8CCCDAB6BB0009000006';
    cy.visit(formatmeetingDocumentsUrl(meetingId, agendaId));
    cy.wait('@loadPieces');

    // Open the modal, add files
    cy.get(route.agendaDocuments.addDocuments).click();
    cy.addNewDocumentsInUploadModal(
      [
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-6 - 6e', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'no vr number - 7e', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-3 - 3e', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-5 - 5e', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-4 - 4e', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2018 1010 DOC.0005-2 - 2e', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-1 - 1e', fileType: 'Nota',
        }
      ], 'meeting'
    );

    // Test if documents are listed in the correct sorting order
    cy.get(document.documentCard.card).as('docCards');
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/1e/);
      });
    cy.get('@docCards').eq(1)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/2e/);
      });
    cy.get('@docCards').eq(2)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/3e/);
      });
    cy.get('@docCards').eq(3)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/4e/);
      });
    cy.get('@docCards').eq(4)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/5e/);
      });
    cy.get('@docCards').eq(5)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/6e/);
      });
    cy.get('@docCards').eq(6)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/7e/);
      });
  });

  it('should delete documents, pieces and files', () => {
    const meetingId = '5EBA8CE1DAB6BB0009000009';
    const agendaId = '5EBA8CE3DAB6BB000900000A';
    cy.intercept('GET', '/pieces?filter**id**').as('loadPieceData');
    cy.visit(formatmeetingDocumentsUrl(meetingId, agendaId));
    cy.wait('@loadPieces'); // general load
    cy.wait('@loadPieceData'); // specific load to ensure document-container is loaded

    // Test if the documents we're looking for are present
    cy.get(document.documentCard.card).as('docCards');
    cy.get('@docCards').should('have.length', 2);

    // Remove a document
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/1e/);
        cy.get(document.documentCard.actions)
          .should('not.be.disabled')
          .children(appuniversum.button)
          .click();
        cy.get(document.documentCard.delete).forceClick();
      });
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.intercept('DELETE', 'pieces/*').as('deletePiece');
    cy.intercept('DELETE', 'document-containers/*').as('deleteDocumentContainer');

    cy.get(auk.confirmationModal.footer.save).contains('Verwijderen')
      .click();
    // there is a 15 second delay to allow a user to reconsider the delete

    cy.wait('@deleteFile', {
      timeout: 30000,
    });
    cy.wait('@deletePiece');
    cy.wait('@deleteDocumentContainer');
    cy.wait('@loadPieces');

    // One document should be gone.
    cy.get('@docCards').should('have.length', 1);
  });
});
