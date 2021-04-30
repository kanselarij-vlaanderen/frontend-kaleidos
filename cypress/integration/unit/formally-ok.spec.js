/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import modal from '../../selectors/modal.selectors';
import auComponent from '../../selectors/au-component-selectors';

context('Formally ok/nok tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // This test could be replaced by checking that approved agenda is not showing formal ok's in existing testdata
  it('should not show "formallyOk" status of agendaitems on approved agenda', () => {
    cy.visit('/vergadering/5EBAB9B1BDF1690009000001/agenda/1d4f8091-51cf-4d3c-b776-1c07cc263e59/agendapunten');
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 1);
    cy.get('.vlc-agenda-items__status').should('contain', 'Formeel OK');
    cy.setFormalOkOnItemWithIndex(0, true, 'Nog niet formeel OK');
    cy.get(agenda.agendaHeaderShowAgendaOptions).click();
    cy.get(agenda.approveAgenda).click();
    cy.get(auComponent.auAlert.message).should('exist');
    // TODO optional, check if there is no au-alert in the new pop?
    cy.get(modal.auModal.cancel).click();
    cy.setFormalOkOnItemWithIndex(0, true, 'Formeel OK');
    cy.get('.auk-sidebar__item').as('agendas');
    cy.get('@agendas').eq(1)
      .click();
    cy.wait(2000); // Make sure the formally ok can load (false positive if testing immediately)
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 1);
    cy.get('.vlc-agenda-items__status').should('not.contain', 'Formeel OK');
    // TODO this test does more than needed to assert what it should. open any agenda and check for the absence of "formeel ok"
    // "formeel niet ok" and "formeel nog niet ok" status are not allowed on approved agendas
  });
});
