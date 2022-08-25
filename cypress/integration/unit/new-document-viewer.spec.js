/* global context, it, cy, beforeEach, afterEach, Cypress, before */
// / <reference types="Cypress" />

import document from '../../selectors/document.selectors';
import dependency from '../../selectors/dependency.selectors';

context('new document viewer tests', () => {
  function fillInEditDetails(newName, newDocumentType, newAccessLevel) {
    cy.get(document.previewDetailsTab.editing.name).click()
      .clear()
      .type(newName);
    cy.get(document.previewDetailsTab.editing.documentType).click();
    cy.get(dependency.emberPowerSelect.option).contains(newDocumentType)
      .click();
    cy.get(document.previewDetailsTab.editing.accessLevel).click();
    cy.get(dependency.emberPowerSelect.option).contains(newAccessLevel)
      .click();
  }

  // function changeProfileAndVisitDocView(profile) {
  //   cy.logoutFlow();
  //   cy.login(profile);
  //   cy.visit(`/document/${this.documentId}`);
  //   cy.get(document.documentPreviewSidebar.tabs.details);
  // }

  const fileName = 'test pdf';
  const agendaKind = 'Ministerraad';
  const agendaPlace = 'Cypress Room';
  const agendaDate = Cypress.dayjs().add(2, 'weeks')
    .day(2);
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
  };
  const files = [file];
  const newVersionfile = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };

  before(() => {
    cy.login('Admin');
    cy.createAgenda(agendaKind, agendaDate, agendaPlace);
    cy.openAgendaForDate(agendaDate);
    cy.addDocumentsToApprovalItem('Goedkeuring van het verslag', files);
    cy.addNewPieceToApprovalItem('Goedkeuring van het verslag', file.newFileName, newVersionfile);
    cy.logoutFlow();
  });
  const defaultAccessLevel = 'Intern Regering';
  const bisName = 'test pdfBIS';
  const newName = 'new name test';
  const newDocumentType = 'BVR';
  const newAccessLevel = 'Intern Overheid';
  const searchDocumentType = 'Advies AgO';

  beforeEach(() => {
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
    cy.get(document.documentPreviewSidebar.open).click();
    cy.get(document.documentPreviewSidebar.tabs.details);
    cy.reload();
    cy.get(document.documentPreviewSidebar.tabs.details);
  });

  it('should check data in detail tab', () => {
    cy.get(document.documentPreviewSidebar.open).click();
    // check cancel
    cy.get(document.previewDetailsTab.edit).click();
    fillInEditDetails(newName, newDocumentType, newAccessLevel);
    cy.get(document.previewDetailsTab.cancel).click();
    cy.get(document.previewDetailsTab.name).should('contain', bisName);
    cy.get(document.previewDetailsTab.documentType).should('contain', file.fileType);
    cy.get(document.previewDetailsTab.accessLevel).should('contain', defaultAccessLevel);

    // check reroll editor after cancel
    cy.get(document.previewDetailsTab.edit).click();
    cy.get(document.previewDetailsTab.editing.name).should('have.value', bisName);
    cy.get(document.previewDetailsTab.editing.documentType).should('contain', file.fileType);
    cy.get(document.previewDetailsTab.editing.accessLevel).should('contain', defaultAccessLevel);
    // check save
    fillInEditDetails(newName, newDocumentType, newAccessLevel);
    cy.intercept('PATCH', '/pieces/*').as('patchPieces');
    cy.get(document.previewDetailsTab.save).click();
    cy.wait('@patchPieces');
    cy.get(document.previewDetailsTab.name).should('contain', newName);
    cy.get(document.previewDetailsTab.documentType).should('contain', newDocumentType);
    cy.get(document.previewDetailsTab.accessLevel).should('contain', newAccessLevel);
    // check option after 20
    cy.get(document.previewDetailsTab.edit).click();
    cy.get(document.previewDetailsTab.editing.documentType).click();
    cy.get(dependency.emberPowerSelect.searchInput).click()
      .wait(1000)
      .type(searchDocumentType);
    cy.wait(1000);
    cy.get(dependency.emberPowerSelect.option).contains(searchDocumentType)
      .click();
    cy.intercept('PATCH', '/document-containers/*').as('patchDocumentContainers');
    cy.get(document.previewDetailsTab.save).click();
    cy.wait('@patchDocumentContainers');
    cy.get(document.previewDetailsTab.documentType).should('contain', searchDocumentType);
    // check content of document
    // cy commands stop when they reach #document in iframes
    // cy.get(document.documentView.pdfView).its('0.contentDocument.body')
    //   .within(() => {
    //     cy.contains('Test om een file toe te voegen met cypress');
    //   });
  });

  // TODO-profiles
  // it('should check access to details tab', () => {
  //   cy.get(document.documentPreviewSidebar.open).click();
  //   changeProfileAndVisitDocView('Kanselarij');
  //   cy.get(document.previewDetailsTab.edit);
  //   changeProfileAndVisitDocView('Kabinet');
  //   cy.get(document.previewDetailsTab.edit).should('not.exist');
  //   changeProfileAndVisitDocView('Minister');
  //   cy.get(document.previewDetailsTab.edit).should('not.exist');
  //   changeProfileAndVisitDocView('Ondersteuning Vlaamse Regering en Betekeningen');
  //   cy.get(document.previewDetailsTab.edit).should('not.exist');
  //   changeProfileAndVisitDocView('Overheid');
  //   cy.get(document.previewDetailsTab.edit).should('not.exist');
  // });

  it('should check versions in version tab', () => {
    cy.get(document.documentPreviewSidebar.open).click();
    cy.get(document.documentPreviewSidebar.tabs.versions).click();
    cy.get(document.previewVersionCard.name).contains(`${newName}.pdf`)
      .parents(document.previewVersionCard.container)
      .should('have.class', 'active')
      .within(() => {
        cy.get(document.previewVersionCard.details).contains(`${searchDocumentType}`);
      });
    cy.get(document.previewVersionCard.name).eq(1)
      .parents(document.previewVersionCard.container)
      .click();
    cy.get(document.previewVersionCard.name).eq(1)
      .parents(document.previewVersionCard.container)
      .should('have.class', 'active')
      .within(() => {
        cy.get(document.previewVersionCard.details).contains(`${searchDocumentType}`);
      });
    cy.get(document.documentPreviewSidebar.tabs.details).click();
    cy.get(document.previewDetailsTab.name).should('contain', `${fileName}.pdf`);
    cy.get(document.previewDetailsTab.documentType).should('contain', searchDocumentType);
    cy.get(document.previewDetailsTab.accessLevel).should('contain', defaultAccessLevel);
  });
});
