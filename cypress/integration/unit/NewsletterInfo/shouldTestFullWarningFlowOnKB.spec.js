/* global context, before, it, cy,beforeEach */
// / <reference types="Cypress" />

import alert from '../../../selectors/alert.selectors';
import agenda from '../../../selectors/agenda.selectors';
import newsletter from '../../../selectors/newsletter.selectors';
import modal from '../../../selectors/modal.selectors';

context('Should upload nota, see the warning, close warning, edit KB and see no warning when revisiting', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Test full warning flow on KB', () => {
    const caseTitle = 'testId=1589281897: Cypress test dossier 1';
    const subcaseTitle1 = `${caseTitle} test stap 1`;
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    cy.visit('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/5EBA84AE0A655F0008000008');
    cy.addNewPieceToAgendaitem(subcaseTitle1, file.newFileName, file);

    cy.get(agenda.agendaitemNav.newsletterTab)
      .should('be.visible')
      .click()
      .wait(2000); // Access-levels GET occured earlier, general wait instead

    cy.get(alert.changesAlert).should('be.visible');
    cy.get(alert.changesAlertClose).click();
    cy.get(alert.changesAlert).should('not.be.visible');
    // Edit KB
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.get(newsletter.editItem.rdfaEditor).type('Aanpassing');
    cy.get(newsletter.editItem.Save).type('Aanpassing');
    cy.wait(2000);
    cy.get(modal.verify.save).click();
    cy.wait(5000);
    cy.get(agenda.agendaitemNav.documentsTab).should('be.visible')
      .click();
    cy.get(agenda.agendaitemNav.newsletterTab).should('be.visible')
      .click();
    cy.get(alert.changesAlert).should('not.be.visible');
  });
});
