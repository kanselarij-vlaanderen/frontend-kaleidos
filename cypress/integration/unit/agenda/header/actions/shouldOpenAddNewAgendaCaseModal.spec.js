/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import {
  navigatetosubcases
} from "../../../../../selectors/agenda/actionModalSelectors";

context('Model action', () => {

  beforeEach(() => {
    cy.server();
    cy.login('Admin');

  });

  it('Should open the model to add new case to Agenda', () => {
    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'januari';
    const YEAR = '2020';
    const DAY = '13';
    cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE);
    cy.openAgenda(1,"13 januari 2020", "10:00");
    cy.openActionModal();
    cy.get(navigatetosubcases).click();
  });
});
