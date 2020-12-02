/* global context, before, it, cy,beforeEach, afterEach */

// / <reference types="Cypress" />
import publicationSelectors from '../../selectors/publication.selectors';
import auComponentSelectors from '../../selectors/au-component-selectors';

context('Publications tests', () => {
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

  const publicationNumber = '1000';
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
    cy.createPublication(publicationNumber, shortTitle, longTitle);
    cy.get(publicationSelectors.nav.documents).click();
    cy.get(auComponentSelectors.auEmptyState).should('exist');
    cy.get(auComponentSelectors.auEmptyStateText).should('contain', 'Er zijn nog geen documenten toegevoegd.');
    cy.addPublicationDocuments(files);
    // TODO modal closes before everything is saved, also in meeting documents
    cy.wait(2000);
    cy.get(auComponentSelectors.auEmptyState).should('not.exist');
  });
});
