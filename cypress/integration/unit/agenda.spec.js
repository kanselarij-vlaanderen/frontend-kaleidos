import modal from '../../selectors/modal.selectors';
import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import actionModel from '../../selectors/action-modal.selectors';

/* global context, before, it, cy,beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Agenda tests', () => {
  const agendaDate = Cypress.moment().add(1, 'weeks')
    .day(5); // Next friday

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logoutFlow();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should create a new agenda, visit persagenda and then delete agenda', () => {
    const agendaDateSingleTest = Cypress.moment().add(2, 'weeks')
      .day(5); // Friday in two weeks
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

  it('Ontwerpagenda goedkeuren en afsluiten...', () => {
    cy.openAgendaForDate(agendaDate);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveAndCloseDesignAgenda();
    cy.get(modal.agenda.approveAgenda).should('not.exist');
  });

  it('Should be able to close a session with only 1 approved agenda, cfr. KAS-1551', () => {
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(5); // Friday in three weeks
    cy.createAgenda('Elektronische procedure', dateToCreateAgenda, 'Daar').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.openAgendaForDate(dateToCreateAgenda);
      cy.setFormalOkOnItemWithIndex(0);
      cy.approveDesignAgenda();
      cy.deleteAgenda(result.meetingId);
      cy.closeAgenda();
    });
  });

  it('Should not be able to close a session with only a design agenda, cfr. KAS-1551', () => {
    const dateToCreateAgenda = Cypress.moment().add(4, 'weeks')
      .day(5); // Friday in four weeks
    cy.createAgenda('Elektronische procedure', dateToCreateAgenda, 'Daar');
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
    const dateToCreateAgenda = Cypress.moment().add(2, 'weeks')
      .day(1);
    cy.createAgenda(KIND, dateToCreateAgenda, PLACE);
    cy.openAgendaForDate(dateToCreateAgenda);

    const case1TitleShort = `${testId}Cypress test dossier 1`;
    const type1 = 'Nota';
    const newSubcase1TitleShort = 'dit is de korte titel\n\n';
    const subcase1TitleLong = 'dit is de lange titel\n\n';
    const subcase1Type = 'In voorbereiding';
    const subcase1Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    const case2TitleShort = `${testId}Cypress test dossier 2`;
    const type2 = 'Nota';
    const newSubcase2TitleShort = `${testId} korte titel`;
    const subcase2TitleLong = `${testId} lange titel`;
    const subcase2Type = 'In voorbereiding';
    const subcase2Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case1TitleShort);
    cy.addSubcase(type1, newSubcase1TitleShort, subcase1TitleLong, subcase1Type, subcase1Name);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(dateToCreateAgenda);

    cy.createCase(false, case2TitleShort);
    cy.addSubcase(type2, newSubcase2TitleShort, subcase2TitleLong, subcase2Type, subcase2Name);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(dateToCreateAgenda);

    cy.openAgendaForDate(dateToCreateAgenda);
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
    cy.contains('dit is de korte titel').click();
    cy.get(agenda.agendaitemTitlesEdit).should('exist')
      .should('be.visible')
      .click();

    cy.get(form.formVlToggle).should('exist')
      .click();

    cy.get(agenda.agendaitemTitlesEditShorttitle).clear();
    cy.get(agenda.agendaitemTitlesEditShorttitle).type('dit is de korte titel\n\n');

    cy.get(agenda.agendaitemTitlesEditTitle).clear();
    cy.get(agenda.agendaitemTitlesEditTitle).type('dit is de lange titel\n\n');

    cy.get(agenda.agendaitemTitlesEditExplanation).clear();
    cy.get(agenda.agendaitemTitlesEditExplanation).type('Dit is de opmerking');

    cy.get(agenda.agendaitemTitlesEditSave).should('exist')
      .should('be.visible')
      .click();
    cy.get(agenda.agendaitemTitlesEdit).scrollIntoView();
    cy.contains('dit is de korte titel');
    cy.contains('dit is de lange titel');
    cy.contains('Dit is de opmerking');
    cy.get(agenda.agendaitemTitelsConfidential).should('exist')
      .should('be.visible');
  });

  it('It should be able to make a new agenda with a meetingID and another meeting will automatically get the next meetingID assigned in the UI', () => {
    const agendaDate = Cypress.moment().add(1, 'week')
      .day(6);
    cy.createAgenda('Ministerraad', agendaDate, 'Brussel', 1);
    cy.createAgenda('Ministerraad', agendaDate, 'Brussel', null, 'VV AA 1999/2BIS').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.get(actionModel.showActionOptions).click();
      cy.get(actionModel.toggleeditingsession).click();
      cy.get('input[type="number"]').should('have.value', result.meetingNumber);
      cy.get(form.formInput).eq(1)
        .should('have.value', `${result.meetingNumberVisualRepresentation}`);
      cy.visit('/');
      cy.get(agenda.createNewAgendaButton).click();
      cy.wait(500);
      cy.get('input[type="number"]').should('have.value', (parseInt(result.meetingNumber, 10) + 1).toString());
    });
  });

  it('Should add agendaitems to an agenda and set all of them to formally OK', () => {
    const testId = `testId=${currentTimestamp()}: `;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks');

    const case1TitleShort = `${testId}Cypress test dossier 1`;
    const type1 = 'Nota';
    const newSubcase1TitleShort = 'dit is de korte titel\n\n';
    const subcase1TitleLong = 'dit is de lange titel\n\n';
    const subcase1Type = 'In voorbereiding';
    const subcase1Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    const case2TitleShort = `${testId}Cypress test dossier 2`;
    const type2 = 'Nota';
    const newSubcase2TitleShort = `${testId} korte titel`;
    const subcase2TitleLong = `${testId} lange titel`;
    const subcase2Type = 'In voorbereiding';
    const subcase2Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createAgenda('Elektronische procedure', dateToCreateAgenda, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.createCase(false, case1TitleShort);
      cy.addSubcase(type1, newSubcase1TitleShort, subcase1TitleLong, subcase1Type, subcase1Name);
      cy.openSubcase(0);
      cy.proposeSubcaseForAgenda(dateToCreateAgenda);

      cy.createCase(false, case2TitleShort);
      cy.addSubcase(type2, newSubcase2TitleShort, subcase2TitleLong, subcase2Type, subcase2Name);
      cy.openSubcase(0);
      cy.proposeSubcaseForAgenda(dateToCreateAgenda);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.setAllItemsFormallyOk(3);
    });
  });
});
