/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import utils from '../../selectors/utils.selectors';

context('meeting actions tests', () => {
  beforeEach(() => {
    cy.server();
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-agendaHeader

  it('should perform action delete agenda with agendaitems on designagenda', () => {
    cy.login('Admin');
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    // verify agenda B has agendaitem
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    cy.deleteAgenda('5EB287CDF359DD0009000008');
    // verify agendaitem is still ok on agenda A after delete designagenda
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    // verify delete agenda A works
    cy.deleteAgenda('5EB287CDF359DD0009000008', true);
    // verify subcase can be proposed for different agenda
    cy.visit('/dossiers/5EB287A9F359DD0009000005/deeldossiers/5EB287BBF359DD0009000007/overzicht');
    cy.get(cases.subcaseHeader.actions.proposeForAgenda);
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

  it('should not be able to delete approved agendaitem from designagenda with profile: Kanselarij', () => {
    const subcaseTitleShort = 'Cypress test: delete approve agenda Kanselarij - 1588775768';
    cy.login('Kanselarij');
    cy.visitAgendaWithLink('/vergadering/5EB2CB8FF5E126000900000D/agenda/cd6b8ae7-0f00-451c-b4ad-fa236d5e6a20/agendapunten');
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    // verify this profile does not have the option to delete approved agendaitems
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.delete).should('not.exist');
  });

  it('should be able to delete approved agendaitem from designagenda with profile: admin', () => {
    cy.login('Admin');
    const SubcaseTitleShort = 'Cypress test: delete approve agenda Admin - 1588776224';
    cy.visitAgendaWithLink('/vergadering/5EB2CD4EF5E1260009000015/agenda/9da67561-a827-47a2-8f58-8b3fd5739df4/agendapunten');
    cy.agendaitemExists(SubcaseTitleShort);
    // Verify agendaitem exists and has subcase on design agenda and agenda A
    cy.changeSelectedAgenda('Agenda A');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.contains('Naar procedurestap', {
      timeout: 12000,
    });
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.contains('Naar procedurestap', {
      timeout: 12000,
    });
    cy.wait(1000); // controls buttons is not clickable yet

    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.delete).click();

    cy.get(utils.vlModalVerify.container).within(() => {
      cy.get('.auk-button').contains('Verwijderen')
        .click();
    });
    cy.route('DELETE', 'agendaitems/**').as('deleteAgendaitem');
    cy.route('DELETE', 'agenda-activities/**').as('deleteAgendaActivity');
    cy.route('PATCH', 'subcases/**').as('patchSubcase');
    cy.wait('@deleteAgendaitem', {
      timeout: 12000,
    }); // 2 of these happen
    cy.wait('@deleteAgendaActivity', {
      timeout: 12000,
    });
    cy.wait('@patchSubcase', {
      timeout: 12000,
    });
    // TODO this is no longer a vl modal? cypress test does not wait while loading modal is still present
    cy.get(utils.vlModalVerify.container).should('not.be.visible');

    // Verify subcase is no longer on designagenda after deleting the agendaitem
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.clickReverseTab('Overzicht');
    cy.wait(1000);
    cy.get('li.vlc-agenda-items__sub-item h4')
      .contains(SubcaseTitleShort, {
        timeout: 2500,
      })
      .should('not.exist');
    // Verify subcase is no longer on agenda A after deleting the agendaitem
    cy.changeSelectedAgenda('Agenda A');
    cy.clickReverseTab('Overzicht');
    cy.wait(1000);
    cy.get('li.vlc-agenda-items__sub-item h4')
      .contains(SubcaseTitleShort, {
        timeout: 2500,
      })
      .should('not.exist');
  });
});
