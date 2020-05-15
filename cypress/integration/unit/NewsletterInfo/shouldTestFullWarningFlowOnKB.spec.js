/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

import alert from '../../../selectors/alert.selectors';
import agenda from '../../../selectors/agenda.selectors';
import newsletter from '../../../selectors/newsletter.selector';
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
    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const plusMonths = 1;
    const agendaDate = currentMoment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
    const subcaseTitle1 = caseTitle + ' test stap 1';

    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
    const files = [file];

    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.addDocumentsToAgendaItem(subcaseTitle1,files);

    cy.get(agenda.agendaItemKortBestekTab)
      .should('be.visible')
      .click()
      .wait(2000); //Access-levels GET occured earlier, general wait instead
    cy.get(alert.changesAlertComponent).should('not.be.visible');

    // Upload another file
    cy.route('/');
    cy.openAgendaForDate(agendaDate);
    cy.addNewDocumentVersionToAgendaItem(subcaseTitle1, file.newFileName , file);

    cy.get(agenda.agendaItemKortBestekTab)
      .should('be.visible')
      .click()
      .wait(2000); //Access-levels GET occured earlier, general wait instead

    cy.get(alert.changesAlertComponent).should('be.visible');
    cy.get(alert.changesAlertComponentCloseButton).click();
    cy.get(alert.changesAlertComponent).should('not.be.visible');
    //Edit KB
    cy.get(newsletter.edit).should('be.visible').click();
    cy.get(newsletter.rdfaEditor).type('Aanpassing');
    cy.get(newsletter.editSave).type('Aanpassing');
    cy.wait(2000);
    cy.get(modal.verify.save).click();
    cy.wait(5000);
    cy.get(agenda.agendaItemDocumentsTab).should('be.visible').click();
    cy.get(agenda.agendaItemKortBestekTab).should('be.visible').click();
    cy.get(alert.changesAlertComponent).should('not.be.visible');
  })
});

function currentMoment() {
  return Cypress.moment();
}

function currentTimestamp() {
  return Cypress.moment().unix();
}
