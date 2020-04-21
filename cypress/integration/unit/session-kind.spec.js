/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

import actionModal from "../../selectors/action-modal.selectors";

import printOverview from "../../selectors/print-overview.selectors";

import newsletter from "../../selectors/newsletter.selector";

context('Different session kinds should show different titles', () => {
  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
  const agendaDateSpecial = Cypress.moment().add('month', plusMonths).set('date', 3).set('hour', 20).set('minute', 20);
  const agendaDateElectronic = Cypress.moment().add('month', plusMonths).set('date', 4).set('hour', 20).set('minute', 20);

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.createAgenda('Bijzondere ministerraad', plusMonths, agendaDateSpecial, 'Zaal oxford bij Cronos Leuven');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDateElectronic, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should show the correct translations for normal session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad van';
    cy.openAgendaForDate(agendaDate);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetodecisions).click();
    cy.get(printOverview.printoverviewTemplateHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(printOverview.printoverviewDecisionsHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(printOverview.printoverviewDecisionsHeaderTitle).contains(textToDisplay);
  });

  it('should show the correct translations for special session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad van';
    cy.openAgendaForDate(agendaDateSpecial);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetodecisions).click();
    cy.get(printOverview.printoverviewTemplateHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(printOverview.printoverviewDecisionsHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(printOverview.printoverviewDecisionsHeaderTitle).contains(textToDisplay);
  });

  it('should show the correct translations for electronic session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure van';
    cy.openAgendaForDate(agendaDateElectronic);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetodecisions).click();
    cy.get(printOverview.printoverviewTemplateHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(printOverview.printoverviewDecisionsHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(printOverview.printoverviewDecisionsHeaderTitle).contains(textToDisplay);
  });

  it('should show the correct translations for all kinds of sessions in newsletter overview', () => {
    cy.visit('/kort-bestek');
    cy.get('.data-table > tbody', { timeout: 20000 }).children().as('rows');
    cy.get('@rows').within(() => {
      cy.contains(`Kort bestek voor de ministerraad van`);
      cy.contains(`Kort bestek voor de ministerraad via elektronische procedure van`);
      cy.contains(`Kort bestek voor de bijzondere ministerraad van`);
    });
  });

  it('should show the correct translations for normal session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad';
    cy.openAgendaForDate(agendaDate);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetonewsletter).click();
    cy.get(newsletter.overviewTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
  });

  it('should show the correct translations for special session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad';
    cy.openAgendaForDate(agendaDateSpecial);
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
    cy.openAgendaForDate(agendaDateElectronic);
    cy.get(actionModal.showActionOptions).click();
    cy.get(actionModal.navigatetonewsletter).click();
    cy.get(newsletter.overviewTitle).contains('Beslissingen van de Vlaamse Regering - Elektronische procedure');
    cy.clickReverseTab('Klad');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.meetingTitle).contains(textToDisplay);
  });

});
