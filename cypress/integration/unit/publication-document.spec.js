/* global context, before, it, cy,beforeEach, afterEach */

// / <reference types="Cypress" />
import publicationSelectors from '../../selectors/publication.selectors';
import auComponentSelectors from '../../selectors/au-component-selectors';
import modalSelectors from '../../selectors/modal.selectors';

context('Publications documents tests', () => {
  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
  });

  afterEach(() => {
    cy.logout();
  });

  let basePublicationNumber = '1000';
  const shortTitle = 'Korte titel cypress test - document upload';
  const longTitle = 'Lange titel voor de cypress test - document upload';
  const files = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-1', fileType: 'Nota',
    },
    {
      folder: 'files', fileName: 'test', fileExtension: 'docx', newFileName: 'VR 2019 1111 DOC.0001-1', fileType: 'Nota',
    }
  ];

  it('should add some documents to a publication', () => {
    const pubNumber = basePublicationNumber++;
    cy.createPublication(pubNumber, shortTitle, longTitle);
    cy.get(publicationSelectors.nav.documents).click();
    cy.get(auComponentSelectors.auEmptyState).should('exist');
    cy.get(auComponentSelectors.auEmptyStateText).should('contain', 'Er zijn nog geen documenten toegevoegd.');
    cy.addPublicationDocuments(files);
    // TODO modal closes before everything is saved, also in meeting documents
    cy.wait(2000);
    cy.get(auComponentSelectors.auEmptyState).should('not.exist');
    cy.get(publicationSelectors.publicationCase.documentsPieceRow).should('have.length', 2);
  });

  it('should add and remove documents from a publication', () => {
    const pubNumber = basePublicationNumber++;
    cy.createPublication(pubNumber, shortTitle, longTitle);
    cy.get(publicationSelectors.nav.documents).click();
    cy.get(auComponentSelectors.auEmptyState).should('exist');
    cy.get(auComponentSelectors.auEmptyStateText).should('contain', 'Er zijn nog geen documenten toegevoegd.');
    cy.addPublicationDocuments(files);
    // TODO modal closes before everything is saved, also in meeting documents
    cy.wait(2000);
    cy.get(auComponentSelectors.auEmptyState).should('not.exist');
    cy.get(publicationSelectors.publicationCase.documentsPieceRow).as('pieceRows');
    cy.get('@pieceRows').eq(0)
      .within(() => {
        cy.get(publicationSelectors.publicationCase.documentsRowActions).click();
        cy.get(publicationSelectors.publicationCase.documentsRowActionDelete).click();
      });

    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.route('DELETE', 'pieces/*').as('deletePiece');
    cy.route('DELETE', 'document-containers/*').as('deleteDocumentContainer');

    cy.get(modalSelectors.modal).within(() => {
      cy.get(modalSelectors.verify.save).click();
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

    cy.get(publicationSelectors.publicationCase.documentsPieceRow).should('have.length', 1);
  });
});
