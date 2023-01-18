/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import document from '../../selectors/document.selectors';
import utils from '../../selectors/utils.selectors';

context('Delete BIS tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test deleting a BIS from document viewer after opening from agendaitem', () => {
    const agendaDate = Cypress.dayjs('2022-04-25');
    const caseTitle = 'Cypress test dossier delete BIS from document view';
    const subcaseTitle1 = 'Cypress test: delete BIS from document view';

    // setup:
    // agenda A: 2 original files
    // agenda B: 2 BIS
    // 1 click to viewer, goback + cy.reload
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2022 0425 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2022 0425 DOC.0001-2', fileType: 'Decreet',
      }
    ];
    cy.createCase(caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het propageren naar overheid',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda(null, agendaDate, 'Zaal oxford bij Cronos Leuven');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1);
    cy.addDocumentsToAgendaitem(subcaseTitle1, files);

    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveDesignAgenda();

    cy.openAgendaitemDocumentTab(subcaseTitle1);
    cy.addNewPiece(files[0].newFileName, file, 'agendaitems');
    cy.addNewPiece(files[1].newFileName, file, 'agendaitems');

    // cy.openAgendaForDate(agendaDate);
    // cy.openAgendaitemDocumentTab(subcaseTitle1, false);
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
      .should('not.be.disabled');

    cy.get(document.documentCard.name.value).contains('VR 2022 0425 DOC.0001-1')
      .parents(document.documentCard.card)
      .as('documentCard1');

    cy.get('@documentCard1').find(document.documentCard.name.value)
      .invoke('removeAttr', 'target')
      .parent()
      .click();

    cy.get(document.documentPreviewSidebar.open).click();
    cy.get(document.previewDetailsTab.delete).click();
    cy.intercept('PUT', '**/restore**').as('restoreFile');
    cy.intercept('DELETE', 'files/**').as('deleteFile');
    cy.intercept('DELETE', 'pieces/**').as('deletePiece');
    cy.intercept('GET', 'pieces?filter**').as('piecesFilter');
    cy.get(utils.vlModalVerify.save).click()
      .wait('@restoreFile')
      .wait('@deleteFile')
      .wait('@deletePiece')
      .wait('@piecesFilter');
    // TODO-BUG clicking close to fast uses old context
    // cy.get(auk.auModal.header.close).click();
    cy.go('back');
    cy.get(auk.loader).should('not.exist');
    cy.get('@documentCard1').contains(files[0].newFileName);
    cy.get('@documentCard1').should('not.contain', /BIS/);

    cy.reload();
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
      .should('not.be.disabled');

    cy.get(document.documentCard.name.value).contains('VR 2022 0425 DOC.0001-2')
      .parents(document.documentCard.card)
      .as('documentCard2');

    cy.get('@documentCard2').find(document.documentCard.name.value)
      .invoke('removeAttr', 'target')
      .parent()
      .click();

    // cy.get(document.documentPreviewSidebar.open).click();
    cy.get(document.previewDetailsTab.delete).click();
    cy.intercept('PUT', '**/restore**').as('restoreFile');
    cy.intercept('DELETE', 'files/**').as('deleteFile');
    cy.intercept('DELETE', 'pieces/**').as('deletePiece');
    cy.intercept('GET', 'pieces?filter**').as('piecesFilter');
    cy.get(utils.vlModalVerify.save).click()
      .wait('@restoreFile')
      .wait('@deleteFile')
      .wait('@deletePiece')
      .wait('@piecesFilter');
    // TODO-BUG clicking close to fast uses old context
    // cy.get(auk.auModal.header.close).click();
    cy.go('back');
    cy.get(auk.loader).should('not.exist');
    cy.get('@documentCard2').contains(files[1].newFileName);
    cy.get('@documentCard2').should('not.contain', /BIS/);
  });

  it.skip('should test deleting a BIS from document viewer after opening document directly', () => {
    // TODO find better BIS
    cy.visit('document/6273BCE47590117083BAD7AA');

    cy.get(document.documentPreviewSidebar.open).click();
    cy.get(document.previewDetailsTab.delete).click();
    cy.intercept('PUT', '**/restore**').as('restoreFile');
    cy.intercept('DELETE', 'files/**').as('deleteFile');
    cy.intercept('DELETE', 'pieces/**').as('deletePiece');
    cy.intercept('GET', 'pieces?filter**').as('piecesFilter');
    cy.get(utils.vlModalVerify.save).click()
      .wait('@restoreFile')
      .wait('@deleteFile')
      .wait('@deletePiece')
      .wait('@piecesFilter');
    // TODO-BUG clicking close to fast uses old context
    // cy.get(auk.auModal.header.close).click();
    cy.go('back');
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.name.value).contains('VR 2020 0404 DOC.0001-1.pdf');
    cy.get(document.documentCard.name.value).should('not.contain', /BIS/);
  });
});
