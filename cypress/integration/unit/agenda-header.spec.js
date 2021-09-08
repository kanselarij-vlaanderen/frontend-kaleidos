/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Agenda-Header actions tests', () => {
  const dateToCreateAgenda = Cypress.moment().add(9, 'weeks')
    .day(1);
  const amountToRun = 1;
  const typeNota = 'Nota';

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('stress test action approveAgenda / reopenPreviousAgenda', () => {
    // agenda with 2 agendaitems
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.reopenPreviousAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A');
      cy.approveDesignAgenda();
    }
    // agenda with only approval
    cy.createAgenda(null, dateToCreateAgenda, 'agenda-header tests 1');
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.setFormalOkOnItemWithIndex(0);
    for (let int = 0; int < amountToRun; int++) {
      cy.approveDesignAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.reopenPreviousAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A');
    }
  });

  it('stress test action approveAndCloseAgenda / deleteAgenda / reopenAgenda', () => {
    // agenda with 2 agendaitems
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    cy.approveDesignAgenda();
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.approveAndCloseDesignAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B', false);
      cy.agendaNameExists('A', false);
      cy.deleteAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }

    // agenda with only approval
    const newDate = dateToCreateAgenda.add(1, 'day');
    cy.createAgenda(null, newDate, 'agenda-header tests 2');
    cy.openAgendaForDate(newDate);
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.approveAndCloseDesignAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B', false);
      cy.agendaNameExists('A', false);
      cy.deleteAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }
  });

  it('stress test action closeAgenda / reopenAgenda', () => {
    // agenda with 2 agendaitems
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    cy.changeSelectedAgenda('Ontwerpagenda');
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.closeAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }

    // agenda with only approval
    const newDate = dateToCreateAgenda.add(2, 'day');
    cy.createAgenda(null, newDate, 'agenda-header tests 3');
    cy.openAgendaForDate(newDate);
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda();
    for (let int = 0; int < amountToRun; int++) {
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
      cy.closeAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
      cy.agendaNameExists('A', false);
      cy.reopenAgenda();
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B');
      cy.agendaNameExists('A', false);
    }
  });

  it('should perform action delete agenda with agendaitems on designagenda', () => {
    cy.login('Admin');
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/c7b045ce-3976-459c-aeaa-d0e8597b96d8/agendapunten');
    // verify agenda B has agendaitem
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    cy.deleteAgenda();
    // verify agendaitem is still ok on agenda A after delete designagenda
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    // verify delete agenda A works
    cy.deleteAgenda(true);
    // verify subcase can be proposed for different agenda
    cy.visit('/dossiers/5EB287A9F359DD0009000005/deeldossiers/5EB287BBF359DD0009000007/overzicht');
    cy.get(cases.subcaseHeader.showProposedAgendas);
  });


  it('Should add agendaitems to an agenda and approve&close with rollback/agendaitem', () => {
    const testId = `${currentTimestamp()}`;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(2);

    const caseTitleShort = `case: Approve agenda - formal not ok: new item - ${testId}`;
    const subcaseTitleShortNew = `subcase: Approve agenda - formal not ok: new item - ${testId}`;
    const subcaseTitleLong = `Long title- ${testId}`;
    const subcaseTitleShortApproved = `subcase: Approve agenda - formal not ok: approved item - ${testId}`;


    cy.createAgenda(null, dateToCreateAgenda, null).then((result) => {
      cy.createCase(false, caseTitleShort);
      cy.addSubcase(typeNota, subcaseTitleShortNew, subcaseTitleLong);
      cy.addSubcase(typeNota, subcaseTitleShortApproved, subcaseTitleLong);
      cy.openSubcase(0);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(subcaseTitleShortApproved);
      cy.setAllItemsFormallyOk(2);
      cy.approveDesignAgenda();
      cy.addAgendaitemToAgenda(subcaseTitleShortNew);
      cy.openDetailOfAgendaitem(subcaseTitleShortApproved);
      cy.get(agenda.agendaitemTitlesView.edit).click();
      cy.get(agenda.agendaitemTitlesEdit.shorttitle).type(' EDITED');
      cy.get(agenda.agendaitemTitlesEdit.actions.save).click();
      cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 3);
      cy.approveAndCloseDesignAgenda(false);
      cy.get(auk.modal.body).find(auk.alert.message);
      cy.get(agenda.agendaHeader.messages.approveAndCloseAgenda.rollbackItems);
      cy.get(agenda.agendaHeader.messages.approveAndCloseAgenda.deleteItems);
      cy.get(agenda.agendaHeader.confirm.approveAndCloseAgenda).click();
      cy.get(auk.modal.container, {
        timeout: 60000,
      }).should('not.exist');
      cy.get(auk.loader).should('not.exist');
      cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 3); // TODO-BUG This should fail, keep this in until fixed
      // TODO-BUG after action "approve and close" the agendaitems are not refreshed and the deleted one is still showing (clicking = error)
      cy.reload(); // TODO-BUG DELETE after bug fix
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
      cy.agendaNameExists('B', false);
      cy.agendaNameExists('A', false);
      cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
      cy.openDetailOfAgendaitem(subcaseTitleShortApproved);
      cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShortApproved);
      cy.get(agenda.agendaitemTitlesView.shortTitle).contains(`${subcaseTitleShortApproved} EDITED`)
        .should('not.exist');
    });
  });

  it('Should add agendaitems to an agenda and approve with rollback/new agendaitem', () => {
    const testId = `${currentTimestamp()}`;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(2);

    const caseTitleShort = `case: Approve agenda - formal not ok: new item - ${testId}`;
    const subcaseTitleShortNew = `subcase: Approve agenda - formal not ok: new item - ${testId}`;
    const subcaseTitleLong = `Long title- ${testId}`;
    const subcaseTitleShortApproved = `subcase: Approve agenda - formal not ok: approved item - ${testId}`;
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
      }
    ];
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.createAgenda(null, dateToCreateAgenda, null).then((result) => {
      cy.createCase(false, caseTitleShort);
      cy.addSubcase(typeNota, subcaseTitleShortNew, subcaseTitleLong);
      cy.addSubcase(typeNota, subcaseTitleShortApproved, subcaseTitleLong);
      cy.openSubcase(0);
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(subcaseTitleShortApproved);
      cy.addDocumentsToAgendaitem(subcaseTitleShortApproved, files);
      cy.setAllItemsFormallyOk(2);
      cy.approveDesignAgenda();
      // add new item that will have to be moved from B to C
      cy.addAgendaitemToAgenda(subcaseTitleShortNew);
      // upload piece that will have to be rolled back on B
      cy.addNewPieceToAgendaitem(subcaseTitleShortApproved, files[0].newFileName, file);
      // change attribute that will have to be rolled back on B
      cy.openDetailOfAgendaitem(subcaseTitleShortApproved);
      cy.get(agenda.agendaitemTitlesView.edit).click();
      cy.get(agenda.agendaitemTitlesEdit.shorttitle).type(' EDITED');
      cy.get(agenda.agendaitemTitlesEdit.actions.save).click();
      cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 3);
      cy.approveDesignAgenda(false);
      cy.get(auk.modal.body).find(auk.alert.message);
      cy.get(agenda.agendaHeader.messages.approveAgenda.rollbackItems);
      cy.get(agenda.agendaHeader.messages.approveAgenda.moveItems);
      cy.get(agenda.agendaHeader.confirm.approveAgenda).click();
      cy.get(auk.modal.container, {
        timeout: 60000,
      }).should('not.exist');
      cy.get(auk.loader).should('not.exist');
      cy.get(agenda.agendaSideNav.agenda).should('have.length', 3);
      cy.agendaNameExists('C');
      cy.agendaNameExists('B', false);
      cy.agendaNameExists('A', false);
      // changes made on agenda B have been copied + new agendaitem was moved to agenda C
      cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 3);
      cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShortApproved);
      cy.get(agenda.agendaOverviewItem.subitem).contains(`${subcaseTitleShortApproved} EDITED`);
      // agendaitem on B has been rolled back + new agendaitem was moved
      cy.changeSelectedAgenda('Agenda B');
      cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 2);
      cy.openDetailOfAgendaitem(subcaseTitleShortApproved);
      cy.get(agenda.agendaitemTitlesView.shortTitle).contains(`${subcaseTitleShortApproved} EDITED`)
        .should('not.exist');
      cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShortApproved);
      // newly added piece on B was also moved to agenda C
      cy.openAgendaitemDocumentTab(subcaseTitleShortApproved, true);
      cy.get(document.documentCard.name.value).eq(0)
        .contains(`${files[0].newFileName}`);
      cy.get(document.documentCard.name.value).eq(0)
        .contains(`${files[0].newFileName}BIS`)
        .should('not.exist');
    });
  });
});
