/* global context, it, cy, Cypress, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import settings from '../../selectors/settings.selectors';
import utils from '../../selectors/utils.selectors';

context('Testing the application as Kanselarij user', () => {
  beforeEach(() => {
    cy.login('Secretarie');
  });

  // M-header toolbar tests

  it('Should have meeting, Case, Newsletter, and searchSettings in toolbar', () => {
    cy.get(utils.mHeader.publications).should('not.exist');
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('exist');
    cy.get(utils.mHeader.search).should('exist');
    cy.get(utils.mHeader.signatures).should('exist');
    cy.get(utils.mHeader.settings).should('exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as Secretarie', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');
    cy.url().should('include', '/overzicht');
  });

  it('Should switch to cases tab when cases is clicked as Secretarie', () => {
    cy.get(utils.mHeader.cases).click();
    cy.get(cases.casesHeader.title).should('exist');
    cy.url().should('include', '/dossiers');
  });

  it('Should switch to newsletter tab when newsletter is clicked as Secretarie', () => {
    cy.get(utils.mHeader.newsletters).click();
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', '/kort-bestek');
  });

  it('Should switch to search tab when search is clicked as Secretarie', () => {
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.title).should('exist');
    cy.url().should('include', '/zoeken');
  });

  it('Should switch to settings tab when settings is clicked as Secretarie', () => {
    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.generalSettings).should('exist');
    cy.get(settings.settings.manageMinisters).should('exist');
    cy.url().should('include', '/instellingen/overzicht');
  });

  context('Testing editor rights', () => {
    const agendaDate = Cypress.dayjs().add(1, 'weeks')
      .day(5);
    const agendaDateClosed = Cypress.dayjs().add(1, 'weeks')
      .day(6);
    const subcaseTitleShort1 = 'Cypress test: add subcaseNoDecisionDocs';
    const subcaseTitleShort2 = 'Cypress test: add subcase WithDecisionDocs';
    it('check create agenda', () => {
      cy.get(route.agendas.action.newMeeting);
    });

    it('check agenda route', () => {
      cy.openAgendaForDate(agendaDate);

      cy.get(agenda.agendaTabs.tabs).contains('Overzicht');
      cy.get(agenda.agendaTabs.tabs).contains('Detail');
      cy.get(agenda.agendaTabs.tabs).contains('Vergelijk');
      cy.get(agenda.agendaTabs.tabs).contains('Documenten');

      cy.get(agenda.agendaVersionActions.showOptions);
      cy.get(agenda.agendaitemSearch.input);
      cy.get(agenda.agendaActions.showOptions).click();

      cy.get(agenda.agendaActions.navigateToDecisions);
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintablePressAgenda);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments);
      cy.get(agenda.agendaActions.toggleEditingMeeting);
      cy.get(agenda.agendaActions.approveAllAgendaitems);

      cy.openAgendaForDate(agendaDateClosed);
      cy.get(agenda.agendaActions.showOptions).click();
      cy.get(agenda.agendaActions.releaseDecisions);
      cy.get(agenda.agendaActions.releaseDocuments);
    });

    it('check agenda overview', () => {
      cy.openAgendaForDate(agendaDate);
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaOverview.formallyOkEdit);
    });

    it('check agenda detail overview', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemControls.actions);

      cy.get(agenda.agendaitemTitlesView.linkToSubcase);

      cy.get(agenda.agendaitemTitlesView.edit);
      cy.get(mandatee.mandateePanelView.actions.edit);
      cy.get(utils.governmentAreasPanel.edit);
    });

    it('check agenda detail documents', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openAgendaitemDocumentTab(subcaseTitleShort1);
      cy.get(auk.loader).should('not.exist');

      cy.get(route.agendaitemDocuments.batchEdit);
      cy.get(route.agendaitemDocuments.openPublication)
        .should('not.exist');

      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.pubLink).should('not.exist');
      cy.get(document.documentCard.actions).eq(0)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory);
    });

    it('check agenda detail decisions', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(auk.loader).should('not.exist');

      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit);

      cy.get(agenda.agendaitemDecision.uploadFile);

      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);

      cy.get(document.documentCard.actions).click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);

      cy.get(document.documentCard.versionHistory);
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
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.pressagendaTab).click();
      cy.get(agenda.agendaitemPress.edit);
    });
  });
});
