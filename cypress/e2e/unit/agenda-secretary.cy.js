/* global context, it, cy,beforeEach, afterEach, Cypress, expect */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import route from  '../../selectors/route.selectors';
import utils from  '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Agenda secretary tests', () => {
  const currentDefaultSecretary = 'Jeroen Overmeer';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should check adding nota on agenda without secretary', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test no secretary`;
    const subcaseTitle1 = `${caseTitle} test stap 1`;

    cy.createCase(caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het checken van de default secretaris op een agenda zonder secretaris'
    );

    cy.visitAgendaWithLink('vergadering/627E52AD89C002BE724F77B9/agenda/627E52AE89C002BE724F77BA/agendapunten/627E52AF89C002BE724F77BC?anchor=627E52AF89C002BE724F77BC');
    // check no secretary
    cy.get(mandatee.secretaryPanelView.container).contains('Er werd nog geen secretaris toegewezen');

    cy.addAgendaitemToAgenda(subcaseTitle1);
    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.get(utils.governmentAreasPanel.emptyState);
    cy.wait(2500); // hecking if this helps
  });

  it('should check default secretary', () => {
    const agendaDate = Cypress.dayjs().add(5, 'weeks')
      .day(2);
    const caseTitle1 = `testId=${currentTimestamp()}: Cypress test default secretary case 1`;
    const caseTitle2 = `testId=${currentTimestamp()}: Cypress test default secretary case 2`;
    const subcaseTitle1 = `${caseTitle1} test nota`;
    const subcaseTitle2 = `${caseTitle2} test mededeling`;

    cy.createCase(caseTitle1);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test nota voor het checken van de default secretaris'
    );
    cy.createCase(caseTitle2);
    cy.addSubcase('Mededeling',
      subcaseTitle2,
      'Cypress test mededeling voor het checken van de default secretaris'
    );

    cy.visit('/overzicht?sizeAgendas=2');
    cy.get(route.agendas.action.newMeeting, {
      timeout: 60000,
    }).click();
    // check meeting can't be created while the secretary is loading
    cy.intercept('GET', '/mandatees*').as('getMandatees');
    cy.get(agenda.editMeeting.save).should('be.disabled');
    cy.wait('@getMandatees');
    cy.get(agenda.editMeeting.save).should('not.be.disabled');
    // check current default secretary
    cy.get(utils.mandateeSelector.container).contains(currentDefaultSecretary);

    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .click();
    cy.setDateAndTimeInFlatpickr(agendaDate);
    // At this point, the flatpickr is still open and covers the other fields
    // To negate this, we click once with force:true on the next input field to close it
    cy.get(agenda.editMeeting.meetingNumber).click({
      force: true,
    });

    cy.intercept('POST', '/meetings').as('createMeeting');
    cy.intercept('POST', '/agendas').as('createAgenda');
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@createMeeting');
    cy.wait('@createAgenda');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1);
    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.get(mandatee.secretaryPanelView.row.name).contains(currentDefaultSecretary);

    cy.addAgendaitemToAgenda(subcaseTitle2);
    cy.openDetailOfAgendaitem(subcaseTitle2);
    cy.get(mandatee.secretaryPanelView.row.name).contains(currentDefaultSecretary);
  });

  it('should create agenda and change secretary', () => {
    const agendaDate = Cypress.dayjs().add(5, 'weeks')
      .day(3);
    const caseTitle1 = `testId=${currentTimestamp()}: Cypress test new secretary case 1`;
    const caseTitle2 = `testId=${currentTimestamp()}: Cypress test new secretary case 2`;
    const subcaseTitle1 = `${caseTitle1} test nota`;
    const subcaseTitle2 = `${caseTitle2} test mededeling`;
    const approvalTitle = 'Goedkeuring van het verslag van de vergadering van';
    const newSecretary = 'Dries Verhaeghe';

    cy.createCase(caseTitle1);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test nota voor het checken van de aangepaste secretaris'
    );
    cy.createCase(caseTitle2);
    cy.addSubcase('Mededeling',
      subcaseTitle2,
      'Cypress test mededeling voor het checken van de aangepaste secretaris'
    );
    cy.createAgenda(null, agendaDate, 'Zaal oxford bij Cronos Leuven');

    cy.openAgendaForDate(agendaDate);
    // change the secretary
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
    cy.get(agenda.editMeeting.secretary).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(newSecretary)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.intercept('PATCH', '/meetings/**').as('patchMeetings');
    cy.intercept('PATCH', '/internal-document-publication-activities/**').as('patchPublicationActivities');
    cy.intercept('PATCH', '/decision-activities/**').as('patchDecisionActivities');
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@patchMeetings');
    cy.wait('@patchPublicationActivities');
    cy.wait('@patchDecisionActivities');

    // check if approval has new secretary
    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.get(mandatee.secretaryPanelView.row.name).contains(newSecretary);

    // add nota and check if it has new secretary
    cy.addAgendaitemToAgenda(subcaseTitle1);
    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.get(mandatee.secretaryPanelView.row.name).contains(newSecretary);

    cy.addAgendaitemToAgenda(subcaseTitle2);
    cy.openDetailOfAgendaitem(subcaseTitle2);
    cy.get(mandatee.secretaryPanelView.row.name).contains(newSecretary);
  });

  it('should create agenda with different secretary and check patch calls on changes and no changes', () => {
    const agendaDate = Cypress.dayjs().add(5, 'weeks')
      .day(4);
    const approvalTitle = 'Goedkeuring van het verslag van de vergadering van';
    const newSecretary = 'Dries Verhaeghe';
    const newApprovalSecretary = 'Raf Suys';
    const location = 'Test no changes to secretary';
    const spy = cy.spy();

    cy.createAgenda(null, agendaDate, 'test', null, null, null, null, newSecretary);

    cy.openAgendaForDate(agendaDate);
    // check the secretary
    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.get(mandatee.secretaryPanelView.row.name).contains(newSecretary);

    // change the secretary
    cy.get(mandatee.secretaryPanelView.actions.edit).click();
    cy.get(utils.mandateeSelector.container).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(newApprovalSecretary)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.intercept('PATCH', '/decision-activities/**').as('patchDecisionActivities1');
    cy.get(mandatee.secretaryPanelEdit.actions.save).click();
    cy.wait('@patchDecisionActivities1');

    // select different secretary, then go back to previous secretary
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.editMeeting.secretary).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(currentDefaultSecretary)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.get(agenda.editMeeting.secretary).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(newSecretary)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.intercept('PATCH', '/meetings/**').as('patchMeetings1');
    cy.intercept('PATCH', '/internal-document-publication-activities/**').as('patchPublicationActivities1');
    cy.intercept('PATCH', '/decision-activities/**', spy).as('patchDecisionActivities2');
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@patchMeetings1');
    cy.wait('@patchPublicationActivities1');
    // decision activities patch should not happen
    cy.wait(2000).then(() => expect(spy).not.to.have.been.called);

    // change location
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.editMeeting.meetingLocation).click()
      .type(location);
    cy.intercept('PATCH', '/meetings/**').as('patchMeetings2');
    cy.intercept('PATCH', '/internal-document-publication-activities/**').as('patchPublicationActivities2');
    cy.intercept('PATCH', '/decision-activities/**', spy).as('patchDecisionActivities3');
    cy.wait(5000);
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@patchMeetings2');
    cy.wait('@patchPublicationActivities2');
    // decision activities patch should not happen
    cy.wait(2000).then(() => expect(spy).not.to.have.been.called);
  });
});
