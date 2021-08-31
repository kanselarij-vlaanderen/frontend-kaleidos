/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
// import auk from '../../selectors/auk.selectors';

context('Agenda-Header actions tests', () => {
  const dateToCreateAgenda = Cypress.moment().add(9, 'weeks')
    .day(1);
  const amountToRun = 1;

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('stress test action approveAgenda / reopenPreviousAgenda', () => {
    // agenda with 2 agendaitems
    cy.visitAgendaWithLink('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    for (let int = 0; int < amountToRun; int++) {
      cy.approveDesignAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.reopenPreviousAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A');
    }
    // agenda with only approval
    cy.createAgenda(null, dateToCreateAgenda, 'agenda-header tests 1');
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.setFormalOkOnItemWithIndex(0);
    for (let int = 0; int < amountToRun; int++) {
      cy.approveDesignAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.reopenPreviousAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A');
    }
  });

  it('stress test action approveAndCloseAgenda / deleteAgenda / reopenAgenda', () => {
    // agenda with 2 agendaitems
    cy.visitAgendaWithLink('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    cy.approveDesignAgenda();
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.approveAndCloseDesignAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B', false);
      cy.agendaNameExists('A', false);
      cy.deleteAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }

    // agenda with only approval
    const newDate = dateToCreateAgenda.add(1, 'day');
    cy.createAgenda(null, newDate, 'agenda-header tests 2');
    cy.openAgendaForDate(newDate);
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.approveAndCloseDesignAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B', false);
      cy.agendaNameExists('A', false);
      cy.deleteAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }
  });

  it('stress test action closeAgenda / reopenAgenda', () => {
    // agenda with 2 agendaitems
    cy.visitAgendaWithLink('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    cy.changeSelectedAgenda('Ontwerpagenda');
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.closeAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }

    // agenda with only approval
    const newDate = dateToCreateAgenda.add(2, 'day');
    cy.createAgenda(null, newDate, 'agenda-header tests 3');
    cy.openAgendaForDate(newDate);
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.closeAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }
  });
});
