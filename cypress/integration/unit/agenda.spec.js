import modal from "../../selectors/modal.selectors";
import agenda from '../../selectors/agenda.selectors';
import actionModel from '../../selectors/action-modal.selectors';

/*global context, before, it, cy,beforeEach, afterEach, Cypress*/
/// <reference types="Cypress" />

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
    cy.createAgenda('Elektronische procedure', agendaDateSingleTest, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.deleteAgenda(result.meetingId, true);
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
    const agendaDate = Cypress.moment().add(3, 'weeks').day(5); // Friday in three weeks
    cy.createAgenda('Elektronische procedure', agendaDate, 'Daar').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.openAgendaForDate(agendaDate);
      cy.setFormalOkOnItemWithIndex(0);
      cy.approveDesignAgenda();
      cy.deleteAgenda(result.meetingId);
      cy.closeAgenda();
    });
  });

  it('Should not be able to close a session with only a design agenda, cfr. KAS-1551', () => {
    const agendaDate = Cypress.moment().add(4, 'weeks').day(5); // Friday in four weeks
    cy.createAgenda('Elektronische procedure', agendaDate, 'Daar');
    cy.openAgendaForDate(agendaDate);
    cy.get('.vl-button--icon-before')
      .contains('Acties')
      .click();
    cy.get(actionModel.lockAgenda).should('not.exist');
  });

  it('should edit nota on agendaitem and trim whitespaces', () => {
    const testId = 'testId=' + currentTimestamp() + ': ';

    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const agendaDate = Cypress.moment().add(2, 'weeks').day(1);
    cy.createAgenda(KIND, agendaDate, PLACE);
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
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
    cy.contains("dit is de korte titel").click();
    cy.get(agenda.agendaitemTitlesEdit).should('exist').should('be.visible').click();
    cy.get(agenda.agendaitemTitlesEditShorttitle).clear();
    cy.get(agenda.agendaitemTitlesEditShorttitle).type("dit is de korte titel\n\n");

    cy.get(agenda.agendaitemTitlesEditTitle).clear();
    cy.get(agenda.agendaitemTitlesEditTitle).type("dit is de lange titel\n\n");

    cy.get(agenda.agendaitemTitlesEditSave).should('exist').should('be.visible').click();
    cy.get(agenda.agendaitemTitlesEdit).scrollIntoView();
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
  });

  it.only('It should be able to make a new agenda with a meetingID and another meeting will automatically get the next meetingID assigned in the UI', () => {
    const agendaDate = Cypress.moment().add(1, 'week').day(6);
    cy.createAgenda('Ministerraad', agendaDate, "Brussel", 1);
    cy.createAgenda('Ministerraad', agendaDate, "Brussel").then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.get(actionModel.showActionOptions).click();
      cy.get(actionModel.toggleeditingsession).click();
      cy.get('input[type="number"]').should('have.value', result.meetingNumber);
      cy.visit('/');
      cy.get(agenda.createNewAgendaButton).click();
      cy.wait(500);
      cy.get('input[type="number"]').should('have.value',(parseInt(result.meetingNumber) + 1).toString());
    });
  });
});

function currentTimestamp() {
  return Cypress.moment().unix();
}
