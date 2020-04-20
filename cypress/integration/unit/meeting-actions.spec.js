/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

context('meeting actions tests', () => {

  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 12).set('hour', 20).set('minute', 20);
  const caseTitle = 'Cypress test: meeting actions - ' + currentTimestamp();

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

  it('should perform action delete agenda with agendaitems on designagenda', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: delete agenda - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het verwijderen van een agenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.createCase(false, caseTitle);
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

      // Verify delete agenda A works
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
    });
  });

  it('should not be able to delete approved agendaitem from designagenda with profile: Kanselarij', () => {
    cy.logout();
    cy.login('Kanselarij');
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: delete approve agenda Kanselarij - ' + currentTimestamp();
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
      cy.agendaItemExists(SubcaseTitleShort); //this makes sure the page is reloaded after approving the agenda
      cy.changeSelectedAgenda('Ontwerpagenda');

      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});
      cy.get('.vlc-panel-layout__main-content').within(() => {
        cy.get('.vl-action-group').within(() => {
          cy.contains('Verwijderen').should('not.exist');
        });
      });
    });
    cy.logout();
  });

  it('should be able to delete approved agendaitem from designagenda with profile: admin', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: delete approve agenda Admin - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het sluiten van een agenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    // cy.createCase(false, caseTitle); //TODO remove this is temp
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 13).set('hour', 20).set('minute', 20);
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven').then((meetingId) => {
      cy.openAgendaForDate(agendaDate,meetingId);

      cy.addAgendaitemToAgenda(SubcaseTitleShort, false);

      cy.setFormalOkOnAllItems();
      cy.approveDesignAgenda();
      cy.agendaItemExists(SubcaseTitleShort); //this makes sure the page is reloaded after approving the agenda
      // Verify agendaitem exists and has subcase on design agenda and agenda A
      cy.changeSelectedAgenda('Agenda A');
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});
      cy.changeSelectedAgenda('Ontwerpagenda');
      cy.agendaItemExists(SubcaseTitleShort).click();
      cy.contains('Naar procedurestap', { timeout: 12000});
      cy.get('.vlc-panel-layout__main-content').within(() => {
        cy.get('.vl-action-group').within(() => {
          cy.contains('Verwijderen').click();
        });
      });

      cy.get('.vl-modal').within(() => {
        cy.get('.vl-button').contains('Verwijderen').click();
      });
      cy.route('DELETE', 'agendaitems/**').as('deleteAgendaitem');
      cy.route('DELETE', 'subcase-phases/**').as('deleteSubcasePhase');
      cy.route('PATCH', 'subcases/**').as('patchSubcase');
      cy.wait('@deleteAgendaitem', {timeout: 12000 }); // 2 of these happen
      cy.wait('@deleteSubcasePhase', {timeout: 12000 }); // 2 of these happen
      cy.wait('@patchSubcase', { timeout: 12000 });
      cy.get('.vl-modal').should('not.be.visible');

      // Verify subcase is no longer on designagenda after deleting the agendaitem
      cy.changeSelectedAgenda('Agenda A');
      cy.get('li.vlc-agenda-items__sub-item h4')
        .contains(SubcaseTitleShort, { imeout: 2500 })
        .should('not.exist');
      // Verify subcase is no longer on agenda A after deleting the agendaitem
      cy.changeSelectedAgenda('Agenda A');
      cy.get('li.vlc-agenda-items__sub-item h4')
        .contains(SubcaseTitleShort, { timeout: 2500 })
        .should('not.exist');
    });
  });

});


function currentTimestamp() {
  return Cypress.moment().unix();
}
