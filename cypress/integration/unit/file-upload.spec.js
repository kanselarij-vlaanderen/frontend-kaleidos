/* global context, before, it, cy, beforeEach */
// / <reference types="Cypress" />
import modal from '../../selectors/modal.selectors';

import document from '../../selectors/document.selectors';

function formatmeetingDocumentsUrl(meetingId, agendaId) {
  return `/vergadering/${meetingId}/agenda/${agendaId}/documenten`;
}

context('Add files to an agenda', () => { // At the meeting-level
  before(() => {
    cy.server();
  });

  beforeEach(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.route('GET', '/pieces?filter\\[meeting\\]\\[:id:\\]=*').as('loadPieces');
  });

  it('should open an agenda and add documents to it', () => {
    const meetingId = '5EBA8CB1DAB6BB0009000001';
    const agendaId = '5EBA8CB2DAB6BB0009000002';
    cy.visit(formatmeetingDocumentsUrl(meetingId, agendaId));
    cy.wait('@loadPieces');

    // Open the modal, add files
    cy.contains('Documenten toevoegen').click();
    cy.addNewDocumentsInUploadModal([{
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    }], 'meeting');

    // Check the name of the document we just uploaded
    cy.get('.auk-scroll-wrapper__body > .auk-u-m-8').within(() => { // TODO: selectors need improvement
      cy.get(document.documentCard).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains('test pdf');
        });
    });

    // Add a new version and check its name
    cy.addNewPieceToMeeting('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    // cy.wait('@loadPieces');
    cy.get('.auk-scroll-wrapper__body > .auk-u-m-8').within(() => { // TODO: selectors need improvement
      cy.get(document.documentCard).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/BIS/);
        });
    });

    // Add a new version and check its name
    cy.addNewPieceToMeeting('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    // cy.wait('@loadPieces');
    cy.get('.auk-scroll-wrapper__body > .auk-u-m-8').within(() => { // TODO: selectors need improvement
      cy.get(document.documentCard).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/TER/);
        });
    });
  });

  it('should add several documents that should be sorted', () => {
    const meetingId = '5EBA8CCADAB6BB0009000005';
    const agendaId = '5EBA8CCCDAB6BB0009000006';
    cy.visit(formatmeetingDocumentsUrl(meetingId, agendaId));
    cy.wait('@loadPieces');

    // Open the modal, add files
    cy.contains('Documenten toevoegen').click();
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
    cy.get('.auk-scroll-wrapper__body > .auk-u-m-8').within(() => { // TODO: selectors need improvement
      cy.get(document.documentCard).as('docCards');
      cy.get('@docCards').eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/1e/);
        });
      cy.get('@docCards').eq(1)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/2e/);
        });
      cy.get('@docCards').eq(2)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/3e/);
        });
      cy.get('@docCards').eq(3)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/4e/);
        });
      cy.get('@docCards').eq(4)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/5e/);
        });
      cy.get('@docCards').eq(5)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/6e/);
        });
      cy.get('@docCards').eq(6)
        .within(() => {
          cy.get('.auk-h4 > span').contains(/7e/);
        });
    });
  });

  it('should delete documents, pieces and files', () => {
    const meetingId = '5EBA8CE1DAB6BB0009000009';
    const agendaId = '5EBA8CE3DAB6BB000900000A';
    cy.visit(formatmeetingDocumentsUrl(meetingId, agendaId));
    cy.wait('@loadPieces');

    // Test if the documents we're looking for are present
    cy.get('.auk-scroll-wrapper__body > .auk-u-m-8').within(() => { // TODO: selectors need improvement
      cy.get(document.documentCard).as('docCards');
    });
    cy.get('@docCards').should('have.length', 2);

    // Remove a document
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get('.auk-h4 > span').contains(/1e/);
        cy.get('.ki-more').click();
      });
    cy.get('.vlc-dropdown-menu').within(() => {
      cy.get('.auk-u-text-error').contains('Document verwijderen')
        .click();
    });
    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.route('DELETE', 'pieces/*').as('deletePiece');
    cy.route('DELETE', 'document-containers/*').as('deleteDocumentContainer');

    cy.get(modal.modal).within(() => {
      cy.get('button').contains('Verwijderen')
        .click();
    });

    cy.wait('@deleteFile', {
      timeout: 20000,
    });
    cy.wait('@deletePiece', {
      timeout: 20000,
    });
    cy.wait('@deleteDocumentContainer', {
      timeout: 20000,
    });
    cy.wait('@loadPieces');

    // One document should be gone.
    cy.get('@docCards').should('have.length', 1);

    // Delete another document
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get('.auk-h4 > span').contains(/2e/);
        cy.get(document.showPiecesHistory).click();
        cy.get(document.singlePieceHistory).as('pieces');
        cy.get('@pieces').eq(0)
          .within(() => {
            cy.get('.ki-delete').click();
          });
      });
    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.route('DELETE', 'pieces/*').as('deletePiece');
    cy.route('DELETE', 'document-containers/*').as('deleteDocumentContainer');

    cy.get(modal.modal).within(() => {
      cy.get('button').contains('Verwijderen')
        .click();
    });

    cy.wait('@deleteFile', {
      timeout: 20000,
    });
    cy.wait('@deletePiece', {
      timeout: 20000,
    });
    // cy.wait('@deleteDocumentContainer', { timeout: 20000 }); // TODO fix the deletion of document in vl-document component
    cy.wait('@loadPieces');

    // Nothing should be left
    cy.get('@docCards').should('have.length', 0);

    cy.deleteAgenda(meetingId, true);
  });
});
