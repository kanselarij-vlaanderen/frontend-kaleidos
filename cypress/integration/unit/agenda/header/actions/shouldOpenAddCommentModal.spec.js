/*global context, it, cy, Cypress, beforeEach*/
/// <reference types="Cypress" />

import actionModal from "../../../../../selectors/action-modal.selectors";
import form from "../../../../../selectors/form.selectors";
import modal from "../../../../../selectors/modal.selectors";

context('Model action', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');

  });

  it('Should open the model to add new case to Agenda', () => {
    cy.route('POST', 'files').as('createNewFile');
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE);
    const agendaDate = Cypress.moment("2020-01-13").set({"hour": 10, "minute": 10});
    cy.openAgendaForDate(agendaDate);
    cy.openActionModal();
    cy.get(actionModal.addAnnouncement).click();
    cy.get(form.formInput).type('Dit is een korte titel');
    cy.get(modal.createAnnouncement.titleSubcase).type('Dit is de subcasetitle')
    cy.get('.vl-upload__element__button__container').click();
    cy.fixture("files/test.pdf").then(fileContent => {
      cy.get('[type=file]').upload(
        {fileContent, fileName: "test.pdf", mimeType: 'application/pdf'},
        {uploadType: 'input'});
      cy.wait('@createNewFile');
      cy.get(form.formSave).click();
    });
  });
});
