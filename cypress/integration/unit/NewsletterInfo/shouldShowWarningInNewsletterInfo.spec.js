/* global context, before, it, cy,beforeEach, Cypress */
/// <reference types="Cypress" />

import alert from '../../../selectors/alert.selectors';
import agenda from '../../../selectors/agenda.selectors';

context('Show warning in newsletterinfo', () => {
  // TODO: Create agenda
  // TODO: Create procedurestap
  // TODO: Add procedurestap to agenda
  // TODO: Switch to kortbestek tab
  // TODO: Warning should be there

  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should show warning in kortbestek view', () => {
    const caseTitle = `testId=${currentTimestamp()}: ` + 'Cypress test dossier 1';
    const agendaDate = Cypress.moment().add(1, 'weeks').day(2); // Next friday
    const subcaseTitle1 = `${caseTitle} test stap 1`;

    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];

    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.addDocumentsToAgendaItem(subcaseTitle1, files);

    cy.route('/');
    cy.openAgendaForDate(agendaDate);
    cy.addNewDocumentVersionToAgendaItem(subcaseTitle1, file.newFileName, file);

    cy.get(agenda.agendaItemKortBestekTab)
      .should('be.visible')
      .click()
      .wait(2000); // Access-levels GET occured earlier, general wait instead
    cy.get(alert.changesAlertComponent).should('be.visible');
  });
});

function currentTimestamp() {
  return Cypress.moment().unix();
}
