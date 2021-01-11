/* global context, before, it, cy, beforeEach, afterEach */
// / <reference types="Cypress" />

import actionModal from '../../selectors/action-modal.selectors';

import printOverview from '../../selectors/print-overview.selectors';

import newsletter from '../../selectors/newsletter.selector';

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

  it('should show the correct translations for normal session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad van';
    cy.visit(regular);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetodecisions).click();
    cy.get(printOverview.printoverviewTemplateHeaderTitle).contains(textToDisplay);
  });

  it('should show the correct translations for special session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad van';
    cy.visit(special);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetodecisions).click();
    cy.get(printOverview.printoverviewTemplateHeaderTitle).contains(textToDisplay);
  });

  it('should show the correct translations for electronic session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure van';
    cy.visit(electronic);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetodecisions).click();
    cy.get(printOverview.printoverviewTemplateHeaderTitle).contains(textToDisplay);
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
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetonewsletter).click();
    cy.get(newsletter.overviewTitle).contains(textToDisplay);
  });

  it('should show the correct translations for special session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad';
    cy.visit(special);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetonewsletter).click();
    cy.get(newsletter.overviewTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
  });

  it('should show the correct translations for electronic session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure';
    cy.visit(electronic);
    cy.wait(1000);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetonewsletter).click();
    cy.get(newsletter.overviewTitle).contains('Beslissingen van de Vlaamse Regering - Elektronische procedure');
    cy.clickReverseTab('Klad');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
  });
});
