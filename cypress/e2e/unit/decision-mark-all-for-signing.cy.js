/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
// import cases from '../../selectors/case.selectors';
// import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
// import route from '../../selectors/route.selectors';
// import signatures from '../../selectors/signature.selectors';

function deleteDecision(shortTitle, isAdmin = true) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.openDetailOfAgendaitem(shortTitle, isAdmin);
  cy.get(agenda.agendaitemNav.decisionTab).click();
  cy.intercept('DELETE', 'piece-parts/*').as(`deletePieceParts${randomInt}`);
  cy.intercept('DELETE', 'files/*').as(`deleteFile${randomInt}`);
  cy.intercept('DELETE', 'reports/*').as(`deleteReport${randomInt}`);
  cy.intercept('DELETE', 'document-containers/*').as(`deleteDocumentContainer${randomInt}`);
  cy.get(document.documentCard.actions)
    .should('not.be.disabled', {
      timeout: 60000,
    })
    .children(appuniversum.button)
    .click();
  cy.get(document.documentCard.delete).forceClick();
  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.wait(`@deletePieceParts${randomInt}`, {
    timeout: 60000,
  });
  cy.wait(`@deleteFile${randomInt}`, {
    timeout: 60000,
  });
  cy.wait(`@deleteReport${randomInt}`, {
    timeout: 60000,
  });
  cy.wait(`@deleteDocumentContainer${randomInt}`, {
    timeout: 60000,
  });
  cy.get(document.documentCard.card).should('not.exist', {
    timeout: 60000,
  });
}

context('Decision tests post digital agenda', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test mark all decisions for signing', () => {
    const agendaDate = Cypress.dayjs('2023-11-28').hour(10);
    const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
    const agendaSecretary = 'Jeroen Overmeer';
    const shortTitle1 = 'Cypress test: Decision - CRUD of decisions - Nota';
    const shortTitle2 = 'Cypress test: Decision - CRUD of decisions - Mededeling';
    const signFlowStatus = 'Op te starten';
    // const succesMessageSingle = 'beslissing is succesvol aangeboden voor ondertekenen';
    const succesMessageMultiple = 'beslissingen zijn succesvol aangeboden voor ondertekenen';
    const warningMessage = 'Er zijn geen beslissingen om aan te bieden voor ondertekenen';

    cy.openAgendaForDate(agendaDate);

    // try with 2 decisions
    cy.get(auk.loader).should('not.exist');
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.intercept('POST', 'signing-flows/mark-pieces-for-signing').as('markDecisionsForSigning1');
    cy.get(agenda.agendaActions.markDecisionsForSigning).forceClick();
    // message can already be gone faster than cypress can check after finding the POST
    cy.get(appuniversum.alert.message).contains(succesMessageMultiple);
    cy.wait('@markDecisionsForSigning1');

    // check the sign status pills
    cy.openDetailOfAgendaitem(shortTitle1);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.signaturePill.pill).contains(signFlowStatus);
    cy.openDetailOfAgendaitem(shortTitle2);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.signaturePill.pill).contains(signFlowStatus);

    // check signflow
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.get(`tr:visible:contains(${agendaDateFormatted})`).should('have.length', 2);
    cy.get(`tr:visible:contains(${agendaSecretary})`).should('have.length', 2);

    // add decision to report
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem('Goedkeuring van het verslag', false);
    cy.generateDecision();

    // try with 3 decisions, should make 1
    cy.get(auk.loader).should('not.exist');
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.intercept('POST', 'signing-flows/mark-pieces-for-signing').as('markDecisionsForSigning2');
    cy.get(agenda.agendaActions.markDecisionsForSigning).forceClick();
    // TODO message doesn't show correct number
    // cy.get(appuniversum.alert.message).contains(succesMessageSingle);
    cy.wait('@markDecisionsForSigning2');

    // check the signflow status pill
    cy.openDetailOfAgendaitem('Goedkeuring van het verslag', false);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.signaturePill.pill).contains(signFlowStatus);

    // check signflow
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.get(`tr:visible:contains(${agendaDateFormatted})`).should('have.length', 3);
    cy.get(`tr:visible:contains(${agendaSecretary})`).should('have.length', 3);

    // try again with 3 decisions, none should be made, warning should be given
    cy.openAgendaForDate(agendaDate);
    cy.get(auk.loader).should('not.exist');
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.intercept('POST', 'signing-flows/mark-pieces-for-signing').as('markDecisionsForSigning3');
    cy.get(agenda.agendaActions.markDecisionsForSigning).forceClick();
    // TODO warning doesn't show correctly
    // cy.get(appuniversum.alert.message).contains(warningMessage);
    cy.wait('@markDecisionsForSigning3');

    // delete decisions
    deleteDecision('Goedkeuring van het verslag', false);
    deleteDecision(shortTitle1);
    deleteDecision(shortTitle2);

    // try without decisions, warning should be given
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    // no post call
    cy.get(agenda.agendaActions.markDecisionsForSigning).forceClick();
    // TODO warning doesn't show?
    cy.get(appuniversum.alert.message).contains(warningMessage);
  });
});
