/* global context, it, cy, Cypress, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as Kort bestek user', () => {
  beforeEach(() => {
    // cy.login does not trigger the transtition to the default route for this profile for some reason
    cy.loginFlow('Kort bestek');
    cy.wait(1000);
  });

  // M-header toolbar tests

  it('Should have agenda, case, search and newsletter in toolbar', () => {
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('exist');
    cy.get(utils.mHeader.search).should('exist');

    cy.get(utils.mHeader.signatures).should('not.exist');
    cy.get(utils.mHeader.publications).should('not.exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should start on newsletter tab after logging in and switch to newsletter tab when newsletter is clicked', () => {
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', 'kort-bestek');

    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');

    cy.get(utils.mHeader.newsletters).click();
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', '/kort-bestek');
  });

  it('Should switch to Agenda tab when agenda is clicked', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');
    cy.url().should('include', 'overzicht');
  });

  it('Should switch to cases tab when cases is clicked', () => {
    cy.get(utils.mHeader.cases).click();
    cy.get(cases.casesHeader.title).should('exist');
    cy.url().should('include', '/dossiers');
  });

  it('Should switch to search tab when search is clicked', () => {
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.title).should('exist');
    cy.url().should('include', '/zoeken');
  });

  it('Should switch to newsletter tab when newsletter is clicked', () => {
    cy.get(utils.mHeader.newsletters).click();
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', '/kort-bestek');
  });

  it('Should have limited options in the agenda actions', () => {
    cy.visitAgendaWithLink('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten');

    cy.get(agenda.agendaActions.showOptions).click();
    // Allowed actions
    cy.get(agenda.agendaActions.navigateToNewsletter).should('exist');
    cy.get(agenda.agendaActions.navigateToPrintablePressAgenda).should('exist');
    cy.get(agenda.agendaActions.navigateToPrintableAgenda).should('exist');
    cy.get(agenda.agendaActions.downloadDocuments).should('exist');
    // TODO Plan publication / withdraw publication should not be done by KB?
    // Restricted actions
    // TODO can KB manage desisions?
    cy.get(agenda.agendaActions.navigateToDecisions).should('not.exist');
  });

  context('Testing viewer/editor rights', () => {
    const agendaDate = Cypress.dayjs().add(1, 'weeks')
      .day(5);
    const agendaDateClosed = Cypress.dayjs().add(1, 'weeks')
      .day(6);
    const agendaDateReleased = Cypress.dayjs().add(1, 'weeks')
      .day(7);
    const subcaseTitleShort1 = 'Cypress test: add subcaseNoDecisionDocs';
    const subcaseTitleShort2 = 'Cypress test: add subcase WithDecisionDocs';
    const subcaseTitleShort3 = 'Cypress test: add subcase for decision only';
    const subcaseTitleShort4 = 'Cypress test: add subcase for decision only with docs';

    it('check create agenda doesnt exist', () => {
      cy.get(utils.mHeader.agendas).click();
      cy.get(route.agendasOverview.filter.container);
      cy.get(route.agendas.action.newMeeting).should('not.exist');
    });

    it('check agenda route', () => {
      cy.openAgendaForDate(agendaDate);

      cy.get(agenda.agendaTabs.tabs).contains('Overzicht');
      cy.get(agenda.agendaTabs.tabs).contains('Detail');
      cy.get(agenda.agendaTabs.tabs).contains('Vergelijk')
        .should('not.exist');
      cy.get(agenda.agendaTabs.tabs).contains('Documenten');

      cy.get(agenda.agendaVersionActions.showOptions).should('not.exist');
      cy.get(agenda.agendaitemSearch.input);
      cy.get(agenda.agendaActions.showOptions).click();

      cy.get(agenda.agendaActions.navigateToDecisions).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintablePressAgenda);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments);
      cy.get(agenda.agendaActions.toggleEditingMeeting).should('not.exist');
      cy.get(agenda.agendaActions.approveAllAgendaitems).should('not.exist');

      cy.openAgendaForDate(agendaDateClosed);
      cy.get(agenda.agendaActions.showOptions).click();
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.releaseDecisions).should('not.exist');
      cy.get(agenda.agendaActions.releaseDocuments).should('not.exist');
    });

    it('check agenda overview', () => {
      cy.openAgendaForDate(agendaDate);
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaOverview.formallyOkEdit).should('not.exist');
    });

    it('check agenda detail overview', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);

      cy.get(agenda.agendaitemTitlesView.linkToSubcase);

      cy.get(agenda.agendaitemControls.actions).should('not.exist');

      cy.get(agenda.agendaitemTitlesView.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');
    });

    it('check agenda detail documents', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openAgendaitemDocumentTab(subcaseTitleShort1);
      cy.get(auk.loader).should('not.exist');

      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.pubLink).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');

      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
    });

    it('check agenda detail decisions', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.decisionTab).should('not.exist');

      cy.openAgendaForDate(agendaDateReleased);
      cy.openDetailOfAgendaitem(subcaseTitleShort3);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(auk.loader).should('not.exist');

      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit).should('not.exist');

      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');

      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');

      cy.get(document.documentCard.actions).should('not.exist');

      cy.get(document.documentCard.versionHistory).should('not.exist');
    });

    it('check agenda detail newsletter', () => {
      cy.openAgendaForDate(agendaDate);

      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.newsletterTab).click();
      cy.get(newsletter.newsItem.create);

      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.newsletterTab).click();

      cy.get(newsletter.newsItem.fullscreenEdit);
      cy.get(newsletter.newsItem.edit);

      // TODO via adres naar kort bestek
    });

    it('check agenda detail pressagenda', () => {
      // TODO flakey test
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.activeTab);
      cy.get(agenda.agendaitemNav.pressagendaTab).should('not.exist');

      cy.openAgendaForDate(agendaDateReleased);
      cy.openDetailOfAgendaitem(subcaseTitleShort3);
      cy.get(agenda.agendaitemNav.pressagendaTab).click();
      cy.get(agenda.agendaitemPress.title);
      cy.get(agenda.agendaitemPress.edit).should('not.exist');

      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.pressagendaTab).click();
      cy.get(agenda.agendaitemPress.title);
      cy.get(agenda.agendaitemPress.edit).should('not.exist');
    });
  });
});
