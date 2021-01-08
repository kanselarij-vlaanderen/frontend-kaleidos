/* global context, before, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />
import modal from '../../selectors/modal.selectors';

import document from '../../selectors/document.selectors';

context('Add files to an agenda', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open an agenda and add documents to it', () => {
    cy.visit('/vergadering/5EBA8CB1DAB6BB0009000001/agenda/5EBA8CB2DAB6BB0009000002/agendapunten');
    cy.addDocumentsToAgenda([{
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    }]);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard).eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains('test pdf');
        });
    });

    cy.addNewPieceToMeeting('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard).eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/BIS/);
        });
    });

    cy.addNewPieceToMeeting('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard).eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/TER/);
        });
    });
  });

  it('should add several documents that should be sorted', () => {
    cy.visit('/vergadering/5EBA8CCADAB6BB0009000005/agenda/5EBA8CCCDAB6BB0009000006/agendapunten');
    // TODO The sorting is fixed in agenda print branch using "/ gave a different result then "-
    cy.addDocumentsToAgenda(
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
      ]
    );

    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard).as('docCards');
      cy.get('@docCards').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/1e/);
        });
      cy.get('@docCards').eq(1)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/2e/);
        });
      cy.get('@docCards').eq(2)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/3e/);
        });
      cy.get('@docCards').eq(3)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/4e/);
        });
      cy.get('@docCards').eq(4)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/5e/);
        });
      cy.get('@docCards').eq(5)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/6e/);
        });
      cy.get('@docCards').eq(6)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(/7e/);
        });
    });
  });

  it('should delete documents, pieces and files', () => {
    cy.visit('/vergadering/5EBA8CE1DAB6BB0009000009/agenda/5EBA8CE3DAB6BB000900000A/documenten');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard).as('docCards');
    });
    cy.get('@docCards').should('have.length', 2);
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get('.vl-title--h6 > span').contains(/1e/);
        cy.get('.ki-more').click();
      });
    cy.get('.vlc-dropdown-menu').within(() => {
      cy.get('.vl-u-text--error').contains('Document verwijderen')
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

    cy.get('@docCards').should('have.length', 1);
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get('.vl-title--h6 > span').contains(/2e/);
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

    cy.get('@docCards').should('have.length', 0);

    cy.deleteAgenda('5EBA8CE1DAB6BB0009000009', true);
  });
});
