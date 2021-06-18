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

  // This test was created long ago after a bug where the default page size of 20 was causing problems.
  // Since then, the page size for both the agendaitem and subcase have been increased to 999 (pieces and linked-pieces)
  // TODO make an agendaitem/subcase with xx documents in the default test data, and verify all docs show in both views
  it('Adding more then 20 pieces to agendaitem with subcase should show all', () => {
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
      }
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-5', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-6', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-7', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-8', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-9', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-10', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-11', fileType: 'Bijlage',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-12', fileType: 'IF',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-13', fileType: 'BVR',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-14', fileType: 'MvT',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-15', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-16', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-17', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-18', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-19', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-20', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-21', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-22', fileType: 'Nota',
      // }
    ];

    cy.addDocumentsToAgendaitem(SubcaseTitleShort, files, false);
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card, {
        timeout: 60000,
      }).as('docCards')
        .should('have.length', files.length);
    });

    // TODO click agendatosubcase link
    cy.openCase(caseTitleSingle);
    cy.openSubcase(0);
    cy.clickReverseTab('Documenten');
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card, {
        timeout: 80000,
      }).as('docCards')
        .should('have.length', files.length);
    });

    const linkedDocumentsNames = files.slice(0, 3).map((file) => file.newFileName);
    const linkedDocumentTypes = files.slice(0, 3).map((file) => file.fileType);

    cy.addLinkedDocument(linkedDocumentsNames);
    cy.get(document.linkedDocumentLink.typeLabel).eq(0)
      .contains(linkedDocumentTypes[0]);
    cy.get(document.linkedDocumentLink.typeLabel).eq(1)
      .contains(linkedDocumentTypes[1]);
    cy.get(document.linkedDocumentLink.typeLabel).eq(2)
      .contains(linkedDocumentTypes[2]);
    // TODO are these documentes visible on agendaitem ?
  });

  it('Adding more then 20 pieces to subcase should show all', () => {
    cy.visit('/dossiers/5EBA9528751CF7000800000A/deeldossiers/5EBA953A751CF7000800000C/documenten');
    // This works but takes 300 or more seconds...
    const files = [
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
      }
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-5', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-6', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-7', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-8', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-9', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-10', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-11', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-12', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-13', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-14', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-15', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-16', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-17', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-18', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-19', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-20', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-21', fileType: 'Nota',
      // },
      // {
      //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-22', fileType: 'Nota',
      // }
    ];
    cy.addDocumentsToSubcase(files);
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).as('docCards')
        .should('have.length', files.length);
    });
    cy.get('.auk-tabs__hierarchical-back > a').click();
    const subcaseTitleLong = 'Cypress test voor het tonen van meer dan 20 documenten in procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.addSubcase('Nota', 'cypress test: 20+ documents subcase - 1589286177 part 2', subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.clickReverseTab('Documenten');
    cy.get('[data-test-vl-loader]');
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.linkedDocumentLink.card).as('docCards')
        .should('have.length', files.length);
    });
  });

  // TODO this test and the next verify that adding a new doc or new version resets formally ok, but done in reverse? first new version, then new doc
  it('Adding new document or piece to agendaitem on designagenda should reset formally ok and update the subcase', () => {
    const SubcaseTitleShort = 'Cypress test: new document version on agendaitem - 1589286212';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };

    // PART 1, adding new piece
    cy.visit('/vergadering/5EBA9588751CF70008000012/agenda/5EBA9589751CF70008000013/agendapunten/5EBA95A2751CF70008000016');
    cy.addNewPieceToAgendaitem(SubcaseTitleShort, file.newFileName, file);

    // Verify agendaitem is updated
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}BIS`);
        });
    });

    // Verify formally ok is reset
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 1);

    // Verify subcase is updated
    // TODO check subcase no longer needed (legacy subcase also had formal ok status)
    cy.visit('/dossiers/5EBA9548751CF7000800000D/deeldossiers/5EBA9556751CF7000800000F/documenten');
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}BIS`);
        });
    });

    // PART 2, adding new document, separate test ?
    cy.visit('/vergadering/5EBA9588751CF70008000012/agenda/5EBA9589751CF70008000013/agendapunten/5EBA95A2751CF70008000016');
    cy.setFormalOkOnItemWithIndex(1);
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 0);
    cy.addDocumentsToAgendaitem(SubcaseTitleShort, [file]);
    // Verify agendaitem is updated
    // TODO are we sure we are checking the newly added document or the pre-existing BIS ?
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}`);
        });
    });
    // Verify formally ok is reset
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 1);
    // Verify subcase is updated
    // TODO check subcase no longer needed (legacy subcase also had formal ok status)
    cy.visit('/dossiers/5EBA9548751CF7000800000D/deeldossiers/5EBA9556751CF7000800000F/documenten');
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}`);
        });
    });
  });

  it('Adding new document or piece to subcase should reset formally ok and update the agendaitem on designagendas', () => {
    const SubcaseTitleShort = 'Cypress test: new document version on procedurestap - 1589286338';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    // TODO does setup have agendaitem on "formeel ok" before start?

    // PART 1, adding new piece
    cy.visit('/dossiers/5EBA95CA751CF70008000018/deeldossiers/5EBA95E1751CF7000800001A/documenten');
    cy.addNewPieceToSubcase('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}BIS`);
        });
    });

    cy.visit('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.openAgendaitemDocumentTab(SubcaseTitleShort, true);
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}BIS`);
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
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}`);
        });
    });

    cy.visit('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.openAgendaitemDocumentTab(SubcaseTitleShort, true);
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard.card).eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains(`${file.newFileName}`);
        });
    });
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK')
      .should('have.length', 1);
  });
});
