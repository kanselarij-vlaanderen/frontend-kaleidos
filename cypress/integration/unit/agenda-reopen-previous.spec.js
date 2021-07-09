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

  const designAgendaB = 'Ontwerpagenda B';
  const approvedagendaA = 'Agenda A';
  const reopenPreviousVersion = 'Vorige versie heropenen';

  it('should delete current design agenda and reopen previous accepted agenda', () => {
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.createAgenda('Elektronische procedure', dateToCreateAgenda, 'Reopen previous test');
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.setFormalOkOnItemWithIndex(0);
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
    cy.agendaNameExists('A');
    // check if action does not exist on design agenda A
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.reopenPreviousVersion).should('not.exist');
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.approveDesignAgenda();
    // verify we have 2 agendas, A(approved) and B(design)
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B');
    cy.agendaNameExists('A', false);
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.reopenPreviousVersion).click();
    // Check the message in the confirm modal
    cy.get(auk.modal.header.title).contains(reopenPreviousVersion);
    cy.get(auk.alert.message).contains(designAgendaB);
    cy.get(auk.alert.message).contains(approvedagendaA);
    cy.get(auk.loader).should('not.exist'); // data loading task might be running, disabling the next button
    cy.get(agenda.agendaHeader.confirm.reopenPreviousVersion).contains(reopenPreviousVersion)
      .click();
    cy.wait('@getAgendas');
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
    cy.agendaNameExists('A');
  });

  // TODO-agendaHeader test existance of all the actions in different agenda status in 1 aggregated test
  it('should not show action menu item Vorige versie heropenen in action menu when not design agenda', () => {
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.approveDesignAgenda();
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B');
    cy.agendaNameExists('A', false);
    cy.approveDesignAgenda();
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 3);
    cy.agendaNameExists('C');
    cy.agendaNameExists('B', false);
    cy.agendaNameExists('A', false);
    cy.deleteAgenda();
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B', false);
    cy.agendaNameExists('A', false);
    // Check if action does not exist when there are multiple agendas but no design agenda
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.reopenPreviousVersion).should('not.exist');
  });
});
