/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

import {showActionOptions, navigatetodecisions, navigatetonewsletter
} from "../../selectors/agenda/actionModalSelectors";

import {printoverviewTemplateHeaderTitle, printoverviewDecisionsHeaderTitle
} from "../../selectors/print-overview/templateSelectors";

import {newslettersMeetingTitleSelector, newslettersoverviewTitleSelector
} from "../../selectors/newsletters/newsletterSelector";

context('Formally ok/nok tests', () => {
  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
  const agendaDateSpecial = Cypress.moment().add('month', plusMonths).set('date', 3).set('hour', 20).set('minute', 20);
  const agendaDateElectronic = Cypress.moment().add('month', plusMonths).set('date', 4).set('hour', 20).set('minute', 20);

  before(() => {
    cy.server();
    cy.resetDB();
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
    cy.get(showActionOptions).click();
    cy.get(navigatetodecisions).click();
    cy.get(printoverviewTemplateHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(printoverviewDecisionsHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(printoverviewDecisionsHeaderTitle).contains(textToDisplay);
  });

  it('should show the correct translations for special session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad van';
    cy.openAgendaForDate(agendaDateSpecial);
    cy.get(showActionOptions).click();
    cy.get(navigatetodecisions).click();
    cy.get(printoverviewTemplateHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(printoverviewDecisionsHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(printoverviewDecisionsHeaderTitle).contains(textToDisplay);
  });

  it('should show the correct translations for electronic session in decision print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure van';
    cy.openAgendaForDate(agendaDateElectronic);
    cy.get(showActionOptions).click();
    cy.get(navigatetodecisions).click();
    cy.get(printoverviewTemplateHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(printoverviewDecisionsHeaderTitle).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(printoverviewDecisionsHeaderTitle).contains(textToDisplay);
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
    cy.get(showActionOptions).click();
    cy.get(navigatetonewsletter).click();
    cy.get(newslettersoverviewTitleSelector).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(newslettersMeetingTitleSelector).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newslettersMeetingTitleSelector).contains(textToDisplay);
  });

  it('should show the correct translations for special session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Bijzondere ministerraad';
    cy.openAgendaForDate(agendaDateSpecial);
    cy.get(showActionOptions).click();
    cy.get(navigatetonewsletter).click();
    cy.get(newslettersoverviewTitleSelector).contains(textToDisplay);
    cy.clickReverseTab('Klad');
    cy.get(newslettersMeetingTitleSelector).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newslettersMeetingTitleSelector).contains(textToDisplay);
  });

  it('should show the correct translations for electronic session in newsletter-info print overview', () => {
    const textToDisplay = 'Beslissingen van de Vlaamse Regering - Ministerraad via elektronische procedure';
    cy.openAgendaForDate(agendaDateElectronic);
    cy.get(showActionOptions).click();
    cy.get(navigatetonewsletter).click();
    cy.get(newslettersoverviewTitleSelector).contains('Beslissingen van de Vlaamse Regering - Elektronische procedure');
    cy.clickReverseTab('Klad');
    cy.get(newslettersMeetingTitleSelector).contains(textToDisplay);
    cy.clickReverseTab('Definitief');
    cy.get(newslettersMeetingTitleSelector).contains(textToDisplay);
  });

});
