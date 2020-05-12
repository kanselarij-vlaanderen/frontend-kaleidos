/*global context, before, it, cy*/
/// <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import actionModal from '../../selectors/action-modal.selectors';

context('Agendaitem changes tests', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });
  const caseTitle = 'testId=1589266576: Cypress test dossier 1';
  const subcaseTitle1 = caseTitle + ' test stap 1';
  const subcaseTitle2 = caseTitle + ' test stap 2';
  const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
  const files = [file];
  const waitTime = 3000;

  it('should add a document to an agenda and should highlight as added', () => {
    cy.visit('/agenda/5EBA48CF95A2760008000006/agendapunten');
    cy.addDocumentsToAgendaItem(subcaseTitle1, files);
    cy.wait(waitTime); //Computeds are not reloaded yet , maybe
    cy.toggleShowChanges(true);
    cy.agendaItemExists(subcaseTitle1);
  });

  it('should add an agendaitem and highlight it as changed', () => {
    cy.visit('/agenda/5EBA48CF95A2760008000006/agendapunten');
    // when toggling show changes  the agendaitem added since current agenda should show
    cy.addAgendaitemToAgenda(subcaseTitle2, false);
    cy.wait(waitTime); //Computeds are not reloaded yet , maybe
    cy.toggleShowChanges(true);
    cy.agendaItemExists(subcaseTitle2);

    cy.setFormalOkOnAllItems();
    cy.approveDesignAgenda();
  });
  it('should add a document version to an item and highlight it as changed', () => {
    cy.visit('/agenda/5EBA48CF95A2760008000006/agendapunten');
    // when toggling show changes  the agendaitem with a new document version should show
    cy.addNewDocumentVersionToAgendaItem(subcaseTitle1, file.newFileName , file);
    cy.wait(waitTime); //Computeds are not reloaded yet , maybe
    cy.toggleShowChanges(true);
    cy.agendaItemExists(subcaseTitle1);

    // when navigating to print view, should contain all relevant info
    cy.get(actionModal.showActionOptions).click();
    cy.get(agenda.navigateToPrintableAgenda).click();

    cy.get(agenda.printHeaderTitle).should('exist').should('be.visible');
    cy.get(agenda.printHeaderTitle).contains('Vergadering van');
    cy.get(agenda.printHeaderTitle).contains('dinsdag 02 juni 2020 om 20:20');

    cy.get(agenda.printContainer).should('exist').should('be.visible');
    cy.get(agenda.printContainer).contains('Goedkeuring van het verslag van de vergadering van vrijdag 22-11-2019.');
    cy.get(agenda.printContainer).contains(subcaseTitle1);
    cy.get(agenda.printContainer).contains(subcaseTitle2);
    cy.get(agenda.printContainer).contains('Cypress test voor het testen van toegevoegde documenten');
  });
});

function currentMoment() {
  return Cypress.moment();
}

function currentTimestamp() {
  return Cypress.moment().unix();
}
