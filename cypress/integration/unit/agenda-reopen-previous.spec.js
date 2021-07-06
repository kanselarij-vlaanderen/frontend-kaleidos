/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';

context('Agenda reopen previous tests', () => {
  const dateToCreateAgenda = Cypress.moment().add(10, 'weeks')
    .day(3);

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const designAgendaBTitle = 'Ontwerpagenda B';
  const reopenPreviousVersion = 'Vorige versie heropenen';
  const designAgendaATitle = 'Ontwerpagenda A';
  const designAgendaCTitle = 'Ontwerpagenda C';

  it('should delete current design agenda and reopen previous accepted agenda', () => {
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.createAgenda('Elektronische procedure', dateToCreateAgenda, 'Daar');
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.setFormalOkOnItemWithIndex(0);
    // TODO test existance of the action on design agenda A (not.exist)
    cy.approveDesignAgenda();
    cy.contains(designAgendaBTitle).should('exist');
    cy.contains(designAgendaATitle).should('not.exist');
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.reopenPreviousVersion).click();
    cy.get(auk.modal.header.title).contains(reopenPreviousVersion);
    cy.get(auk.alert.message).contains(designAgendaBTitle);
    cy.get(auk.alert.message).contains('Agenda A');
    cy.get(auk.loader).should('not.exist'); // data loading task might be running, disabling the next button
    cy.get(agenda.agendaHeader.confirm.reopenPreviousVersion).contains(reopenPreviousVersion)
      .click();
    cy.wait('@getAgendas');
    cy.contains(designAgendaBTitle).should('not.exist');
    cy.contains(designAgendaATitle).should('exist');
    // TODO test if action does not exist on ontwerpagenda A
    cy.approveDesignAgenda();
  });

  it('should not show action menu item Vorige versie heropenen in action menu when not design agenda', () => {
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.contains(designAgendaBTitle).should('exist');
    cy.contains(designAgendaATitle).should('not.exist');
    cy.approveDesignAgenda();
    cy.contains(designAgendaCTitle).should('exist');
    cy.deleteAgenda();
    cy.contains(designAgendaCTitle).should('not.exist');
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.reopenPreviousVersion).should('not.exist');
  });
});
