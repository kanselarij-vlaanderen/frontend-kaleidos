/* global context, before, it, cy,beforeEach */
// / <reference types="Cypress" />

import alert from '../../../selectors/alert.selectors';
import agenda from '../../../selectors/agenda.selectors';

context('Show warning in newsletterinfo', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should close warning in kortbestek view when nota is added but KB is not updated', () => {
    const caseTitle = 'testId=1589276690: Cypress test dossier 1';
    const subcaseTitle1 = `${caseTitle} test stap 1`;

    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };

    cy.visit('/vergadering/5EBA48CF95A2760008000006/agenda/f66c6d79-6ad2-49e2-af55-702df3a936d8/agendapunten');
    cy.addNewDocumentVersionToAgendaItem(subcaseTitle1, file.newFileName, file);
    cy.get(agenda.agendaitemKortBestekTab)
      .should('be.visible')
      .click()
      .wait(2000); // Access-levels GET occured earlier, general wait instead
    cy.get(alert.changesAlertComponent).should('be.visible');
    cy.get(alert.changesAlertComponentCloseButton).click();
    cy.get(alert.changesAlertComponent).should('not.be.visible');
  });
});
