/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />
import modal from '../../selectors/modal.selectors';
import agenda from '../../selectors/agenda.selectors';

context('meeting actions tests', () => {
  beforeEach(() => {
    cy.server();
  });

  afterEach(() => {
    cy.logout();
  });

  it('should perform action delete agenda with agendaitems on designagenda', () => {
    cy.login('Admin');
    cy.visit('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    cy.deleteAgenda('5EB287CDF359DD0009000008');

    // Verify subcase is still ok on agenda A after delete designagenda
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    cy.contains('Naar procedurestap', {
      timeout: 12000,
    });

    // Verify delete agenda A works
    cy.deleteAgenda('5EB287CDF359DD0009000008', true);
  });

  it('should perform action close agenda with agendaitems on designagenda', () => {
    cy.login('Admin');
    const SubcaseTitleShort = 'Cypress test: close agenda - 1588775338';
    cy.visitAgendaWithLink('/vergadering/5EB2C9CBF5E1260009000005/agenda/74e87383-80a4-4616-8814-5883cafa6da0/agendapunten');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.contains('Naar procedurestap', {
      timeout: 12000,
    });

    cy.changeSelectedAgenda('Agenda A');
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.contains('Naar procedurestap', {
      timeout: 12000,
    });
    cy.wait(1000);
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.closeAgenda();

    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.contains('Naar procedurestap', {
      timeout: 12000,
    });
  });

  it('should not be able to delete approved agendaitem from designagenda with profile: Kanselarij', () => {
    const SubcaseTitleShort = 'Cypress test: delete approve agenda Kanselarij - 1588775768';
    cy.login('Kanselarij');
    cy.visitAgendaWithLink('/vergadering/5EB2CB8FF5E126000900000D/agenda/cd6b8ae7-0f00-451c-b4ad-fa236d5e6a20/agendapunten');

    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.delete).should('not.exist');
  });

  it('should be able to delete approved agendaitem from designagenda with profile: admin', () => {
    cy.login('Admin');
    const SubcaseTitleShort = 'Cypress test: delete approve agenda Admin - 1588776224';
    cy.visitAgendaWithLink('/vergadering/5EB2CD4EF5E1260009000015/agenda/9da67561-a827-47a2-8f58-8b3fd5739df4/agendapunten');
    cy.agendaitemExists(SubcaseTitleShort); // this makes sure the page is reloaded after approving the agenda
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

    cy.get(modal.modal).within(() => {
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
    cy.get(modal.modal).should('not.be.visible');

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
