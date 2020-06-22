import modal from '../../selectors/modal.selectors';
import agenda from '../../selectors/agenda.selectors';
import actionModel from '../../selectors/action-modal.selectors';

/* global context, before, it, cy,beforeEach, afterEach, Cypress */
/// <reference types="Cypress" />

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Agenda tests', () => {
  const agendaDate = Cypress.moment().add(1, 'weeks').day(5); // Next friday

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });
  it('should create a new agenda and then delete it', () => {
    const agendaDateSingleTest = Cypress.moment().add(2, 'weeks').day(5); // Friday in two weeks

    cy.createAgenda('Elektronische procedure', agendaDateSingleTest, 'Zaal oxford bij Cronos Leuven')
      .then((meetingId) => {
        cy.openAgendaForDate(agendaDateSingleTest);
        cy.deleteAgenda(meetingId, true);
      });
  });

  it('should set formal ok on all agendaitems and approve it', () => {
    cy.openAgendaForDate(agendaDate);
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
    cy.get(modal.agenda.approveAgenda).should('not.exist');
  });

  it('should add an agendaitem to an agenda', () => {
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(false);
  });

  it('Should be able to close a session with only 1 approved agenda, cfr. KAS-1551', () => {
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks').day(5); // Friday in three weeks
    cy.createAgenda('Elektronische procedure', agendaDate, 'Daar').then((meetingId) => {
      cy.openAgendaForDate(dateToCreateAgenda);
      cy.setFormalOkOnItemWithIndex(0);
      cy.approveDesignAgenda();
      cy.deleteAgenda(meetingId);
      cy.closeAgenda();
    });
  });

  it('Should not be able to close a session with only a design agenda, cfr. KAS-1551', () => {
    const dateToCreateAgenda = Cypress.moment().add(4, 'weeks').day(5); // Friday in four weeks
    cy.createAgenda('Elektronische procedure', agendaDate, 'Daar');
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.get('.vl-button--icon-before')
      .contains('Acties')
      .click();
    cy.get(actionModel.lockAgenda).should('not.exist');
  });

  it('should edit nota on agendaitem and trim whitespaces', () => {
    const testId = `testId=${currentTimestamp()}: `;

    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const dateToCreateAgenda = Cypress.moment().add(2, 'weeks').day(1);
    cy.createAgenda(KIND, agendaDate, PLACE);
    cy.openAgendaForDate(agendaDate);

    const case1TitleShort = `${testId}Cypress test dossier 1`;
    const type1 = 'Nota';
    const newSubcase1TitleShort = 'dit is de korte titel\n\n';
    const subcase1TitleLong = 'dit is de lange titel\n\n';
    const subcase1Type = 'In voorbereiding';
    const subcase1Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case1TitleShort);
    cy.addSubcase(type1, newSubcase1TitleShort, subcase1TitleLong, subcase1Type, subcase1Name);
    cy.openSubcase(0);

    cy.proposeSubcaseForAgenda(dateToCreateAgenda);
    cy.openAgendaForDate(agendaDate);
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
    cy.contains('dit is de korte titel').click();
    cy.get(agenda.subcaseTitlesEdit).should('exist').should('be.visible').click();
    cy.get(agenda.subcaseTitlesEditShorttitleOfSubcase).clear();
    cy.get(agenda.subcaseTitlesEditShorttitleOfSubcase).type('dit is de korte titel\n\n');

    cy.get(agenda.subcaseTitlesEditTitleOfSubcase).clear();
    cy.get(agenda.subcaseTitlesEditTitleOfSubcase).type('dit is de lange titel\n\n');

    cy.get(agenda.subcaseTitlesEditSave).should('exist').should('be.visible').click();
    cy.get(agenda.subcaseTitlesEdit).scrollIntoView();
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
  });
});
