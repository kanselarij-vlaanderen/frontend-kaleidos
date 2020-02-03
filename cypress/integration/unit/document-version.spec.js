/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />

context('Tests for KAS-1076', () => {
  // const testStart = cy.currentMoment();

  before(() => {
    cy.server();
    cy.resetDB();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Adding more then 20 document-versions to subcase should show all', () => {
    const caseTitleSingle = 'Cypress test: document versions - ' + cy.currentTimestamp();
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: 20+ documents subcase - ' + cy.currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het tonen van meer dan 20 documenten in procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.createCase(false, caseTitleSingle);
    cy.openCase(caseTitleSingle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.route('GET', '**/document-versions?page*size*=9999').as('getPage9999');

    cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() =>{
      cy.contains('Documenten').click().wait('@getPage9999');
    });

    // This works but takes 300 or more seconds...
    cy.addDocuments(
      [
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/1', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/2', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/3', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/4', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/5', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/6', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/7', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/8', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/9', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/10', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/11', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/12', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/13', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/14', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/15', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/16', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/17', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/18', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/19', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/20', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/21', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/22', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/23', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/24', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/25', fileType: 'Nota'},
      ]
    );
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 25);
    });
    cy.get('.vlc-backlink').click();
    cy.addSubcase(type,SubcaseTitleShort + " part 2",subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.route('GET', '**/linkedDocument-versions?page*size*=9999').as('getPage9999');

    cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() =>{
      cy.contains('Documenten').click().wait('@getPage9999');
    });
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 25);
    });

  });

  it('Adding new document-version to agendaitem on designagenda should reset formally ok and update the subcase', () => {
    const caseTitle = 'Cypress test: document versions - ' + cy.currentTimestamp();
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: new document version on agendaitem - ' + cy.currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toevoegen van een nieuwe document versie aan een agendaitem';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.addDocuments(files);
    const plusMonths = 1;
    const agendaDate = cy.currentMoment().add('month', plusMonths).set('date', 19).set('hour', 19).set('minute', 19);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);
      cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
      cy.setFormalOkOnAllItems();
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.clickAgendaitemTab('Documenten');

      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(file.newFileName);
        });
      });
      cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK').should('have.length', 0);
      cy.addNewDocumentVersionToAgendaItem(SubcaseTitleShort, file.newFileName, file);
      cy.route('PATCH', 'agendaitems/**').as('patchFormallyOk');
      cy.wait('@patchFormallyOk', {timeout: 10000 });

      // Verify agendaitem is updated
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(file.newFileName + ' BIS');
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
          cy.get('.vl-title--h6 > span').contains(file.newFileName + ' BIS');
        });
      });
      });
    });

  it('Adding new document-version to subcase should reset formally ok and update the agendaitem on designagendas', () => {
    const caseTitle = 'Cypress test: document versions - ' + cy.currentTimestamp();
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: new document version on procedurestap - ' + cy.currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toevoegen van een nieuwe document versie aan een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.addDocuments(files);
    const plusMonths = 1;
    const agendaDate = cy.currentMoment().add('month', plusMonths).set('date', 20).set('hour', 20).set('minute', 20);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);
      cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
      cy.setFormalOkOnAllItems();
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.clickAgendaitemTab('Documenten');

      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(file.newFileName);
        });
      });
      cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK').should('have.length', 0);

      cy.openCase(caseTitle);
      cy.openSubcase(0);
      cy.clickReverseTab('Documenten');
      // cy.wait(1000);
      cy.addNewDocumentVersion('test pdf', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});
      cy.route('PATCH', 'agendaitems/**').as('patchFormallyOk');
      cy.wait('@patchFormallyOk', {timeout: 10000 });
      // cy.wait(1000);
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(file.newFileName + ' BIS');
        });
      });

      cy.openAgendaForDate(agendaDate,meetingId);
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.clickAgendaitemTab('Documenten');
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get('.vlc-document-card').eq(0).within(() => {
          cy.get('.vl-title--h6 > span').contains(file.newFileName + ' BIS');
        });
      });
      cy.get('.vlc-agenda-items__status').contains('Nog niet formeel OK').should('have.length', 1);
      });
  });
});

