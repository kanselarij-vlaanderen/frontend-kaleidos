/* global context, it, cy, beforeEach, afterEach, Cypress, before */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import dependency from '../../selectors/dependency.selectors';
// import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
// import utils from '../../selectors/utils.selectors';


context('new document viewer tests', () => {
  function fillInEditDetails(newName, newDocumentType, newAccesLevel) {
    cy.get(document.documentPreviewDetails.editor.name).click()
      .clear()
      .type(newName);
    cy.get(document.documentPreviewDetails.editor.documentType).click();
    cy.get(dependency.emberPowerSelect.option).contains(newDocumentType)
      .click();
    cy.get(document.documentPreviewDetails.editor.accesLevel).click();
    cy.get(dependency.emberPowerSelect.option).contains(newAccesLevel)
      .click();
  }

  // function changeProfileAndVisitDocView(profile) {
  //   cy.logoutFlow();
  //   cy.login(profile);
  //   cy.visit(`/document/${this.documentId}`);
  //   cy.get(document.documentPreviewSidebar.tabs.details);
  // }

  const agendaKind = 'Ministerraad';
  const agendaPlace = 'Cypress Room';
  const agendaDate = Cypress.moment().add(2, 'weeks')
    .day(2);
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
  };
  const files = [file];
  const newVersionfile = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };

  before(() => {
    cy.server();
    cy.login('Admin');
    cy.createAgenda(agendaKind, agendaDate, agendaPlace);
    cy.openAgendaForDate(agendaDate);
    // cy.get(agenda.agendaOverviewItem.subitem).click();
    // cy.get(agenda.agendaitemNav.documentsTab).click();
    // cy.get(route.agendaitemDocuments.add).click();
    // cy.addNewDocumentsInUploadModal(files, 'agendaitems');
    cy.openDetailOfAgendaitem('Goedkeuring van het verslag', false);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(route.agendaitemDocuments.add).click();
    cy.addNewDocumentsInUploadModal(files, 'agendaitems');
    cy.addNewPieceToApprovalItem('Goedkeuring van het verslag', file.newFileName, newVersionfile);
    cy.logoutFlow();
  });
  const defaultAccessLevel = 'Intern Regering';
  const bisName = 'test pdfBIS';
  const newName = 'new name test';
  const newDocumentType = 'BVR';
  const newAccesLevel = 'Intern Overheid';
  const searchDocumentType = 'Advies AgO';

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.openAgendaForDate(agendaDate);
    cy.get(document.documentBadge.link).eq(0)
      .invoke('removeAttr', 'target') // dont open links in new windows by removing target (breaks cypress test).
      .click();
  });

  afterEach(() => {
    cy.logout();
  });

  it('should check if sidebar is closed, open it, reload and check if still open', () => {
    cy.get(document.documentPreviewSidebar.tabs.details).should('not.exist');
    cy.get(document.documentPreviewSidebar.toggle).click();
    cy.get(document.documentPreviewSidebar.tabs.details);
    cy.reload();
    // cy.wait(5000);
    cy.get(document.documentPreviewSidebar.tabs.details);
  });

  it('should check data in detail tab', () => {
    cy.get(document.documentPreviewSidebar.toggle).click();
    // check cancel
    cy.get(document.documentPreviewDetails.edit).click();
    fillInEditDetails(newName, newDocumentType, newAccesLevel);
    cy.get(document.documentPreviewDetails.editor.confidentiality).click();
    cy.get(document.documentPreviewDetails.cancel).click();
    cy.get(document.documentPreviewDetails.name).should('contain', bisName);
    cy.get(document.documentPreviewDetails.documentType).should('contain', file.fileType);
    cy.get(document.documentPreviewDetails.accesLevel).should('contain', defaultAccessLevel);

    // check reroll editor after cancel
    cy.get(document.documentPreviewDetails.edit).click();
    cy.get(document.documentPreviewDetails.editor.name).should('have.value', bisName);
    cy.get(document.documentPreviewDetails.editor.documentType).should('contain', file.fileType);
    cy.get(document.documentPreviewDetails.editor.accesLevel).should('contain', defaultAccessLevel);
    // check save
    fillInEditDetails(newName, newDocumentType, newAccesLevel);
    cy.route('PATCH', '/pieces/*').as('patchPieces');
    cy.get(document.documentPreviewDetails.save).click();
    cy.wait('@patchPieces');
    cy.get(document.documentPreviewDetails.name).should('contain', newName);
    cy.get(document.documentPreviewDetails.documentType).should('contain', newDocumentType);
    cy.get(document.documentPreviewDetails.accesLevel).should('contain', newAccesLevel);
    // check option after 20
    cy.get(document.documentPreviewDetails.edit).click();
    cy.get(document.documentPreviewDetails.editor.documentType).click();
    cy.get(dependency.emberPowerSelect.searchInput).click()
      .wait(1000)
      .type(searchDocumentType);
    cy.wait(1000);
    cy.get(dependency.emberPowerSelect.option).contains(searchDocumentType)
      .click();
    cy.route('PATCH', '/document-containers/*').as('patchDocumentContainers');
    cy.get(document.documentPreviewDetails.save).click();
    cy.wait('@patchDocumentContainers');
    cy.get(document.documentPreviewDetails.documentType).should('contain', searchDocumentType);
    // check content of document
    // cy commands stop when they reach #document in iframes
    cy.get(document.documentView.pdfView).its('0.contentDocument.body')
      .within(() => {
        cy.contains('Test om een file toe te voegen met cypress');
      });
  });

  // TODO-profiles
  // it('should check access to details tab', () => {
  //   cy.get(document.documentPreviewSidebar.toggle).click();
  //   changeProfileAndVisitDocView('Kanselarij');
  //   cy.get(document.documentPreviewDetails.edit);
  //   changeProfileAndVisitDocView('Kabinet');
  //   cy.get(document.documentPreviewDetails.edit).should('not.exist');
  //   changeProfileAndVisitDocView('Minister');
  //   cy.get(document.documentPreviewDetails.edit).should('not.exist');
  //   changeProfileAndVisitDocView('Ondersteuning Vlaamse Regering en Betekeningen');
  //   cy.get(document.documentPreviewDetails.edit).should('not.exist');
  //   changeProfileAndVisitDocView('Overheid');
  //   cy.get(document.documentPreviewDetails.edit).should('not.exist');
  // });

  it('should check versions in version tab', () => {
    cy.get(document.documentPreviewSidebar.toggle).click();
    cy.get(document.documentPreviewSidebar.versions).click();
    cy.get(document.documentPreviewVersionCard.name).contains(newName)
      .parents(document.documentPreviewVersionCard.container)
      .should('have.class', 'auk-document-card active')
      .within(() => {
        cy.get(document.documentPreviewVersionCard.details).contains(`${newAccesLevel} - ${searchDocumentType}`);
        cy.get(auk.confidentialityPill.unlocked);
        cy.get(auk.fileTypePill).contains('PDF');
      });
    cy.get(document.documentPreviewVersionCard.name).eq(1)
      .parents(document.documentPreviewVersionCard.container)
      .find(document.documentPreviewVersionCard.open)
      .click()
      .parents(document.documentPreviewVersionCard.container)
      .should('have.class', 'auk-document-card active')
      .within(() => {
        cy.get(document.documentPreviewVersionCard.details).contains(`${defaultAccessLevel} - ${searchDocumentType}`);
        cy.get(auk.confidentialityPill.unlocked);
        cy.get(auk.fileTypePill).contains('PDF');
      });
    cy.get(document.documentPreviewSidebar.tabs.details).click();
    cy.get(document.documentPreviewDetails.name).should('contain', file.fileName);
    cy.get(document.documentPreviewDetails.name).should('not.contain', newName);
    cy.get(document.documentPreviewDetails.documentType).should('contain', file.fileType);
    cy.get(document.documentPreviewDetails.accesLevel).should('contain', defaultAccessLevel);
    cy.get(auk.fileTypePill).contains('PDF');
  });
});
