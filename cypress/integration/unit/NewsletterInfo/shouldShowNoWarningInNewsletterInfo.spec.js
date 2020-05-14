/*global Cypress, context, before, it, cy, beforeEach*/
/// <reference types="Cypress" />

import alert from '../../../selectors/alert.selectors';

context('Show no warning in Newsletterinfo', () => {

  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should show no warning in kortbestek view', () => {
    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const plusMonths = 1;
    const agendaDate = currentMoment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
    const subcaseTitle1 = caseTitle + ' test stap 1';
    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.openAgendaItemKortBestekTab(subcaseTitle1);
    cy.get(alert.changesAlertComponent).should('not.be.visible');
  });

  function currentMoment() {
    return Cypress.moment();
  }

  function currentTimestamp() {
    return Cypress.moment().unix();
  }
});
