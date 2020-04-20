import modal from "../../selectors/modal.selectors";

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
      cy.openAgendaForDate(agendaDateSingleTest, meetingId);
      cy.deleteAgenda(meetingId, true);
    });
  });

  it('should set formal ok on all agendaitems and approve it', () => {
    cy.openAgendaForDate(agendaDate);
    cy.setFormalOkOnAllItems();
    cy.approveDesignAgenda();
    cy.get(modal.agenda.approveAgenda).should('not.exist');
  });

  it('should add a remark with documents to an agenda', () => {
      cy.openAgendaForDate(agendaDate);
      cy.addRemarkToAgenda('Titel mededeling',
      'mededeling omschrijving',
      [{folder: 'files', fileName: 'test', fileExtension: 'pdf'}, {folder: 'files', fileName: 'test', fileExtension: 'txt'}]);
  });

  it('should add an agendaitem to an agenda', () => {
      cy.openAgendaForDate(agendaDate);
      cy.addAgendaitemToAgenda(false);
  });

});
