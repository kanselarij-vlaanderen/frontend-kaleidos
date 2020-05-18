import modal from "../../selectors/modal.selectors";
import agenda from '../../selectors/agenda.selectors';

/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

context('Agenda tests', () => {
  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 1).set('hour', 20).set('minute', 20);

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should create a new agenda and then delete it', () => {
    const plusMonthsSingleTest = 1;
    const agendaDateSingleTest = Cypress.moment().add('month', plusMonthsSingleTest).set('date', 16).set('hour', 16).set('minute', 16);

    cy.createAgenda('Elektronische procedure', plusMonthsSingleTest, agendaDateSingleTest, 'Zaal oxford bij Cronos Leuven')
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

  it('should edit nota on agendaitem and trim whitespaces', () => {
    const testId = 'testId=' + currentTimestamp() + ': ';

    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const agendaDate = Cypress.moment().set({ "hour": 10, "minute": 10 });
    cy.createAgenda(KIND, 0, agendaDate, PLACE);
    cy.openAgendaForDate(agendaDate);

    const case_1_TitleShort = testId + 'Cypress test dossier 1';
    const type_1 = 'Nota';
    const newSubcase_1_TitleShort = 'dit is de korte titel\n\n';
    const subcase_1_TitleLong = 'dit is de lange titel\n\n';
    const subcase_1_Type = 'In voorbereiding';
    const subcase_1_Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case_1_TitleShort);
    cy.addSubcase(type_1, newSubcase_1_TitleShort, subcase_1_TitleLong, subcase_1_Type, subcase_1_Name);
    cy.openSubcase(0);

    cy.proposeSubcaseForAgenda(agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.contains("dit is de lange titel").click();
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
    cy.get(agenda.subcaseTitlesEdit).should('exist').should('be.visible').click();
    cy.get(agenda.subcaseTitlesEditShorttitleOfSubcase).clear();
    cy.get(agenda.subcaseTitlesEditShorttitleOfSubcase).type("dit is de korte titel\n\n");

    cy.get(agenda.subcaseTitlesEditTitleOfSubcase).clear();
    cy.get(agenda.subcaseTitlesEditTitleOfSubcase).type("dit is de lange titel\n\n");

    cy.get(agenda.subcaseTitlesEditSave).should('exist').should('be.visible').click();
    cy.get(agenda.subcaseTitlesEdit).scrollIntoView();
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
  })

});

function currentMoment() {
  return Cypress.moment();
}

function currentTimestamp() {
  return Cypress.moment().unix();
}
