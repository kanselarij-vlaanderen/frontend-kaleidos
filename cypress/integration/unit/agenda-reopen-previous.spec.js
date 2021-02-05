/* global context, before, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agendaSelector from '../../selectors/agenda.selectors';
import modalSelector from '../../selectors/modal.selectors';
import auComponentSelector from '../../selectors/au-component-selectors';

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
  const designAgendaDeleteModalTitle = 'Ontwerpagenda verwijderen';
  const agendaReopenModalTitle = 'Agenda heropenen';
  const designAgendaATitle = 'Ontwerpagenda A';
  const designAgendaCTitle = 'Ontwerpagenda C';
  const agendaReopenPreviousVersionMenuActionItem = 'Vorige versie heropenen';


  it('should delete current design agenda and reopen previous accepted agenda', () => {
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.createAgenda('Elektronische procedure', dateToCreateAgenda, 'Daar');
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
    cy.contains(designAgendaBTitle).should('exist');
    cy.contains(designAgendaATitle).should('not.exist');
    cy.get(agendaSelector.agendaActions).click();
    cy.get(agendaSelector.reopenPreviousVersion).click();
    cy.get(auComponentSelector.auAlert.message).contains(designAgendaDeleteModalTitle, {
      timeout: 5000,
    });
    cy.get(auComponentSelector.auAlert.message).contains(agendaReopenModalTitle, {
      timeout: 5000,
    });
    cy.get(modalSelector.auModal.save).contains('Vorige versie heropenen')
      .click();
    cy.wait('@getAgendas');
    cy.contains(designAgendaBTitle).should('not.exist');
    cy.contains(designAgendaATitle).should('exist');
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
    cy.get(agendaSelector.agendaActions).click();
    cy.contains(agendaReopenPreviousVersionMenuActionItem).should('not.exist');
    cy.contains(designAgendaBTitle).should('not.exist');
    cy.deleteAgenda();
    cy.get(agendaSelector.agendaActions).click();
    cy.get(agendaSelector.createNewDesignAgenda).click();
    cy.wait('@getAgendas');
    cy.contains(designAgendaATitle).should('not.exist');
    cy.contains(designAgendaBTitle).should('exist');
    cy.get(agendaSelector.agendaActions).click();
    cy.contains(agendaReopenPreviousVersionMenuActionItem).should('exist');
  });
});
