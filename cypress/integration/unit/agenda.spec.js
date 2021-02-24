import modal from '../../selectors/modal.selectors';
import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import actionModel from '../../selectors/action-modal.selectors';
import agendaOverview from '../../selectors/agenda-overview.selectors';
import auComponent from '../../selectors/au-component-selectors';
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

  it('should create a new agenda and then delete the last agenda (and automatically the meeting)', () => {
    const agendaDateSingleTest = Cypress.moment().add(2, 'weeks')
      .day(5); // Friday in two weeks
    cy.createAgenda('Elektronische procedure', agendaDateSingleTest, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.deleteAgenda(result.meetingId, true, false);
      cy.get(modal.auModal.body).within(() => {
        // We could verify the exact text here, but text can change often so opted not to and just verify the existance of a message.
        cy.get(auComponent.auAlert.container).should('exist');
        cy.get(auComponent.auAlert.message).should('exist');
      });
      cy.get(modal.auModal.save).contains('Agenda verwijderen');
      cy.get(modal.auModal.cancel).click();
      // instead of confirming the opened modal, we cancel and let the command handle it
      cy.deleteAgenda(result.meetingId, true);
    });
  });

  it('should get different message when trying to approve with formal not ok items', () => {
    cy.openAgendaForDate(agendaDate); // 1 item with "not yet formally ok"
    cy.approveDesignAgenda(false);
    cy.get(modal.auModal.body).within(() => {
      // We could verify the exact text here, but text can change often so opted not to and just verify the existance of a message.
      cy.get(auComponent.auAlert.container).should('exist');
      cy.get(auComponent.auAlert.message).should('exist');
    });
    cy.get(modal.auModal.save).contains('Goedkeuren');
    cy.get(modal.auModal.cancel).click();
    // instead of confirming the opened modal, we cancel and let the command handle it
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
  });

  it('should add an agendaitem to an agenda', () => {
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(false);
  });

  it('Ontwerpagenda goedkeuren en afsluiten...', () => {
    cy.openAgendaForDate(agendaDate);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveAndCloseDesignAgenda(false);
    // TODO check if there is no au-alert in the new popup
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
    cy.get(actionModel.showAgendaOptions).click();
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

  it('Should add agendaitems to an agenda and set all of them to formally OK and close the agenda', () => {
    const testId = `testId=${currentTimestamp()}: `;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1)
      .subtract(3, 'day');

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
      cy.approveDesignAgenda();
      cy.get(actionModel.showAgendaOptions).click();
      cy.get(actionModel.lockAgenda).click();
      // TODO check the message?
      cy.get(modal.auModal.body).within(() => {
        cy.get(auComponent.auAlert.container).should('exist');
      });

      // cy.route('GET', '/agendas/*/created-for').as('agendasCreatedFor');
      cy.route('PATCH', '/agendas/*').as('patchAgendas');

      cy.get(modal.auModal.save).contains('Agenda afsluiten')
        .click();
      // cy.wait('@agendasCreatedFor');
      cy.wait('@patchAgendas');
      // TODO hoe weten we dat assert goed werkt tenzij we wachten tot de actie afgerond is
      cy.get(agendaOverview.agendaEditFormallyOkButton).should('not.exist');
    });
  });

  it('Should add agendaitems to an agenda and set one of them to formally NOK and close the agenda', () => {
    const testId = `testId=${currentTimestamp()}: `;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1)
      .subtract(1, 'day');

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

      cy.setFormalOkOnItemWithIndex(0);
      cy.setFormalOkOnItemWithIndex(1);
    });
    cy.approveAndCloseDesignAgenda(false);
    // TODO tekst beter afcheken
    // cy.get(modal.auModal.container).contains('(Ontwerp)agenda bevat agendapunt die niet formeel ok zijn.');

    cy.route('GET', '/agenda-activities/*/agendaitems').as('agendaActivitiesAgendaItems');
    cy.route('GET', '/agendas/*/agendaitems').as('agendaitems');
    cy.route('GET', '/agendaitems/*/agenda').as('agenda');
    cy.route('GET', '/subcases?filter*').as('subcasesFilter');
    cy.route('PATCH', '/subcases/*').as('patchSubcases');
    cy.route('GET', '/subcases/*/agenda-activities').as('agendaActivities');


    cy.get(modal.auModal.save).click();

    // TODO gebeuren al deze patches nog ?
    cy.wait('@agendaActivitiesAgendaItems');
    cy.wait('@agendaitems');
    cy.wait('@agenda');
    cy.wait('@subcasesFilter');
    cy.wait('@patchSubcases');
    cy.wait('@agendaActivities');

    // TODO is deze not exists wel goed ?
    cy.get(agendaOverview.agendaEditFormallyOkButton).should('not.exist');
    // TODO hoe weten we dat assert goed werkt tenzij we wachten tot de actie afgerond is
    // cy.get('.vl-loader', {
    //   timeout: 60000,
    // }).should('not.exist');
    cy.contains(newSubcase2TitleShort).should('not.exist');
  });

  it('Should add agendaitems to an agenda and set one of them to formally NOK and approve and close the agenda', () => {
    const testId = `testId=${currentTimestamp()}: `;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1)
      .subtract(2, 'day');

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

      cy.setFormalOkOnItemWithIndex(0);
      cy.setFormalOkOnItemWithIndex(1);
    });

    cy.approveDesignAgenda(false);

    cy.route('GET', '/agendaitems/**/agenda-activity').as('agendaActivity');
    cy.route('GET', '/agendaitems/**/treatments').as('treatments');

    // TODO tekst checken ?
    cy.get(modal.auModal.container).within(() => {
      cy.get(auComponent.auAlert.message).should('exist');
      cy.get(modal.auModal.save)
        .click();
    });

    cy.get(modal.auModal.container, {
      timeout: 60000,
    }).should('not.exist');

    cy.get(actionModel.showAgendaOptions).click();
    cy.get(actionModel.lockAgenda).click();

    // TODO do we need all these awaits ? what calls happen ?
    // cy.get(modal.auModal.container).contains('(Ontwerp)agenda bevat agendapunt die niet formeel ok zijn.');
    // cy.route('GET', '/agenda-activities/*/agendaitems').as('agendaActivitiesAgendaItems');
    // cy.route('GET', '/agendas/*/agendaitems').as('agendaitems');
    // cy.route('GET', '/agendaitems/*/agenda').as('agenda');
    // cy.route('GET', '/subcases?filter*').as('subcasesFilter');
    // cy.route('PATCH', '/subcases/*').as('patchSubcases');
    // cy.route('GET', '/subcases/*/agenda-activities').as('agendaActivities');


    cy.get(modal.auModal.save)
      .click();

    // cy.wait('@agendaActivitiesAgendaItems');
    // cy.wait('@agendaitems');
    // cy.wait('@agenda');
    // cy.wait('@subcasesFilter');
    // cy.wait('@patchSubcases');
    // cy.wait('@agendaActivities');

    // cy.contains('Doorgaan')
    //   .click();

    // cy.get(agendaOverview.agendaEditFormallyOkButton).should('not.exist');
    cy.get(modal.auModal.container, {
      timeout: 60000,
    }).should('not.exist');
    cy.contains(newSubcase2TitleShort).should('not.exist');
    // Closing an agenda should remove any design agenda
    cy.contains('Agenda B').should('not.exist');
  });
});

