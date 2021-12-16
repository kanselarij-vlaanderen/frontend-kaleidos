/* global context, it, cy,beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Tests of pieces on agendaitems', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Should restore a previous version of a piece to the current agendaitem', () => {
    // Background:
    // Agenda A => agendaitem 1 has 1 container with 1 piece
    // Agenda B => add new Piece to existing container => BIS piece replaces the original piece in the list of pieces of agendaitem
    // Agenda B => delete the new BIS piece => We must restore the original piece and put it in the list of pieces of agendaitem
    const testId = `testId=${currentTimestamp()}: `;
    const dateToCreateAgenda = Cypress.moment().add(3, 'weeks')
      .day(4); // thursday in three weeks;

    const caseTitle = `${testId} agendaitem-pieces case`;
    const part1Title = `${testId} agendaitem-pieces subcase part 1`;
    const part1TitleLong = `${testId} agendaitem-pieces subcase part 1 long title`;

    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.createCase(caseTitle);
    cy.addSubcase(null, part1Title, part1TitleLong, null, null);
    cy.openSubcase(0);

    cy.addDocumentsToSubcase([
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-2', fileType: 'Nota',
      }
    ]);

    cy.createAgenda('Ministerraad', dateToCreateAgenda, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(part1Title);
      cy.setAllItemsFormallyOk(2);
      cy.approveDesignAgenda();
      cy.addNewPieceToAgendaitem(part1Title, 'VR 2020 1212 DOC.0001-1', file); // add BIS to doc 1
      cy.addNewPieceToAgendaitem(part1Title, 'VR 2020 1212 DOC.0001-1BIS', file); // add TER to doc 1 BIS
      cy.addNewPieceToAgendaitem(part1Title, 'VR 2020 1212 DOC.0001-2', file); // add BIS to doc 2
      cy.get(document.documentCard.card).should('have.length', 2);

      cy.deleteSinglePiece('VR 2020 1212 DOC.0001-1TER', 0);
      cy.deleteSinglePiece('VR 2020 1212 DOC.0001-2BIS', 0);
      cy.get(document.documentCard.card).should('have.length', 2);
      cy.get(document.documentCard.name.value).eq(0)
        .contains('VR 2020 1212 DOC.0001-1BIS');
      cy.get(document.documentCard.name.value).eq(1)
        .contains('VR 2020 1212 DOC.0001-2');
      cy.openDetailOfAgendaitem(part1Title);
      cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
      cy.clickReverseTab('Documenten');
      cy.deleteSinglePiece('VR 2020 1212 DOC.0001-1BIS', 0);
      cy.get(document.documentCard.card).should('have.length', 2);
      cy.get(document.documentCard.name.value).eq(0)
        .contains('VR 2020 1212 DOC.0001-1');
      cy.clickReverseTab('Overzicht');
      cy.get(cases.subcaseDescription.agendaLink).click();
      cy.get(agenda.agendaitemNav.documentsTab).click();

      cy.get(document.documentCard.card).should('have.length', 2);
      // TODO: Policy regarding "safe document removal" should be revised. (https://kanselarij.atlassian.net/browse/VAL-287)
      // cy.isPieceDeletable('VR 2020 1212 DOC.0001-1', 0, false);
      // cy.isPieceDeletable('VR 2020 1212 DOC.0001-2', 0, false);
    });
  });
});
