/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';

context('Agenda reopen previous tests', () => {
  const dateToCreateAgenda = Cypress.dayjs().add(10, 'weeks')
    .day(3);
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const designAgendaB = 'Ontwerpagenda B';
  const designAgendaC = 'Ontwerpagenda C';
  const approvedagendaA = 'Agenda A';
  const approvedagendaB = 'Agenda B';
  const reopenPreviousVersionWithDocuments = 'Documenten verwijderen en vorige versie heropenen';
  const reopenPreviousVersion = 'Vorige versie heropenen';

  it('should delete current design agenda and reopen previous accepted agenda', () => {
    cy.createAgenda(null, dateToCreateAgenda, 'Reopen previous test');
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.setFormalOkOnItemWithIndex(0);
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
    cy.agendaNameExists('A');
    // check if action does not exist on design agenda A
    // TODO: opening and re-opening doesn't seem to work in test env.
    // cy.get(agenda.agendaVersionActions.showOptions).click();
    // cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).should('not.exist');
    // cy.get(agenda.agendaVersionActions.showOptions).click();
    cy.approveDesignAgenda();
    // verify we have 2 agendas, A(approved) and B(design)
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B');
    cy.agendaNameExists('A', false);
    cy.approveDesignAgenda();
    // verify we have 2 agendas, A&B(approved) and C(design)
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 3);
    cy.agendaNameExists('C');
    cy.agendaNameExists('B', false);
    // add a document to version B that needs to be removed
    cy.addDocumentsToApprovalItem('Goedkeuring van het verslag', [file]);

    // reopen agenda B, documents need to be removed
    cy.get(agenda.agendaVersionActions.showOptions).click();
    cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).click();
    // Check the message in the confirm modal
    cy.get(auk.modal.header.title).contains(reopenPreviousVersion);
    cy.get(auk.loader).should('not.exist');
    cy.get(agenda.agendaVersionActions.reopenModal.error).contains(designAgendaC);
    cy.get(agenda.agendaVersionActions.reopenModal.error).contains(approvedagendaB);
    cy.get(agenda.agendaVersionActions.reopenModal.warning).should('exist');
    cy.get(agenda.agendaVersionActions.reopenModal.piece).should('have.length', 1);
    cy.get(agenda.agendaVersionActions.reopenModal.pieceName).contains(`${file.fileName}.${file.fileExtension}`);
    cy.get(auk.loader).should('not.exist'); // data loading task might be running, disabling the next button
    cy.get(agenda.agendaVersionActions.confirm.reopenPreviousVersion).contains(reopenPreviousVersionWithDocuments)
      .click();
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(auk.loader).should('not.exist');

    // reopen agenda A, no documents
    cy.get(agenda.agendaVersionActions.showOptions).click();
    cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).click();
    // Check the message in the confirm modal
    cy.get(auk.modal.header.title).contains(reopenPreviousVersion);
    cy.get(auk.loader).should('not.exist');
    cy.get(auk.alert.message).contains(designAgendaB);
    cy.get(auk.alert.message).contains(approvedagendaA);
    cy.get(agenda.agendaVersionActions.reopenModal.error).contains(designAgendaB);
    cy.get(agenda.agendaVersionActions.reopenModal.error).contains(approvedagendaA);
    cy.get(agenda.agendaVersionActions.reopenModal.warning).should('not.exist');
    cy.get(auk.loader).should('not.exist'); // data loading task might be running, disabling the next button
    cy.get(agenda.agendaVersionActions.confirm.reopenPreviousVersion).contains(reopenPreviousVersion)
      .click();
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(auk.loader).should('not.exist');
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
    cy.agendaNameExists('A');
  });

  // TODO-agendaHeader test existance of all the actions in different agenda status in 1 aggregated test
  it('should not show action menu item Vorige versie heropenen in action menu when not design agenda', () => {
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.approveDesignAgenda();
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B');
    cy.agendaNameExists('A', false);
    cy.approveDesignAgenda();
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 3);
    cy.agendaNameExists('C');
    cy.agendaNameExists('B', false);
    cy.agendaNameExists('A', false);
    cy.deleteAgenda();
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B', false);
    cy.agendaNameExists('A', false);
    // Check if action does not exist when there are multiple agendas but no design agenda
    cy.get(agenda.agendaVersionActions.showOptions).click();
    cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).should('not.exist');
  });
});
