/* global context, it, cy, Cypress, beforeEach */
/// <reference types="Cypress" />

import actionModal from '../../../../../selectors/action-modal.selectors';

context('Trigger model actions for action dropdown', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should open navigateToSubcases modal when clicking on navigateToSubcases', () => {
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND, YEAR, JANUARI, DAY, PLACE);
    const agendaDate = Cypress.moment('2020-01-13').set({ hour: 10, minute: 10 });
    cy.openAgendaForDate(agendaDate);
    cy.openActionModal();
    cy.get(actionModal.navigatetosubcases).click();
  });
});
