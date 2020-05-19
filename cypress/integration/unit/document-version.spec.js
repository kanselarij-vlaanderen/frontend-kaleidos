/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';

context('Tests for KAS-1076', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Adding more then 20 document-versions to agendaitem with subcase should show all', () => {
    const caseTitleSingle = 'Cypress test: document versions agendaitem - 1589286110';
    const SubcaseTitleShort = 'Cypress test: 20+ documents agendaitem with subcase - 1589286110';

    cy.visit('/agenda/5EBA94D7751CF70008000001/agendapunten?selectedAgenda=5EBA94D8751CF70008000002');
    // This works but takes 300 or more seconds...
    const files = [
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-1', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-2', fileType: 'MB' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-3', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-4', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-5', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-6', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-7', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-8', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-9', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-10', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-11', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-12', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-13', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-14', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-15', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-16', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-17', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-18', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-19', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-20', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-21', fileType: 'Nota' },
      { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-22', fileType: 'Nota' },
    ]

    cy.addDocumentsToAgendaItem(SubcaseTitleShort, files,true);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 22);
    });

    cy.openCase(caseTitleSingle);
    cy.openSubcase(0);
    cy.clickReverseTab('Documenten');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 22);
    });
  });

  it('Adding more then 20 document-versions to subcase should show all', () => {
    cy.visit('/dossiers/5EBA9528751CF7000800000A/deeldossiers/5EBA953A751CF7000800000C/documenten');
    // This works but takes 300 or more seconds...
    cy.addDocuments(
      [
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-1', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-2', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-3', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-4', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-5', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-6', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-7', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-8', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-9', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-10', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-11', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-12', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-13', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-14', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-15', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-16', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-17', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-18', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-19', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-20', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-21', fileType: 'Nota' },
        { folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001-22', fileType: 'Nota' },
      ]
    );
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 20);
    });
    cy.get('.vlc-backlink').click();
    const subcaseTitleLong = 'Cypress test voor het tonen van meer dan 20 documenten in procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.addSubcase('Nota', "cypress test: 20+ documents subcase - 1589286177 part 2",subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.clickReverseTab('Documenten');
    cy.get('[data-test-vl-loader]');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 20);
    });
  });

  it('Adding new document-version to agendaitem on designagenda should reset formally ok and update the subcase', () => {
    const caseTitle = 'Cypress test: document versions - 1589286212';
    const SubcaseTitleShort = 'Cypress test: new document version on agendaitem - 1589286212';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};

    cy.visit('/agenda/5EBA9588751CF70008000012/agendapunten/5EBA95A2751CF70008000016')
    cy.addNewDocumentVersionToAgendaItem(SubcaseTitleShort, file.newFileName, file);

    // Verify agendaitem is updated
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(file.newFileName + 'BIS');
      });
    });

    // Verify formally ok is reset
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK').should('have.length', 1);

    // Verify subcase is updated
    cy.openCase(caseTitle);
    cy.openSubcase(0);
    cy.clickReverseTab('Documenten');
    // cy.wait(1000);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(file.newFileName + 'BIS');
      });
    });
  });

  it('Adding new document-version to subcase should reset formally ok and update the agendaitem on designagendas', () => {
    const SubcaseTitleShort = 'Cypress test: new document version on procedurestap - 1589286338';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};

    cy.visit('/dossiers/5EBA95CA751CF70008000018/deeldossiers/5EBA95E1751CF7000800001A/documenten');
    cy.addNewDocumentVersionToSubcase('test pdf', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(file.newFileName + 'BIS');
      });
    });

    cy.visit('/agenda/5EBA960A751CF7000800001D/agendapunten');
    cy.agendaItemExists(SubcaseTitleShort).click();
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.clickAgendaitemTab(agenda.agendaItemDocumentsTab);
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0).within(() => {
        cy.get('.vl-title--h6 > span').contains(file.newFileName + 'BIS');
      });
    });
    cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK').should('have.length', 1);
  });
});

function currentMoment() {
  return Cypress.moment();
}

function currentTimestamp() {
  return Cypress.moment().unix();
}

