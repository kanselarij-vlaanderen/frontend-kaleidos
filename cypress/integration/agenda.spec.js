/// <reference types="Cypress" />

context('Agenda tests', () => {
  before(() => {
    cy.login('Admin')
  });

  it('should create a new agenda and then delete it', () => {
    cy.server().route('POST', '/meetings').as('createNewMeeting');
    cy.route('POST', '/agendas').as('createNewAgenda');
    cy.route('POST', '/agendaitems').as('createNewAgendaItems');

    const plusMonths = 1;
    const futureDate = Cypress.moment().add('month', plusMonths).set('date', 20).set('hour', 20).set('minute', 20);

    cy.createAgenda('Elektronische procedure', plusMonths, futureDate, 'Zaal oxford bij Cronos Leuven');
    cy.wait('@createNewMeeting', { timeout: 20000 })
      .then((res) => {
        const meetingId = res.responseBody.data.id;

        cy.route('GET', `/meetings/${meetingId}/agendas`).as('getMeetingAgendas')
          .route('DELETE', `/meetings/${meetingId}`).as('deleteMeeting');
        cy.get('.vl-alert').contains('Gelukt');
        cy.wait('@getMeetingAgendas', { timeout: 20000 });

        cy.wait('@createNewAgenda',{ timeout: 20000 });
        cy.wait('@createNewAgendaItems',{ timeout: 20000 });
        cy.wait(2000)
        cy.visit(`/agenda/${meetingId}/agendapunten`);

        cy.contains('Acties').click();
        cy.contains('Agenda verwijderen').click()
          .wait('@deleteMeeting')
          .get('.vl-alert').contains('Gelukt');
      })
  })

});
