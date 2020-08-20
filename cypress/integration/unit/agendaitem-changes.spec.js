/* global context, beforeEach, it, cy */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import actionModal from '../../selectors/action-modal.selectors';

context('Agendaitem changes tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });
  const caseTitle = 'testId=1589266576: Cypress test dossier 1';
  const subcaseTitle1 = `${caseTitle} test stap 1`;
  const subcaseTitle2 = `${caseTitle} test stap 2`;
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
  };
  const files = [file];
  const waitTime = 3000;

  it('should add a document to an agenda and should highlight as added', () => {
    cy.visit('/vergadering/5EBA48CF95A2760008000006/agenda/f66c6d79-6ad2-49e2-af55-702df3a936d8/agendapunten');
    cy.addDocumentsToAgendaitem(subcaseTitle1, files);
    cy.setFormalOkOnItemWithIndex(1);
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.toggleShowChanges(true);
    cy.agendaitemExists(subcaseTitle1);
  });

  it('should add an agendaitem and highlight it as changed', () => {
    cy.visit('/vergadering/5EBA48CF95A2760008000006/agenda/f66c6d79-6ad2-49e2-af55-702df3a936d8/agendapunten');
    cy.wait(2000);
    // when toggling show changes  the agendaitem added since current agenda should show
    cy.addAgendaitemToAgenda(subcaseTitle2, false);
    cy.setFormalOkOnItemWithIndex(2);
    cy.toggleShowChanges(true);
    cy.get('li.vlc-agenda-items__sub-item').should('have.length', 3)
      .then(() => {
        cy.agendaitemExists(subcaseTitle2);
        cy.setFormalOkOnItemWithIndex(2);
        cy.approveDesignAgenda();
      });
  });
  it('should add a document version to an item and highlight it as changed', () => {
    cy.visit('/vergadering/5EBA48CF95A2760008000006/agenda/f66c6d79-6ad2-49e2-af55-702df3a936d8/agendapunten');
    cy.changeSelectedAgenda('Ontwerpagenda');
    // when toggling show changes  the agendaitem with a new document version should show
    cy.addNewDocumentVersionToAgendaitem(subcaseTitle1, file.newFileName, file);
    cy.wait(waitTime); // Computeds are not reloaded yet , maybe
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.toggleShowChanges(true);
    cy.agendaitemExists(subcaseTitle1);

    // when navigating to print view, should contain all relevant info
    cy.get(actionModal.showActionOptions).click();
    cy.get(agenda.navigateToPrintableAgenda).click();
    cy.wait(1000);
    cy.get(agenda.printHeaderTitle, {
      timeout: 80000,
    }).should('exist')
      .should('be.visible');
    cy.get(agenda.printHeaderTitle).contains('Vergadering van');

    cy.get(agenda.printContainer).should('exist')
      .should('be.visible');

    // this could fail with more or changed default data, you need at least 1 previous agenda when starting this test
    cy.get(agenda.printContainer).contains('Goedkeuring van het verslag van de vergadering van ');

    cy.get(agenda.printContainer).contains(subcaseTitle1);
    cy.get(agenda.printContainer).contains(subcaseTitle2);
    cy.get(agenda.printContainer).contains('Cypress test voor het testen van toegevoegde documenten');
  });
});
