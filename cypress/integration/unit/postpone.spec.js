/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
// import document from '../../selectors/document.selectors';
import utils from '../../selectors/utils.selectors';


context('Decision postponing tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should postpone an agendaitem and change the status of the treatment', () => {
    // const agendaDate = Cypress.dayjs('2022-04-17');
    const SubcaseTitleShort = 'Cypress test: Decision postponing - postpone agendaitem & decision - 1652780867';

    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');
    // TODO-bug, cypress cannot press button right after page load, getters are async and not awaited
    cy.wait(2000);
    // postpone agendaitem on agenda B
    cy.intercept('PATCH', '/decision-activities/**').as('patchActivity1');
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.postpone).click();
    cy.wait('@patchActivity1');
    cy.get(utils.vlModal.dialogWindow).should('not.exist');
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.postponed).should('have.length', 1);

    // advance agendaitem
    cy.intercept('PATCH', '/decision-activities/**').as('patchActivity2');
    cy.get(agenda.agendaitemControls.actions).click();
    cy.get(agenda.agendaitemControls.action.postponeRevert).click();
    cy.wait('@patchActivity2');
    cy.get(utils.vlModal.dialogWindow).should('not.exist');
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.postponed).should('have.length', 0);

    // change decision result
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.url().should('contain', '/beslissingen');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivity');
    cy.get(agenda.decisionResultPill.edit).click();
    cy.get(agenda.agendaitemDecisionEdit.resultContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger).scrollIntoView()
        .click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Uitgesteld')
      .scrollIntoView()
      .click();
    cy.get(agenda.agendaitemDecisionEdit.save).click()
      .wait('@patchDecisionActivity');

    // check if the sidebar item is now greyed out because the decision is "postponed"
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaDetailSidebar.subitem).find(agenda.agendaDetailSidebarItem.postponed)
      .should('exist');
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(cases.subcaseDescription.panel).find(cases.subcaseTimeline.item)
      .as('phases');
    cy.get('@phases').eq(0)
      .contains(/Ingediend voor agendering op/);
    cy.get('@phases').eq(1)
      .contains(/Geagendeerd op de agenda van/);
    cy.get('@phases').eq(2)
      .contains(/Uitgesteld op de agenda van/);
    cy.get(auk.loader).should('not.exist');
  });

  it('should postpone an agendaitem', () => {
    const agendaDate = Cypress.dayjs().add(17, 'weeks');
    const agendaDateFormatted = agendaDate.format('D MMMM YYYY').toLowerCase();

    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');
    cy.approveAndCloseDesignAgenda();
    cy.releaseDecisions();

    cy.createAgenda('Ministerraad', agendaDate);

    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');
    cy.get(agenda.agendaitemPostponed.repropose).click();
    cy.intercept('POST', '/submission-activities').as('postSubmissionActivities');
    cy.intercept('POST', '/agenda-activities').as('postAgendaActivities');
    cy.intercept('POST', '/decision-activities').as('postDecisionActivities');
    cy.intercept('POST', '/agenda-item-treatments').as('postAgendaItemTreatments');
    cy.intercept('PATCH', '/submission-activities/**').as('patchSubmissonActivities');
    cy.get(agenda.agendaitemPostponed.proposableMeeting).contains(agendaDateFormatted)
      .click()
      .wait('@postSubmissionActivities')
      .wait('@postAgendaActivities')
      .wait('@postDecisionActivities')
      .wait('@postAgendaItemTreatments')
      .wait('@patchSubmissonActivities');
    cy.get(auk.loader).should('not.exist');

    // click link to latest meeting
    cy.get(agenda.agendaitemPostponed.latestMeeting).contains(agendaDateFormatted)
      .click();
    cy.get(agenda.agendaHeader.title).contains(agendaDateFormatted);
    cy.get(auk.loader).should('not.exist');

    // click link to subcase
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(auk.loader).should('not.exist');

    // check if timeline contains multiple phase blocks (1 block has max 3 phases)
    cy.get(cases.subcaseTimeline.item).eq(0)
      .contains('Ingediend voor');
    cy.get(cases.subcaseTimeline.item).eq(3)
      .contains('Ingediend voor');

    // check if meeting number contains multiple numbers
    cy.get(cases.subcaseDescription.meetingNumber).contains(/\d+, \d+/);

    // check for multiple agenda links
    cy.get(cases.subcaseDescription.agendaLink).should('have.length', 2);

    // check if decided on
    cy.get(cases.subcaseDescription.decidedOn).contains('Nog niet beslist');

    // check if planned start is last agenda
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(`Ingediend voor de agenda van ${agendaDateFormatted}`);
  });
});
