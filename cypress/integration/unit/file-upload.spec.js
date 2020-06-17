/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

context('Add files to an agenda', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should open an agenda and add documents to it', () => {
    cy.visit('/vergadering/5EBA8CB1DAB6BB0009000001/agenda/5EBA8CB2DAB6BB0009000002/agendapunten');
    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'}]);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains('test pdf');
      });
    });

    cy.addNewDocumentVersionToMeeting('test pdf', { folder: 'files', fileName: 'test', fileExtension: 'pdf' });
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(/BIS/);
      });
    });

    cy.addNewDocumentVersionToMeeting('test pdf', { folder: 'files', fileName: 'test', fileExtension: 'pdf' });
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(/TER/);
      });
    });
  });

  it('should add several documents that should be sorted', () => {
    cy.visit('/vergadering/5EBA8CCADAB6BB0009000005/agenda/5EBA8CCCDAB6BB0009000006/agendapunten');
    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2018 1010 DOC.0005-2 - 2e', fileType: 'Nota'}]);
    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-1 - 1e', fileType: 'Nota'}]);
    // TODO The sorting is fixed in agenda print branch using "/ gave a different result then "-
    cy.addDocuments(
      [
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-6 - 6e', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'no vr number - 7e', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-3 - 3e', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-5 - 5e', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1011 DOC.0005-4 - 4e', fileType: 'Nota' }
      ]
    );

    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards');
      cy.get('@docCards').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(/1e/);
      });
      cy.get('@docCards').eq(1).within(() => {
        cy.get('.vl-title--h6 > span').contains(/2e/);
      });
      cy.get('@docCards').eq(2).within(() => {
        cy.get('.vl-title--h6 > span').contains(/3e/);
      });
      cy.get('@docCards').eq(3).within(() => {
        cy.get('.vl-title--h6 > span').contains(/4e/);
      });
      cy.get('@docCards').eq(4).within(() => {
        cy.get('.vl-title--h6 > span').contains(/5e/);
      });
      cy.get('@docCards').eq(5).within(() => {
        cy.get('.vl-title--h6 > span').contains(/6e/);
      });
      cy.get('@docCards').eq(6).within(() => {
        cy.get('.vl-title--h6 > span').contains(/7e/);
      });
    });
  });

  it('should delete documents, document-versions and files', () => {
    cy.visit('/vergadering/5EBA8CE1DAB6BB0009000009/agenda/5EBA8CE3DAB6BB000900000A/documenten');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards');
    });
    cy.get('@docCards').should('have.length', 2);
    cy.get('@docCards').eq(0).within(() => {
      cy.get('.vl-title--h6 > span').contains(/1e/);
      cy.get('.vl-vi-nav-show-more-horizontal').click();
    });
    cy.get('.vlc-dropdown-menu').within(() => {
      cy.get('.vl-u-text--error').contains('Document verwijderen').click();
    });
    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.route('DELETE', 'document-versions/*').as('deleteVersion');
    cy.route('DELETE', 'documents/*').as('deleteDocument');

    cy.get('.vl-modal').within(() => {
      cy.get('button').contains('Verwijderen').click();
    });

    cy.wait('@deleteFile', { timeout: 20000 });
    cy.wait('@deleteVersion', { timeout: 20000 });
    cy.wait('@deleteDocument', { timeout: 20000 });

    cy.get('@docCards').should('have.length', 1);
    cy.get('@docCards').eq(0).within(() => {
      cy.get('.vl-title--h6 > span').contains(/2e/);
      cy.get('.js-vl-accordion > button').click();
      cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
      cy.get('@versions').eq(0).within(() => {
        cy.get('.vl-vi-trash').click();
      });
    });
    cy.route('DELETE', 'files/*').as('deleteFile');
    cy.route('DELETE', 'document-versions/*').as('deleteVersion');
    cy.route('DELETE', 'documents/*').as('deleteDocument');

    cy.get('.vl-modal').within(() => {
      cy.get('button').contains('Verwijderen').click();
    });

    cy.wait('@deleteFile', { timeout: 20000 });
    cy.wait('@deleteVersion', { timeout: 20000 });
    // cy.wait('@deleteDocument', { timeout: 20000 }); // TODO fix the deletion of document in vl-document component

    cy.get('@docCards').should('have.length', 0);

    cy.deleteAgenda('5EBA8CE1DAB6BB0009000009', true);
  });
});
