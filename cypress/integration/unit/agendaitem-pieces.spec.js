/* global context, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';

context('Tests of pieces on agendaitems', () => {
  beforeEach(() => {
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
    // const agendaDate = Cypress.dayjs('2022-04-15');
    const subcaseTitleShort = 'Cypress test: agendaitem - restore previous piece - short title - 1652702232';

    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    // *Setup of this test:
    // Agenda A has 1 approval and 1 agendaitem with 2 pieces (originals)
    // Agenda B agendaitem has 1 BIS on 1 of the pieces

    cy.visitAgendaWithLink('/vergadering/62823C647471A1FC25E6DB64/agenda/c67b5fd0-d510-11ec-8327-9b7fa945c1fc/agendapunten/c6aea4d0-d510-11ec-8327-9b7fa945c1fc/documenten');
    cy.addNewPieceToAgendaitem(subcaseTitleShort, 'VR 2020 1212 DOC.0001-1BIS', file); // add TER to doc 1 BIS
    cy.addNewPieceToAgendaitem(subcaseTitleShort, 'VR 2020 1212 DOC.0001-2', file); // add BIS to doc 2
    cy.get(document.documentCard.card).should('have.length', 2);

    cy.deletePieceBatchEditRow('VR 2020 1212 DOC.0001-1TER', 0, route.agendaitemDocuments.batchEdit);
    // cy.deletePieceBatchEditRow('VR 2020 1212 DOC.0001-2BIS', 1, route.agendaitemDocuments.batchEdit); // error pushedData on piece root.flight.deleted
    cy.get(document.documentCard.card).should('have.length', 2);
    cy.get(document.documentCard.name.value).eq(0)
      .contains('VR 2020 1212 DOC.0001-1BIS');
    cy.get(document.documentCard.name.value).eq(1)
      .contains('VR 2020 1212 DOC.0001-2BIS');
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.clickReverseTab('Documenten');
    cy.deletePieceBatchEditRow('VR 2020 1212 DOC.0001-1BIS', 0, route.subcaseDocuments.batchEdit);
    cy.get(document.documentCard.card).should('have.length', 2);
    cy.get(document.documentCard.name.value).eq(0)
      .contains('VR 2020 1212 DOC.0001-1');
    cy.visitAgendaWithLink('/vergadering/62823C647471A1FC25E6DB64/agenda/c67b5fd0-d510-11ec-8327-9b7fa945c1fc/agendapunten/c6aea4d0-d510-11ec-8327-9b7fa945c1fc/documenten');

    // cy.clickReverseTab('Overzicht');
    // cy.get(cases.subcaseDescription.agendaLink).click();
    // cy.get(agenda.agendaitemNav.documentsTab).click();

    cy.get(document.documentCard.card).should('have.length', 2);
    // TODO: Policy regarding "safe document removal" should be revised. (https://kanselarij.atlassian.net/browse/VAL-287)
    // cy.isPieceDeletable('VR 2020 1212 DOC.0001-1', 0, false);
    // cy.isPieceDeletable('VR 2020 1212 DOC.0001-2', 0, false);
  });
});
