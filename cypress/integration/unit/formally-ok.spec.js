/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';

context('Formally ok/nok tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should not show "formallyOk" status of agendaitems on approved agenda', () => {
    cy.visitAgendaWithLink('/vergadering/5EBAB9B1BDF1690009000001/agenda/1d4f8091-51cf-4d3c-b776-1c07cc263e59/agendapunten');
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 1);
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Formeel OK');
    cy.changeSelectedAgenda('Agenda A');
    // approved agendas never show the formally ok status of the agendaitem
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 1);
    cy.get(agenda.agendaOverviewItem.status).should('not.exist');
  });

  // TODO-agendaheader this test belongs with other agenda-header tests
  it('should show warning when trying to approve agenda with "not yet formally ok" items', () => {
    cy.visitAgendaWithLink('/vergadering/5EBAB9B1BDF1690009000001/agenda/1d4f8091-51cf-4d3c-b776-1c07cc263e59/agendapunten');
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Formeel OK');
    cy.setFormalOkOnItemWithIndex(0, true, 'Nog niet formeel OK');
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Nog niet formeel OK');
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.approveAgenda).click();
    // "formeel niet ok" and "formeel nog niet ok" status are not approvable
    cy.get(auk.alert.message).should('exist');
    cy.get(auk.modal.footer.cancel).click();
    cy.setFormalOkOnItemWithIndex(0, true, 'Formeel OK');
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Formeel OK');
  });
});
