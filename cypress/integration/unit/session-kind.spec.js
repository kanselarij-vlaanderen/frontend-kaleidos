/* global context, before, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
// import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

// function currentTimestamp() {
//   return Cypress.moment().unix();
// }

function checkDecisionPage(headerText) {
  cy.get(agenda.agendaHeader.showOptions).click();
  cy.get(agenda.agendaHeader.actions.navigateToDecisions).click();
  cy.get(utils.overviewsHeaderDecision.title).contains(headerText);
}

function checkNewsletterPage(headerText, newsletterTitle) {
  cy.get(agenda.agendaHeader.showOptions).click();
  cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
  cy.get(newsletter.newsletterHeaderOverview.title).contains(headerText);
  cy.clickReverseTab('Klad');
  cy.get(newsletter.newsletterMeeting.title).contains(newsletterTitle);
  cy.clickReverseTab('Definitief');
  cy.get(newsletter.newsletterMeeting.title).contains(newsletterTitle);
}

function selectFromDropdown(item) {
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 5000,
  }).wait(500)
    .contains(item)
    .scrollIntoView()
    .trigger('mouseover')
    .click({
      force: true,
    });
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 15000,
  }).should('not.be.visible');
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
  // TODO-printableAgenda shows session-kind

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
    cy.get(route.newsletters.dataTable).find('tbody')
      .children('tr')
      .as('rows');
    cy.get('@rows').within(() => {
      // TODO-PVV agenda
      cy.get(route.newsletters.row.title).contains('Kort bestek voor de ministerraad van');
      cy.get(route.newsletters.row.title).contains('Kort bestek voor de ministerraad via elektronische procedure van');
      cy.get(route.newsletters.row.title).contains('Kort bestek voor de bijzondere ministerraad van');
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

  it('should test the PVV agenda', () => {
    const kind = 'Ministerraad - Plan Vlaamse Veerkracht';
    const relatedMainMeetingDate = Cypress.moment('2020-04-19T14:00');
    const formattedMeetingDateHour = relatedMainMeetingDate.format('DD-MM-YYYY HH:mm');
    const formattedMeetingDateSlashes = relatedMainMeetingDate.format('DD-MM-YYYY');
    const formattedMeetingDateDots = relatedMainMeetingDate.format('DD.MM.YYYY');
    const numberRep = '54-VV';

    // const type = 'Nota';
    // const subcaseTitleShort = `Cypress test: add subcase - ${currentTimestamp()}`;
    // const subcaseTitleLong = 'Cypress test voor het aanmaken van een procedurestap';
    // const subcaseType = 'In voorbereiding';
    // const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    // set kind to PVV
    cy.get(route.agendas.action.newMeeting).click();
    cy.get(agenda.newSession.kind).click();
    selectFromDropdown(kind);
    // select related main meeting
    cy.get(agenda.newSession.relatedMainMeeting).click();
    selectFromDropdown(formattedMeetingDateSlashes);
    // change number (because undefined)
    cy.get(agenda.newSession.numberRep.edit).click();
    cy.get(agenda.newSession.numberRep.input).click()
      .clear()
      .type(numberRep);
    cy.get(agenda.newSession.numberRep.save).click();
    cy.route('PATCH', '/meetings/**').as('patchMeetings');
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@patchMeetings');
    // check if edit shows correct data
    cy.openAgendaForDate(relatedMainMeetingDate);
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.toggleEditingSession).click();
    cy.get(utils.kindSelector).contains(kind);
    cy.get(utils.vlDatepicker).should('have.value', formattedMeetingDateHour);
    cy.get(agenda.editSession.numberRep).should('have.value', numberRep);
    cy.get(utils.vlModalFooter.cancel).click();


    // check if different views show correct header
    cy.get(agenda.agendaHeader.kind).contains(kind);
    checkDecisionPage(kind);
    cy.get(auk.tab.hierarchicalBack).click();
    checkNewsletterPage(kind, kind);

    // TODO showProposedAgendas shows no agendas
    // check procedure step view
    // cy.visit('/dossiers/5F02E3F87DE3FC0008000002/deeldossiers');
    // cy.addSubcase(type, subcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    // cy.openSubcase(0);
    // cy.get(cases.subcaseHeader.showProposedAgendas).click();
    // cy.get(cases.subcaseHeader.actions.proposeForAgenda).contains('VV');

    // check kort bestek overview and order
    // TODO this visit is flakey
    cy.visit('/kort-bestek?size=100');
    cy.wait(2000);
    cy.get(route.newsletters.dataTable).find('tbody')
      .children('tr')
      .as('rows');
    cy.get('@rows').within(() => {
      cy.get(route.newsletters.row.title).contains(`Kort bestek voor de ministerraad - plan vlaamse veerkracht van ${formattedMeetingDateDots}`)
        .parents('tr')
        .next()
        .find(route.newsletters.row.title)
        .contains(`Kort bestek voor de ministerraad van ${formattedMeetingDateDots}`);
    });

    // check agenda overview and order
    // TODO this visit is flakey
    cy.visit('/overzicht?size=100');
    cy.wait(2000);
    cy.get(route.agendasOverview.dataTable).find('tbody')
      .children('tr')
      .as('rows');
    cy.get('@rows').within(() => {
      cy.get(route.agendasOverview.row.title).contains(formattedMeetingDateDots)
        .parents('tr')
        .find(route.agendasOverview.row.kind)
        .contains(kind)
        .parents('tr')
        .next()
        .find(route.agendasOverview.row.kind)
        .contains('Ministerraad');
    });
  });
});
