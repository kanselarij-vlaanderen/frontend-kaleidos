/* global context, before, it, cy,beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import route from  '../../selectors/route.selectors';
import utils from  '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Agenda tests', () => {
  const agendaDate = Cypress.moment().add(1, 'weeks')
    .day(5); // Next friday
  const typeNota = 'Nota';
  const agendaKind = 'Ministerraad';
  const agendaPlace = 'Cypress Room';

  before(() => {
    cy.server();
    cy.login('Admin');
    cy.createAgenda(agendaKind, agendaDate, agendaPlace);
    cy.logoutFlow();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-agendaHeader test all agenda actions in different agenda status, what is showing in the pop-up etc...

  it('should get different message when trying to approve with formal not ok items', () => {
    cy.openAgendaForDate(agendaDate); // 1 item with "not yet formally ok"
    cy.approveDesignAgenda(false);
    cy.get(auk.modal.body).find(auk.alert.message);
    cy.get(agenda.agendaHeader.confirm.approveAgenda);
    cy.get(auk.loader).should('not.exist');
    cy.get(auk.modal.footer.cancel).click();
    // instead of confirming the opened modal, we cancel and let the command handle it
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
  });

  it('should add an agendaitem to an agenda', () => {
    const agendaitemName = 'Derde stap'; // This agendaitem exists in the default test data
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(agendaitemName);
    cy.agendaitemExists(agendaitemName);
  });

  it('Ontwerpagenda goedkeuren en afsluiten...', () => {
    cy.openAgendaForDate(agendaDate);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveAndCloseDesignAgenda(false);
    cy.get(auk.modal.body).find(auk.alert.message)
      .should('not.exist');
  });

  // The next tests create their own agenda

  it('should create a new agenda and then delete the last agenda (and automatically the meeting)', () => {
    const agendaDateSingleTest = Cypress.moment().add(2, 'weeks')
      .day(5); // Friday in two weeks
    cy.createAgenda(agendaKind, agendaDateSingleTest, agendaPlace).then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.get(agenda.agendaHeader.showAgendaOptions).click();
      cy.get(agenda.agendaHeader.agendaActions.deleteAgenda).click();
      cy.get(auk.modal.body).find(auk.alert.message);
      cy.get(agenda.agendaHeader.confirm.deleteAgenda);
      cy.get(auk.modal.footer.cancel).click();
      // instead of confirming the opened modal, we cancel and let the command handle it
      cy.deleteAgenda(result.meetingId, true);
      cy.url().should('include', '/overzicht');
    });
  });

  it('Should be able to close a session with only 1 approved agenda, cfr. KAS-1551', () => {
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(5); // Friday in three weeks
    cy.createAgenda(agendaKind, dateToCreateAgenda, agendaPlace).then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.openAgendaForDate(dateToCreateAgenda);
      cy.setFormalOkOnItemWithIndex(0);
      cy.approveDesignAgenda();
      cy.deleteAgenda();
      cy.closeAgenda();
    });
  });

  it('Should not be able to close a session with only a design agenda, cfr. KAS-1551', () => {
    const dateToCreateAgenda = Cypress.moment().add(4, 'weeks')
      .day(5); // Friday in four weeks
    cy.createAgenda(agendaKind, dateToCreateAgenda, agendaPlace);
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.lockAgenda).should('not.exist');
  });

  it('should edit nota on agendaitem and trim whitespaces', () => {
    const testId = `${currentTimestamp()}`;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1);

    const caseTitleShort = `Cypress agenda spec edit & trim whitespace - ${testId}`;
    const subcaseTitleShort = `Agenda spec edit & trim whitespace korte titel - ${testId}`;
    const subcaseTitleLong = `Agenda spec edit & trim whitespace lange titel - ${testId}`;
    const explanation = 'Dit is de opmerking';
    const whitespace = '\n';

    cy.createAgenda(agendaKind, dateToCreateAgenda, agendaPlace).then((result) => {
      cy.createCase(false, caseTitleShort);
      cy.addSubcase(typeNota, subcaseTitleShort + whitespace, subcaseTitleLong + whitespace);
      cy.openSubcase(0);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(subcaseTitleShort);
    });

    cy.openAgendaForDate(dateToCreateAgenda);

    // after creating, whitespace is removed
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort);
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort + whitespace)
      .should('not.exist');
    cy.get(agenda.agendaOverviewItem.title).contains(subcaseTitleLong);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    // detail view
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.confidential).find(utils.vlToggle.label)
      .click();
    // When typing, the name in de sidebar item also changes, showing the whitespaces before saving

    // short title
    // check sidebar and input field before change
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).should('not.contain', whitespace + subcaseTitleShort + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).should('not.have.value', whitespace + subcaseTitleShort + whitespace);
    // The new short title with whitespace before and after
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).clear()
      .type(whitespace + subcaseTitleShort + whitespace);
    // Before save, the whitespaces are visible in input field and sidebar
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).should('have.value', whitespace + subcaseTitleShort + whitespace);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).should('contain', whitespace + subcaseTitleShort + whitespace);

    // long title
    cy.get(agenda.agendaitemTitlesEdit.title).should('not.have.value', whitespace + subcaseTitleLong + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.title).clear()
      .type(whitespace + subcaseTitleLong + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.title).should('have.value', whitespace + subcaseTitleLong + whitespace);

    // explanation
    cy.get(agenda.agendaitemTitlesEdit.explanation).clear()
      .type(whitespace + explanation + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.explanation).should('have.value', whitespace + explanation + whitespace);
    cy.route('PATCH', '/agendas/*').as('patchAgendas');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click();
    cy.wait('@patchAgendas');
    // after saving, agendaitem-titles show trimmed values
    cy.get(agenda.agendaitemTitlesView.edit).scrollIntoView();
    cy.get(agenda.agendaitemTitlesView.shortTitle).as('shortTitle');
    cy.get('@shortTitle').should('contain.text', subcaseTitleShort); // this is an exact match
    cy.get('@shortTitle').should('not.contain.text', whitespace + subcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.title).as('longTitle');
    // This should technicaly fail but we simulate whitespace before of the actual value for readability
    cy.get('@longTitle').contains(subcaseTitleLong);
    // explanation is not trimmed
    cy.get(agenda.agendaitemTitlesView.explanation).contains(`Opmerking: ${whitespace + explanation + whitespace}`);
    // TODO-BUG setting confidentiality and cancelling does not roll back
    cy.get(route.agendaitemIndex.confidential).contains('Vertrouwelijk');
  });

  it('It should be automatically get the next meetingID assigned in the UI', () => {
    const agendaDateSingle = Cypress.moment().add(1, 'week')
      .day(6);
    // TODO-bug the existing agendas sometimes get NaN, why? We have to make this agenda with number 1 to ensure numbering works
    cy.createAgenda(agendaKind, agendaDateSingle, agendaPlace, 1);
    cy.createAgenda(agendaKind, agendaDateSingle, agendaPlace, null, 'VV AA 1999/2BIS').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      // Check the values in edit session view
      cy.get(agenda.agendaHeader.showActionOptions).click();
      cy.get(agenda.agendaHeader.actions.toggleEditingSession).click();
      cy.get(agenda.editSession.meetingNumber).find(utils.vlFormInput)
        .should('have.value', result.meetingNumber);
      cy.get(agenda.editSession.numberRep).find(utils.vlFormInput)
        .should('have.value', result.meetingNumberRep);
      cy.get(utils.vlModalFooter.cancel).click();
      // Check if the next automatic number is correct
      cy.get(utils.mHeader.agendas).click();
      cy.get(route.agendas.action.newMeeting).click();
      cy.wait(500); // await call not possible
      cy.get(agenda.newSession.meetingNumber).find(utils.vlFormInput)
        .should('have.value', (parseInt(result.meetingNumber, 10) + 1).toString());
    });
  });

  it('Should add agendaitems to an agenda and set all of them to formally OK', () => {
    const testId = `${currentTimestamp()}`;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1);

    const caseTitleShort = `Cypress agenda spec formal ok: set formality - ${testId}`;
    const newSubcaseTitleShort = `Agenda spec formal ok: set formality - ${testId}`;
    const subcaseTitleLong = `Agenda spec formal ok: set formality - ${testId}`;

    cy.createAgenda(agendaKind, dateToCreateAgenda, agendaPlace).then((result) => {
      cy.createCase(false, caseTitleShort);
      cy.addSubcase(typeNota, newSubcaseTitleShort, subcaseTitleLong);
      cy.openSubcase(0);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(newSubcaseTitleShort);
      cy.setAllItemsFormallyOk(2);
    });
  });

  it('Should add agendaitems to an agenda and set all of them to formally OK and close the agenda', () => {
    const testId = `${currentTimestamp()}`;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1);

    const caseTitleShort = `Cypress agenda spec formal ok: close agenda - ${testId}`;
    const newSubcaseTitleShort = `Agenda spec formal ok: close agenda korte titel - ${testId}`;
    const subcaseTitleLong = `Agenda spec formal ok: close agenda lange titel - ${testId}`;

    cy.createAgenda(agendaKind, dateToCreateAgenda, agendaPlace).then((result) => {
      cy.createCase(false, caseTitleShort);
      cy.addSubcase(typeNota, newSubcaseTitleShort, subcaseTitleLong);
      cy.openSubcase(0);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(newSubcaseTitleShort);
      cy.setAllItemsFormallyOk(2);
      cy.approveDesignAgenda();
      cy.get(agenda.agendaHeader.showAgendaOptions).click();
      cy.get(agenda.agendaHeader.agendaActions.lockAgenda).click();
      cy.get(auk.modal.body).find(auk.alert.message);
      cy.route('PATCH', '/agendas/*').as('patchAgendas');
      cy.get(agenda.agendaHeader.confirm.lockAgenda).click();
      cy.wait('@patchAgendas');
      cy.get(auk.loader).should('not.exist');
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaOverview.formallyOkEdit).should('not.exist');
    });
  });

  it('Should add agendaitems to an agenda and set one of them to formally NOK and approve and close the agenda', () => {
    const testId = `${currentTimestamp()}`;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1);

    const caseTitleShort = `Cypress agenda spec formal ok: approve & close agenda - ${testId}`;
    const newSubcaseTitleShort = `Agenda spec formal ok: approve & close agenda korte titel - ${testId}`;
    const subcaseTitleLong = `Agenda spec formal ok: approve & close agenda lange titel - ${testId}`;

    cy.createAgenda(agendaKind, dateToCreateAgenda, agendaPlace).then((result) => {
      cy.createCase(false, caseTitleShort);
      cy.addSubcase(typeNota, newSubcaseTitleShort, subcaseTitleLong);
      cy.openSubcase(0);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(newSubcaseTitleShort);
      cy.setFormalOkOnItemWithIndex(0);
    });
    // Check the approve and close pop-up, the "not yet formally ok" agendaitem will be mentioned for removal
    cy.approveAndCloseDesignAgenda(false);
    cy.get(auk.modal.body).find(auk.alert.message);
    cy.get(auk.modal.body).contains(newSubcaseTitleShort);
    cy.route('PATCH', '/subcases/*').as('patchSubcases');
    cy.get(agenda.agendaHeader.confirm.approveAndCloseAgenda).click();
    cy.wait('@patchSubcases');
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    // Check that the agendaitem was deleted because of confirming action with agendaitems to delete
    cy.get(auk.loader).should('not.exist');
    // TODO-BUG after action "approve and close" the agendaitems are not refreshed and the deleted one is still showing (clicking = error)
    cy.reload(); // TODO-BUG DELETE after bug fix
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 1);
    cy.get(agenda.agendaOverviewItem.subitem).contains('Goedkeuring van het verslag');
    cy.get(agenda.agendaOverviewItem.subitem).contains(newSubcaseTitleShort)
      .should('not.exist');
  });

  it('Should add agendaitems to an agenda and set one of them to formally NOK and approve the agenda', () => {
    const testId = `${currentTimestamp()}`;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(1);

    const caseTitleShort = `Cypress agenda spec formal ok: approve agenda - ${testId}`;
    const newSubcaseTitleShort = `Agenda spec formal ok: approve agenda korte titel - ${testId}`;
    const subcaseTitleLong = `Agenda spec formal ok: approve agenda lange titel - ${testId}`;

    cy.createAgenda(agendaKind, dateToCreateAgenda, agendaPlace).then((result) => {
      cy.createCase(false, caseTitleShort);
      cy.addSubcase(typeNota, newSubcaseTitleShort, subcaseTitleLong);
      cy.openSubcase(0);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(newSubcaseTitleShort);
      cy.setFormalOkOnItemWithIndex(0);
    });

    cy.approveDesignAgenda(false);

    cy.get(auk.modal.body).find(auk.alert.message);
    cy.get(auk.modal.body).contains(newSubcaseTitleShort);
    cy.get(agenda.agendaHeader.confirm.approveAgenda)
      .click();

    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');

    cy.get(agenda.agendaHeader.showAgendaOptions).click();
    cy.get(agenda.agendaHeader.agendaActions.lockAgenda).click();

    cy.get(agenda.agendaHeader.confirm.lockAgenda)
      .click();

    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(auk.loader).should('not.exist');
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 1);
    cy.get(agenda.agendaOverviewItem.subitem).contains('Goedkeuring van het verslag');
    cy.get(agenda.agendaOverviewItem.subitem).contains(newSubcaseTitleShort)
      .should('not.exist');
    // Closing an agenda should remove any design agenda
    // By checking the lenght of agendas and confirming "Agenda A", not other agenda exists
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
    cy.agendaNameExists('A', false);
  });
});

