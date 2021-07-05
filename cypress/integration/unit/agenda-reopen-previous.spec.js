/* global context, before, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';

context('Agenda reopen previous tests', () => {
  const dateToCreateAgenda = Cypress.moment().add(10, 'weeks')
    .day(3);

  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const designAgendaBTitle = 'Ontwerpagenda B';
  const designAgendaDeleteModalTitleAndVerify = 'Vorige versie heropenen';
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
    cy.get(auk.modal.header.title).contains(designAgendaDeleteModalTitleAndVerify, {
      timeout: 5000,
    });
    cy.get(auk.alert.message).contains(designAgendaBTitle, {
      timeout: 5000,
    });
    cy.get(auk.alert.message).contains('Agenda A', {
      timeout: 5000,
    });
    cy.get(agenda.agendaHeader.confirm.reopenPreviousVersion).contains(designAgendaDeleteModalTitleAndVerify)
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
