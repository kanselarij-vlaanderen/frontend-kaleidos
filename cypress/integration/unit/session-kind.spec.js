/* global context, it, cy, Cypress, beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function checkDecisionPage(headerText) {
  cy.get(agenda.agendaActions.showOptions).click();
  cy.get(agenda.agendaActions.navigateToDecisions).click();
  cy.get(utils.overviewsHeaderDecision.title).contains(headerText);
}

function checkNewsletterPage(headerText, newsletterTitle) {
  cy.get(agenda.agendaActions.showOptions).click();
  cy.get(agenda.agendaActions.navigateToNewsletter).click();
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
  }).should('not.exist');
}

context('Different session kinds should show different titles', () => {
  const regular = '/vergadering/5EC5258C5B08050008000001/agenda/5EC5258D5B08050008000002/agendapunten';
  const special = '/vergadering/5EC525AC5B08050008000005/agenda/5EC525AD5B08050008000006/agendapunten';
  const electronic = '/vergadering/5EC525CB5B08050008000009/agenda/5EC525CC5B0805000800000A/agendapunten';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

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
    const agendaNumber = 100;
    const agendaDate = Cypress.dayjs().add(3, 'weeks')
      .day(3)
      .hour(10)
      .minute(0);
    const formattedAgendaDate = agendaDate.format('DD-MM-YYYY');
    const vvKind = 'Ministerraad - Plan Vlaamse Veerkracht';
    const decisionHeader = `Beslissingen van de Vlaamse Regering - ${vvKind}`;
    const newsletterHeader = `Beslissingen van de Vlaamse Regering - ${vvKind}`;
    const formattedMeetingDateDots = agendaDate.format('DD-MM-YYYY');
    // TODO-BUG KAS-3056 numbering not correct when creating agenda in different year
    const fullmeetingNumber = `VR PV ${Cypress.dayjs().format('YYYY')}/${agendaNumber}`;
    // const fullmeetingNumber = `VR PV ${agendaDate.format('YYYY')}/${agendaNumber}`;
    const suffixVV = '-VV';
    const fullmeetingNumberVV = `${fullmeetingNumber}${suffixVV}`;
    const newCaseTitle = 'Dossier voor PVV agenda';

    cy.intercept('GET', '/meetings/**/internal-decision-publication-activity').as('getDecisionPubActivity');
    cy.intercept('GET', '/meetings/**/internal-document-publication-activity').as('getDocPubActivity');
    cy.intercept('GET', '/themis-publication-activities**').as('getThemisPubActivity');
    cy.intercept('GET', '/concepts?filter**').as('loadConcepts');

    cy.createAgenda(null, agendaDate, null, agendaNumber);
    // set kind to PVV
    cy.get(route.agendas.action.newMeeting).click();
    cy.get(utils.kindSelector.kind).click();
    selectFromDropdown(vvKind);
    // select related main meeting
    cy.get(agenda.editMeeting.relatedMainMeeting).click();
    selectFromDropdown(formattedAgendaDate);
    cy.get(agenda.editMeeting.numberRep.view).should('contain', fullmeetingNumberVV);
    cy.intercept('POST', '/meetings').as('createMeeting');
    cy.intercept('POST', '/agendas').as('createAgenda');
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@createMeeting');
    cy.wait('@createAgenda');
    // check if edit shows correct data
    cy.openAgendaForDate(agendaDate, 1);
    cy.get(agenda.agendaActions.showOptions).click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).click();
    cy.wait('@getDecisionPubActivity');
    cy.wait('@getDocPubActivity');
    cy.wait('@getThemisPubActivity');
    cy.wait('@loadConcepts');
    cy.get(utils.kindSelector).contains(vvKind);
    cy.get(agenda.editMeeting.numberRep.view).should('contain', fullmeetingNumberVV);
    cy.get(auk.modal.footer.cancel).click();

    // check if different views show correct header
    cy.get(agenda.agendaHeader.kind).contains(vvKind);
    checkDecisionPage(decisionHeader);
    cy.get(auk.tab.hierarchicalBack).click();
    checkNewsletterPage(vvKind, newsletterHeader);

    // check kort bestek overview and order
    cy.visit('/kort-bestek?size=100');
    cy.get(route.newsletters.dataTable).find('tbody')
      .children('tr');
    // first agenda should always be the normal kind, second PVV
    cy.get(route.newsletters.row.title).contains(`Kort bestek voor de ministerraad van ${formattedMeetingDateDots}`)
      .parents('tr')
      .next()
      .find(route.newsletters.row.title)
      .contains(`Kort bestek voor de ministerraad - plan vlaamse veerkracht van ${formattedMeetingDateDots}`);

    // check agenda overview and order
    cy.visit('/overzicht?size=100');
    cy.get(route.agendasOverview.dataTable).find('tbody')
      .children('tr');
    // first agenda should always be the normal kind, second PVV
    cy.get(route.agendasOverview.row.title).contains(formattedAgendaDate)
      .eq(0)
      .parents('tr')
      .find(route.agendasOverview.row.kind)
      .contains('Ministerraad')
      .parents('tr')
      .next()
      .find(route.agendasOverview.row.kind)
      .contains(vvKind);

    // check procedure step view
    cy.createCase(newCaseTitle);
    // adding a subcase without a new shorttitle will use the shorttitle from case
    cy.addSubcase();
    cy.openSubcase(0);
    // TODO-bug multiple clicks on dropdown are flakey
    // Check if both agendas are listed in dropdown
    // cy.get(cases.subcaseHeader.showProposedAgendas).click();
    // cy.get(cases.subcaseHeader.actions.proposeForAgenda).should('contain', fullmeetingNumberVV);
    // cy.get(cases.subcaseHeader.showProposedAgendas).click();
    cy.proposeSubcaseForAgenda(agendaDate, fullmeetingNumberVV);
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 1);
    // PVV agenda doesn't have approval item by default
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(newCaseTitle);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).should('not.contain', 'verslag');
  });
});
