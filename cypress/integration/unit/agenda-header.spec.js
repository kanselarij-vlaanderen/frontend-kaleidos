/* global context, it, cy, beforeEach, afterEach */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';

context('Agenda-Header actions tests', () => {
  const amountToRun = 1;

  beforeEach(() => {
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
  });

  it('stress test action approveAndCloseAgenda / deleteAgenda / reopenAgenda', () => {
    // agenda with 2 agendaitems
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/5EB287CFF359DD0009000009/agendapunten');
    cy.changeSelectedAgenda('Ontwerpagenda');
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
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/5EB287CFF359DD0009000009/agendapunten');
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
  });

  it('should perform action delete agenda with agendaitems on designagenda', () => {
    cy.visitAgendaWithLink('/vergadering/5EB287CDF359DD0009000008/agenda/5EB287CFF359DD0009000009/agendapunten');
    cy.changeSelectedAgenda('Ontwerpagenda');
    // verify agenda B has agendaitem
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    cy.deleteAgenda();
    // verify agendaitem is still ok on agenda A after delete designagenda
    cy.openDetailOfAgendaitem('Cypress test: delete agenda - 1588758436');
    // verify delete agenda A works
    cy.deleteAgenda(true);
    // verify subcase can be proposed for different agenda
    cy.visit('/dossiers/B60EEC2E-2A07-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5EB287BBF359DD0009000007/overzicht');
    cy.get(cases.subcaseHeader.showProposedAgendas);
  });


  it('Should add agendaitems to an agenda and approve&close with rollback/agendaitem', () => {
    // const agendaDate = Cypress.dayjs('2022-04-05');
    const agendaLinkApprovedOnB = '/vergadering/6273B82A7590117083BAD785/agenda/8645be00-cc6a-11ec-a0de-e938a47bc878/agendapunten/866701a0-cc6a-11ec-a0de-e938a47bc878';

    const subcaseTitleShortNew = 'Cypress test: Approve Approve and close - formal not ok: new item - 1651751749';
    const subcaseTitleShortApproved = 'Cypress test: Approve Approve and close - formal not ok: approved item - 1651751749';
    const subcaseTitleShortApprovedEdited = `${subcaseTitleShortApproved} EDITED`;
    const approvalTitle = 'Goedkeuring van het verslag';

    // *Setup of this test:
    // Agenda A has 1 approval and 1 agendaitem
    // Agenda B has 1 approval (no changes), 1 recurring agendaitem (with attribute changes), 1 new agendaitem
    // What should happen on approve&close:
    // recurring agendaitem on agenda B is rolled back (B has lost the changes)
    // new agendaitem has been deleted from B

    cy.visitAgendaWithLink(agendaLinkApprovedOnB);
    // agendaitem on B has the same name as agendaitem on A + added text to verify the rollback happened
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShortApprovedEdited);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShortNew);
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 3);
    cy.approveAndCloseDesignAgenda(false);
    cy.get(auk.modal.body).find(auk.alert.message);
    cy.get(agenda.agendaActions.messages.approveAndCloseAgenda.rollbackItems);
    cy.get(agenda.agendaActions.messages.approveAndCloseAgenda.deleteItems);
    cy.get(agenda.agendaActions.confirm.approveAndCloseAgenda).click();
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    // the new agendaitem was deleted by the backend service
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B', false);
    cy.agendaNameExists('A', false);
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.openDetailOfAgendaitem(subcaseTitleShortApproved);
    cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShortApproved);
    cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShortApprovedEdited)
      .should('not.exist');
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(approvalTitle);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShortApproved);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShortNew)
      .should('not.exist');
  });

  it('Should add agendaitems to an agenda and approve with rollback/new agendaitem', () => {
    // const agendaDate = Cypress.dayjs('2022-04-06');
    const agendaLinkApprovedOnB = '/vergadering/6273B86C7590117083BAD78A/agenda/07757d30-cc6b-11ec-a0de-e938a47bc878/agendapunten/07cc76d0-cc6b-11ec-a0de-e938a47bc878';
    const subcaseTitleShortNew = 'Cypress test: Approve Approve and close - formal not ok: new item - 1651751928';
    const subcaseTitleShortApproved = 'Cypress test: Approve Approve and close - formal not ok: approved item - 1651751928';
    const subcaseTitleShortApprovedEdited = `${subcaseTitleShortApproved} EDITED`;
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
      }
    ];

    // *Setup of this test:
    // Agenda A has 1 approval and 1 agendaitem
    // Agenda B has 1 approval (no changes), 1 recurring agendaitem (with attribute changes and new piece BIS), 1 new agendaitem
    // What should happen on approve:
    // recurring agendaitem on agenda B is rolled back (B has lost the changes and BIS)
    // new agendaitem has been moved from B to C
    // recurring agendaitem on agenda c has the changes and the BIS (moved)

    cy.visitAgendaWithLink(agendaLinkApprovedOnB);
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 3);
    cy.approveDesignAgenda(false);
    cy.get(auk.modal.body).find(auk.alert.message);
    cy.get(agenda.agendaActions.messages.approveAgenda.rollbackItems);
    cy.get(agenda.agendaActions.messages.approveAgenda.moveItems);
    cy.get(agenda.agendaActions.confirm.approveAgenda).click();
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 3);
    cy.agendaNameExists('C');
    cy.agendaNameExists('B', false);
    cy.agendaNameExists('A', false);
    // changes made on agenda B have been copied + new agendaitem was moved to agenda C
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 3);
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShortApprovedEdited);
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShortNew);
    // agendaitem on B has been rolled back + new agendaitem was moved
    cy.changeSelectedAgenda('Agenda B');
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 2);
    cy.openDetailOfAgendaitem(subcaseTitleShortApproved);
    cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShortNew)
      .should('not.exist');
    cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShortApprovedEdited)
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
