/* global context, before, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import printOverview from '../../selectors/print-overview.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import agenda from '../../selectors/agenda.selectors';

context('Different session kinds should show different titles', () => {
  const regular = '/vergadering/5EC5258C5B08050008000001/agenda/5EC5258D5B08050008000002/agendapunten';
  const special = '/vergadering/5EC525AC5B08050008000005/agenda/5EC525AD5B08050008000006/agendapunten';
  const electronic = '/vergadering/5EC525CB5B08050008000009/agenda/5EC525CC5B0805000800000A/agendapunten';

  before(() => {
    cy.server();
    cy.login('Admin');
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO PVV agenda

  it('should show the correct translations for normal session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad van';
    cy.visit(regular);
    cy.get(agenda.agendaHeader.showActionOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToDecisions).click();
    cy.get(printOverview.overviewsHeaderDecision).contains(textToDisplay);
  });

  it('should show the correct translations for special session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad van';
    cy.visit(special);
    cy.get(agenda.agendaHeader.showActionOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToDecisions).click();
    cy.get(printOverview.overviewsHeaderDecision).contains(textToDisplay);
  });

  it('should show the correct translations for electronic session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure van';
    cy.visit(electronic);
    cy.get(agenda.agendaHeader.showActionOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToDecisions).click();
    cy.get(printOverview.overviewsHeaderDecision).contains(textToDisplay);
  });

  it('should show the correct translations for all kinds of sessions in newsletter overview', () => {
    cy.visit('/kort-bestek?size=100');
    cy.get('.data-table > tbody', {
      timeout: 20000,
    }).children()
      .as('rows');
    cy.get('@rows').within(() => {
      cy.contains('Kort bestek voor de ministerraad van');
      cy.contains('Kort bestek voor de ministerraad via elektronische procedure van');
      cy.contains('Kort bestek voor de bijzondere ministerraad van');
    });
  });

  it('should show the correct translations for normal session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad';
    cy.visit(regular);
    cy.get(agenda.agendaHeader.showActionOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    // TODO testselector could include "header"
    cy.get(newsletter.newsletterHeaderOverview.title).contains(textToDisplay);
    // TODO verify klad & definitief ?
  });

  it('should show the correct translations for special session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad';
    cy.visit(special);
    cy.get(agenda.agendaHeader.showActionOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    cy.get(newsletter.newsletterHeaderOverview.title).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(newsletter.newsletterMeeting.title).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterMeeting.title).contains(textToDisplay);
  });

  it('should show the correct translations for electronic session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure';
    cy.visit(electronic);
    cy.wait(1000);
    cy.get(agenda.agendaHeader.showActionOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    cy.get(newsletter.newsletterHeaderOverview.title).contains('Beslissingen van de Vlaamse Regering - Elektronische procedure');
    cy.clickReverseTab('Klad');
    cy.get(newsletter.newsletterMeeting.title).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterMeeting.title).contains(textToDisplay);
  });
});
