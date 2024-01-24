/* global context, it, cy, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';

context('meeting actions tests', () => {
  afterEach(() => {
    cy.logout();
  });

  it('should perform action close agenda with agendaitems on designagenda', () => {
    cy.login('Admin');
    const subcaseTitleShort = 'Cypress test: close agenda - 1588775338';
    cy.visitAgendaWithLink('/vergadering/5EB2C9CBF5E1260009000005/agenda/74e87383-80a4-4616-8814-5883cafa6da0/agendapunten');
    // verify agenda B has agendaitem
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    // verify agenda A has same agendaitem
    cy.changeSelectedAgenda('Agenda A');
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    // close agenda
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.closeAgenda();
    // verify agenda A still has agendaitem (no links broken)
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    // go to subcase and back to agenda, verify links are ok
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(cases.subcaseDescription.agendaLink).click();
    // checking url would be better, but it changes xx seconds after clicking the link and can fail because of it
    cy.get(agenda.agendaitemTitlesView.linkToSubcase);
  });

  it('should not be able to delete approved agendaitem from designagenda with profile: Secretarie', () => {
    const subcaseTitleShort = 'Cypress test: delete approve agenda Kanselarij - 1588775768';
    cy.login('Secretarie');
    cy.visitAgendaWithLink('/vergadering/5EB2CB8FF5E126000900000D/agenda/cd6b8ae7-0f00-451c-b4ad-fa236d5e6a20/agendapunten');
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    // verify this profile does not have the option to delete approved agendaitems
    cy.wait(2000); // controls buttons is not clickable yet (no calls are running, element detached from DOM)
    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.delete).should('not.exist');
  });

  it('should be able to delete approved agendaitem from designagenda with profile: admin', () => {
    cy.login('Admin');
    const subcaseTitleShort = 'Cypress test: delete approve agenda Admin - 1588776224';
    cy.visitAgendaWithLink('/vergadering/5EB2CD4EF5E1260009000015/agenda/9da67561-a827-47a2-8f58-8b3fd5739df4/agendapunten');
    cy.agendaitemExists(subcaseTitleShort);
    // Verify agendaitem exists on design agenda B and agenda A
    cy.changeSelectedAgenda('Agenda A');
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.openDetailOfAgendaitem(subcaseTitleShort);

    cy.wait(1000); // controls buttons is not clickable yet (no calls are running)
    // delete the agendaitem from approved agenda
    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.delete).forceClick();
    cy.intercept('DELETE', 'agendaitems/**').as('deleteAgendaitem');
    cy.intercept('DELETE', 'agenda-activities/**').as('deleteAgendaActivity');
    cy.intercept('DELETE', 'agenda-item-treatments/**').as('deleteAgendaItemTreatment');
    cy.intercept('DELETE', 'decision-activities/**').as('deleteDecisionActivity');
    cy.get(auk.confirmationModal.footer.confirm).contains('Verwijderen')
      .click();
    cy.wait('@deleteAgendaitem'); // 2 of these happen
    cy.wait('@deleteAgendaActivity');
    cy.wait('@deleteDecisionActivity');
    cy.wait('@deleteAgendaItemTreatment');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(appuniversum.loader, {
      timeout: 60000,
    }).should('not.exist'); // route is loading data after this action

    // Verify subcase is no longer on designagenda after deleting the agendaitem
    cy.get(agenda.agendaDetailSidebar.subitem)
      .contains(subcaseTitleShort, {
        timeout: 2500,
      })
      .should('not.exist');
    // Verify subcase is no longer on agenda A after deleting the agendaitem
    cy.changeSelectedAgenda('Agenda A'); // changing agenda takes you to "Overzicht" view
    cy.get(agenda.agendaOverviewItem.subitem)
      .contains(subcaseTitleShort, {
        timeout: 2500,
      })
      .should('not.exist');
  });
});
