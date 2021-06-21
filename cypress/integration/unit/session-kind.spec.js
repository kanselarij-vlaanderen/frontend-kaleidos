/* global context, before, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function checkDecisionPage(headerText) {
  cy.get(agenda.agendaHeader.showActionOptions).click();
  cy.get(agenda.agendaHeader.actions.navigateToDecisions).click();
  cy.get(utils.overviewsHeaderDecision.title).contains(headerText);
}

function checkNewsletterPage(headerText, newsletterTitle) {
  cy.get(agenda.agendaHeader.showActionOptions).click();
  cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
  cy.get(newsletter.newsletterHeaderOverview.title).contains(headerText);
  cy.clickReverseTab('Klad');
  cy.get(newsletter.newsletterMeeting.title).contains(newsletterTitle);
  cy.clickReverseTab('Definitief');
  cy.get(newsletter.newsletterMeeting.title).contains(newsletterTitle);
}

context('Different session kinds should show different titles', () => {
  const regular = '/vergadering/5EC5258C5B08050008000001/agenda/5EC5258D5B08050008000002/agendapunten';
  const special = '/vergadering/5EC525AC5B08050008000005/agenda/5EC525AD5B08050008000006/agendapunten';
  const electronic = '/vergadering/5EC525CB5B08050008000009/agenda/5EC525CC5B0805000800000A/agendapunten';

  before(() => {
    cy.server();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-PVV agenda

  it('should show the correct translations for normal session in decision print overview', () => {
    const headerText = 'Beslissingen van de Vlaamse Regering - Ministerraad van';
    cy.visit(regular);
    checkDecisionPage(headerText);
  });

  it('should show the correct translations for special session in decision print overview', () => {
    const headerText = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad van';
    cy.visit(special);
    checkDecisionPage(headerText);
  });

  it('should show the correct translations for electronic session in decision print overview', () => {
    const headerText = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure van';
    cy.visit(electronic);
    checkDecisionPage(headerText);
  });

  it('should show the correct translations for all kinds of sessions in newsletter overview', () => {
    cy.visit('/kort-bestek?size=100');
    cy.get(route.newsletters.dataTable)
      .children()
      .as('rows');
    cy.get('@rows').within(() => {
      // TODO-PVV agenda
      cy.contains('Kort bestek voor de ministerraad van');
      cy.contains('Kort bestek voor de ministerraad via elektronische procedure van');
      cy.contains('Kort bestek voor de bijzondere ministerraad van');
    });
  });

  it('should show the correct translations for normal session in newsletter-info print overview', () => {
    const headerText = 'Beslissingen van de Vlaamse Regering - Ministerraad';
    const newsletterTitle = headerText;
    cy.visit(regular);
    checkNewsletterPage(headerText, newsletterTitle);
  });

  it('should show the correct translations for special session in newsletter-info print overview', () => {
    const headerText = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad';
    const newsletterTitle = headerText;
    cy.visit(special);
    checkNewsletterPage(headerText, newsletterTitle);
  });

  it('should show the correct translations for electronic session in newsletter-info print overview', () => {
    const headerText = 'Beslissingen van de Vlaamse Regering - Elektronische procedure';
    const newsletterTitle = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure';
    cy.visit(electronic);
    checkNewsletterPage(headerText, newsletterTitle);
  });
});
