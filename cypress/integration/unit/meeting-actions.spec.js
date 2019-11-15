/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('meeting actions tests', () => {
  const testStart = currentMoment();

  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 12).set('hour', 20).set('minute', 20);
  const caseTitle = 'Cypress test: meeting actions - ' + currentTimestamp();

  before(() => {
    cy.server();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.createCase(false, caseTitle);
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should perform action delete agenda with agendaitems on designagenda', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: delete agenda - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het verwijderen van een agenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 12).set('hour', 20).set('minute', 20);
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addAgendaitemToAgenda(SubcaseTitleShort, false);

      cy.setFormalOkOnAllItems();
      cy.approveDesignAgenda();
      // Verify agendaitem exists and has subcase on design agenda and agenda A
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});

      cy.changeSelectedAgenda('Agenda A');
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});
      cy.changeSelectedAgenda('Ontwerpagenda');
      cy.deleteAgenda(meetingId); 

      // Verify subcase is still ok on agenda A after delete designagenda
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});

      cy.deleteAgenda(meetingId,true);
    });
  });

  it('should perform action close agenda with agendaitems on designagenda', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: close agenda - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het sluiten van een agenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 13).set('hour', 20).set('minute', 20);
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addAgendaitemToAgenda(SubcaseTitleShort, false);

      cy.setFormalOkOnAllItems();
      cy.approveDesignAgenda();
      // Verify agendaitem exists and has subcase on design agenda and agenda A
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});

      cy.changeSelectedAgenda('Agenda A');
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});
      cy.changeSelectedAgenda('Ontwerpagenda');
      cy.closeAgenda(); 

      // Verify subcase is still ok on agenda A after closing the agenda (designagenda is deleted if present)
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});
      cy.deleteAgenda(meetingId,true);
    });
  });


  after(() => {
    cy.task('deleteProgress', { date: testStart.format('YYYY-MM-DD'), time: testStart.toISOString()});
  })
});

function currentMoment() {
  return Cypress.moment();
}
function currentTimestamp() {
  return Cypress.moment().unix();
}