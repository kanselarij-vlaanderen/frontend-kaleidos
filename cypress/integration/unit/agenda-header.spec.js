/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';

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
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.reopenPreviousAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A');
      cy.approveDesignAgenda();
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
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
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
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
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

  it('should perform action delete agenda with agendaitems on designagenda', () => {
    cy.login('Admin');
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    // verify agenda B has agendaitem
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    cy.deleteAgenda();
    // verify agendaitem is still ok on agenda A after delete designagenda
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    // verify delete agenda A works
    cy.deleteAgenda(true);
    // verify subcase can be proposed for different agenda
    cy.visit('/dossiers/5EB287A9F359DD0009000005/deeldossiers/5EB287BBF359DD0009000007/overzicht');
    cy.get(cases.subcaseHeader.showProposedAgendas);
  });
});
