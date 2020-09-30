/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

import document from '../../selectors/document.selectors';

context('Tests for KAS-1076', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Adding more then 20 document-versions to agendaitem with subcase should show all', () => {
    const caseTitleSingle = 'Cypress test: document versions agendaitem - 1589286110';
    const SubcaseTitleShort = 'Cypress test: 20+ documents agendaitem with subcase - 1589286110';

    cy.visit('/vergadering/5EBA94D7751CF70008000001/agenda/5EBA94D8751CF70008000002/agendapunten');
    // This works but takes 300 or more seconds...
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-2', fileType: 'MB',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-3', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-4', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-5', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-6', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-7', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-8', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-9', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-10', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-11', fileType: 'Bijlage',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-12', fileType: 'IF',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-13', fileType: 'BVR',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-14', fileType: 'MvT',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-15', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-16', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-17', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-18', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-19', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-20', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-21', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-22', fileType: 'Nota',
      }
    ];

    cy.addDocumentsToAgendaitem(SubcaseTitleShort, files, false);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card', {
        timeout: 60000,
      }).as('docCards')
        .should('have.length', 22);
    });

    cy.openCase(caseTitleSingle);
    cy.openSubcase(0);
    cy.clickReverseTab('Documenten');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card', {
        timeout: 60000,
      }).as('docCards')
        .should('have.length', 22);
    });

    const linkedDocumentsNames = files.slice(9, 14).map((file) => file.newFileName);
    const linkedDocumentTypes = files.slice(9, 14).map((file) => file.fileType);

    cy.addLinkedDocumentToAgendaitem(linkedDocumentsNames);
    cy.get(document.linkeddocumentTypeLabel).eq(0)
      .contains(linkedDocumentTypes[0]);
    cy.get(document.linkeddocumentTypeLabel).eq(1)
      .contains(linkedDocumentTypes[1]);
    cy.get(document.linkeddocumentTypeLabel).eq(2)
      .contains(linkedDocumentTypes[2]);
    cy.get(document.linkeddocumentTypeLabel).eq(3)
      .contains(linkedDocumentTypes[3]);
    cy.get(document.linkeddocumentTypeLabel).eq(4)
      .contains(linkedDocumentTypes[4]);
  });

  it('Adding more then 20 document-versions to subcase should show all', () => {
    cy.visit('/dossiers/5EBA9528751CF7000800000A/deeldossiers/5EBA953A751CF7000800000C/documenten');
    // This works but takes 300 or more seconds...
    cy.addDocumentsToSubcase(
      [
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-1', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-2', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-3', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-4', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-5', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-6', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-7', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-8', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-9', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-10', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-11', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-12', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-13', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-14', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-15', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-16', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-17', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-18', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-19', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-20', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-21', fileType: 'Nota',
        },
        {
          folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-22', fileType: 'Nota',
        }
      ]
    );
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards')
        .should('have.length', 22);
    });
    cy.get('.vlc-backlink').click();
    const subcaseTitleLong = 'Cypress test voor het tonen van meer dan 20 documenten in procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.addSubcase('Nota', 'cypress test: 20+ documents subcase - 1589286177 part 2', subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.clickReverseTab('Documenten');
    cy.get('[data-test-vl-loader]');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards')
        .should('have.length', 22);
    });
  });

  it('Adding new document or document-version to agendaitem on designagenda should reset formally ok and update the subcase', () => {
    const SubcaseTitleShort = 'Cypress test: new document version on agendaitem - 1589286212';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };

    // PART 1, adding new version
    cy.visit('/vergadering/5EBA9588751CF70008000012/agenda/5EBA9589751CF70008000013/agendapunten/5EBA95A2751CF70008000016');
    cy.addNewDocumentVersionToAgendaitem(SubcaseTitleShort, file.newFileName, file);

    // Verify agendaitem is updated
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}BIS`);
        });
    });

    // Verify formally ok is reset
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 1);

    // Verify subcase is updated
    cy.visit('/dossiers/5EBA9548751CF7000800000D/deeldossiers/5EBA9556751CF7000800000F/documenten');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}BIS`);
        });
    });

    // PART 2, adding new document, separate test ?
    cy.visit('/vergadering/5EBA9588751CF70008000012/agenda/5EBA9589751CF70008000013/agendapunten/5EBA95A2751CF70008000016');
    cy.setFormalOkOnItemWithIndex(1);
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 0);
    cy.addDocumentsToAgendaitem(SubcaseTitleShort, [file]);
    // Verify agendaitem is updated
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}`);
        });
    });
    // Verify formally ok is reset
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 1);
    // Verify subcase is updated
    cy.visit('/dossiers/5EBA9548751CF7000800000D/deeldossiers/5EBA9556751CF7000800000F/documenten');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}`);
        });
    });
  });

  it('Adding new document or document-version to subcase should reset formally ok and update the agendaitem on designagendas', () => {
    const SubcaseTitleShort = 'Cypress test: new document version on procedurestap - 1589286338';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };

    // PART 1, adding new version
    cy.visit('/dossiers/5EBA95CA751CF70008000018/deeldossiers/5EBA95E1751CF7000800001A/documenten');
    cy.addNewDocumentVersionToSubcase('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}BIS`);
        });
    });

    cy.visit('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.openAgendaitemDocumentTab(SubcaseTitleShort, true);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}BIS`);
        });
    });
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 1);


    // PART 2, adding new document
    cy.setFormalOkOnItemWithIndex(1);
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 0);
    cy.visit('/dossiers/5EBA95CA751CF70008000018/deeldossiers/5EBA95E1751CF7000800001A/documenten');
    cy.addDocumentsToSubcase([file]);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}`);
        });
    });

    cy.visit('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.openAgendaitemDocumentTab(SubcaseTitleShort, true);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}`);
        });
    });
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 1);
  });
});
