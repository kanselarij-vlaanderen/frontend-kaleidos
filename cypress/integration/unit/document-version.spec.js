/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import document from '../../selectors/document.selectors';

context('Tests on pieces and page-sizes of agendaitems and subcase', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Should test agendaitem and subcase views with more than 20 pieces', () => {
    // current setup:
    // Case with proposed subcase with 25 documents

    // Cypress.dayjs('2020-04-07');
    // const caseTitleSingle = 'Cypress test: document versions agendaitem - 1589286110';
    // const SubcaseTitleShort = 'Cypress test: 20+ documents agendaitem with subcase - 1589286110';
    const amountOfDocs = 25;

    // verify more than 20 docs are showing on agendaitem (default page-size is capped at 20, needed to artificially increase)
    cy.intercept('GET', '/pieces?filter**agendaitems**page**size**500').as('getPiecesOfAgendaitem');
    cy.visitAgendaWithLink('/vergadering/5EBA94D7751CF70008000001/agenda/5EBA94D8751CF70008000002/agendapunten/5EBA9512751CF70008000008/documenten');
    cy.wait('@getPiecesOfAgendaitem', {
      timeout: 60000,
    });
    cy.get(document.documentCard.card).should('have.length', amountOfDocs);

    // verify more than 20 docs are showing from 1 submission-activity on subcase
    // (default page size submissActivity.pieces is not increased, but all pieces are included in a query)
    cy.intercept('GET', '/submission-activities?filter**subcase**include**pieces**page**size**500').as('getPiecesOfSubcase');
    cy.visit('/dossiers/E14FB5E6-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5EBA94F7751CF70008000007/documenten');
    cy.wait('@getPiecesOfSubcase', {
      timeout: 60000,
    });
    cy.get(document.documentCard.card).should('have.length', amountOfDocs);

    // all documents of current subcase are "linked documents" of newly created subcase
    cy.get(auk.tab.hierarchicalBack).click();
    const subcaseShortTitle = 'cypress test: 20+ documents linked subcase - 1589286110 part 2';
    cy.addSubcase(null, subcaseShortTitle);
    cy.openSubcase(0, subcaseShortTitle);

    cy.intercept('GET', '/document-containers?filter**pieces**page**size**20').as('getLinkedContainers');
    cy.clickReverseTab('Documenten');
    cy.wait('@getLinkedContainers', {
      timeout: 60000,
    });
    cy.get(document.linkedDocumentLink.card).should('have.length', amountOfDocs);
  });

  it('Should test the linking of documents to subcase and verify agendaitem is updated', () => {
    // current setup:
    // Case with proposed subcase
    // Cypress.dayjs('2020-04-07');
    cy.visit('/dossiers/E14FB500-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5EBA953A751CF7000800000C/documenten');
    // these files exist on /dossiers/5EBA94E4751CF70008000005/deeldossiers/5EBA94F7751CF70008000007/documenten
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2022 0202 DOC.0001-10',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2022 0202 DOC.0001-11',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2022 0202 DOC.0001-12',
      }
    ];

    const linkedDocumentsNames = files.map((file) => file.newFileName);

    cy.intercept('GET', `/document-containers?filter**pieces**page**size**${files.length}`).as('getLinkedContainers');
    cy.addLinkedDocument(linkedDocumentsNames);
    cy.wait('@getLinkedContainers', {
      timeout: 60000,
    });

    cy.get(document.linkedDocumentLink.name).eq(0)
      .contains(linkedDocumentsNames[0]);
    cy.get(document.linkedDocumentLink.name).eq(1)
      .contains(linkedDocumentsNames[1]);
    cy.get(document.linkedDocumentLink.name).eq(2)
      .contains(linkedDocumentsNames[2]);

    // check if these documents are also on agendaitem
    cy.visitAgendaWithLink('/vergadering/5EBA94D7751CF70008000001/agenda/5EBA94D8751CF70008000002/agendapunten/628615092E53BE1FC759BC6A/documenten');
    cy.get(document.linkedDocumentLink.name).eq(0)
      .contains(linkedDocumentsNames[0]);
    cy.get(document.linkedDocumentLink.name).eq(1)
      .contains(linkedDocumentsNames[1]);
    cy.get(document.linkedDocumentLink.name).eq(2)
      .contains(linkedDocumentsNames[2]);
  });

  it('Adding new document or piece to agendaitem on designagenda should reset formally ok and update the subcase', () => {
    // Cypress.dayjs('2020-04-08');
    const subcaseTitleShort = 'Cypress test: new document version on agendaitem - 1589286212';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf',
    };

    // current setup:
    // Case with proposed subcase with 1 documents, agendaitem is formally ok
    // Agenda 08/04/2020 has 2 agendaitems, 1 approval / 1 note, both formally ok

    // PART 1, adding new piece
    cy.visitAgendaWithLink('/vergadering/5EBA9588751CF70008000012/agenda/5EBA9589751CF70008000013/agendapunten/5EBA95A2751CF70008000016');
    // ensure setup is as expected
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 0);
    cy.addNewPieceToAgendaitem(subcaseTitleShort, file.newFileName, file);

    // Verify agendaitem is updated
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}BIS`);

    // Verify formally ok is reset
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 1);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 1);

    // Verify subcase is updated
    cy.visit('/dossiers/E14FB4D8-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5EBA9556751CF7000800000F/documenten');
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}BIS`);

    // PART 2, adding new document
    cy.visitAgendaWithLink('/vergadering/5EBA9588751CF70008000012/agenda/5EBA9589751CF70008000013/agendapunten/5EBA95A2751CF70008000016');
    cy.setFormalOkOnItemWithIndex(1);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 0);
    cy.addDocumentsToAgendaitem(subcaseTitleShort, [file]);
    // Verify agendaitem is updated
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}`);
    // Verify formally ok is reset
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 1);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 1);
    // Verify subcase is updated
    cy.visit('/dossiers/E14FB4D8-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5EBA9556751CF7000800000F/documenten');
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}`);
  });

  it('Adding new document or piece to subcase should reset formally ok and update the agendaitem on designagendas', () => {
    // Cypress.dayjs('2020-04-20');
    // const subcaseTitleShort = 'Cypress test: new document version on procedurestap - 1589286338';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf',
    };

    // current setup:
    // Case with proposed subcase with 1 documents, agendaitem is formally ok
    // Agenda 20/04/2020 has 2 agendaitems, 1 approval / 1 note, both formally ok

    // PART 1, adding new piece to subcase
    cy.visit('/dossiers/E14FB5F0-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5EBA95E1751CF7000800001A/documenten');
    // *note* This is the only use of this command so keep it.
    cy.addNewPieceToSubcase('test pdf', file);
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}BIS`);

    // check agendaitem formally not yet ok
    cy.visitAgendaWithLink('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten/5EBA9623751CF70008000021/documenten');
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}BIS`);
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 1);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 1);

    // PART 2, adding new document to subcase
    cy.setAllItemsFormallyOk(1);
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 0);

    cy.visit('/dossiers/E14FB5F0-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5EBA95E1751CF7000800001A/documenten');
    // *note* This is the only use of this command so keep it.
    cy.addDocumentsToSubcase([file]);
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}`);

    // check agendaitem formally not yet ok
    cy.visitAgendaWithLink('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten/5EBA9623751CF70008000021/documenten');
    cy.get(document.documentCard.name.value).eq(0)
      .contains(`${file.newFileName}`);
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 1);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 1);
  });
});
