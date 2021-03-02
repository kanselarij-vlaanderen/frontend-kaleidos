// import modal from '../../selectors/modal.selectors';
import agenda from '../../selectors/agenda.selectors';
import document from '../../selectors/document.selectors';
// import actionModel from '../../selectors/action-modal.selectors';

/* global context, before, it, cy,beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Tests of pieces on agendaitems', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

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

    // const part_2_title = `${testId} agendaitem-pieces subcase part 2`;
    // const part_2_titleLong = `${testId} agendaitem-pieces subcase part 2 long title`;

    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.createCase(false, caseTitle);
    cy.addSubcase(null, part1Title, part1TitleLong, null, null);
    // cy.addSubcase(null, part_2_title, part_2_titleLong, null, null);
    cy.openSubcase(0);

    cy.addDocumentsToSubcase([
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-2', fileType: 'Nota',
      }
    ]);
    // cy.openSubcase(0);

    cy.createAgenda('Ministerraad', dateToCreateAgenda, 'Zaal oxford bij Cronos Leuven').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.addAgendaitemToAgenda(part1Title);
      cy.setAllItemsFormallyOk(2);
      cy.approveDesignAgenda();
      cy.addNewPieceToAgendaitem(part1Title, 'VR 2020 1212 DOC.0001-1', file);
      cy.addNewPieceToAgendaitem(part1Title, 'VR 2020 1212 DOC.0001-1BIS', file);
      cy.addNewPieceToAgendaitem(part1Title, 'VR 2020 1212 DOC.0001-2', file);
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get(document.documentCard).as('docCards');
      });
      cy.get('@docCards').should('have.length', 2);

      cy.deleteSinglePiece('VR 2020 1212 DOC.0001-1TER', 0);
      cy.deleteSinglePiece('VR 2020 1212 DOC.0001-2BIS', 0);
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get(document.documentCard).as('docCards');
      });
      cy.get('@docCards').should('have.length', 2);
      cy.get('@docCards').eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains('VR 2020 1212 DOC.0001-1BIS');
        });
      cy.get('@docCards').eq(1)
        .within(() => {
          cy.get('.auk-h4 > span').contains('VR 2020 1212 DOC.0001-2');
        });
      cy.openDetailOfAgendaitem(part1Title);
      cy.get(agenda.agendaitemTitlesToSubcase).contains('Naar procedurestap')
        .click();
      cy.clickReverseTab('Documenten');
      cy.deleteSinglePiece('VR 2020 1212 DOC.0001-1BIS', 0);
      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get(document.documentCard).as('docCards');
      });
      cy.get('@docCards').should('have.length', 2);
      cy.get('@docCards').eq(0)
        .within(() => {
          cy.get('.auk-h4 > span').contains('VR 2020 1212 DOC.0001-1');
        });
      cy.clickReverseTab('Overzicht');
      cy.get(agenda.subcase.agendaLink).click();
      cy.get(agenda.agendaitemDocumentsTab).click();

      cy.get('.vlc-scroll-wrapper__body').within(() => {
        cy.get(document.documentCard).as('docCards');
      });
      cy.get('@docCards').should('have.length', 2);
      // TODO: Policy regarding "safe document removal" should be revised. (https://kanselarij.atlassian.net/browse/VAL-287)
      // cy.isPieceDeletable('VR 2020 1212 DOC.0001-1', 0, false);
      // cy.isPieceDeletable('VR 2020 1212 DOC.0001-2', 0, false);
    });
  });
});
