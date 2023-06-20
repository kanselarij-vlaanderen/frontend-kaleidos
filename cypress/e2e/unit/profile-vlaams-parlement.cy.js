/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
// import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as Vlaams Parlement', () => {
  beforeEach(() => {
    cy.login('Vlaams Parlement');
    cy.wait(1000);
  });

  context('M-header toolbar tests', () => {
    it('Should have agenda, case, search, publications and signatures in toolbar', () => {
      cy.get(utils.mHeader.search).should('exist');
      cy.get(utils.mHeader.agendas).should('exist');
      cy.get(utils.mHeader.cases).should('exist');

      cy.get(utils.mHeader.publications).should('not.exist');
      cy.get(utils.mHeader.signatures).should('not.exist');
      cy.get(utils.mHeader.newsletters).should('not.exist');
      cy.get(utils.mHeader.settings).should('not.exist');
    });
  });
  context('Profile rights checks for agendas/agenda routes', () => {
    // setup for this context -> see profile-admin.spec context

    const agendaOpenLink = 'vergadering/6374F696D9A98BD0A2288559/agenda/6374F699D9A98BD0A228855D/agendapunten';
    const agendaReleasedLink = 'vergadering/6374FA85D9A98BD0A2288576/agenda/6374FA87D9A98BD0A228857A/agendapunten';
    const agendaClosedLink = '/vergadering/5DD7CDA58C70A70008000001/agenda/5DD7CDA58C70A70008000002/agendapunten';

    // agendaitems op open agenda
    const subcaseTitleShort1 = 'Cypress test: profile rights - subcase 1 no decision docs';
    const agendaitemLinkOnOpen1 = 'vergadering/6374F696D9A98BD0A2288559/agenda/6374F699D9A98BD0A228855D/agendapunten/6374F6B1D9A98BD0A2288564';
    const subcaseTitleShort2 = 'Cypress test: profile rights - subcase 2 with decision docs';

    // agendaitems op released agenda
    const subcaseTitleShort3 = 'Cypress test: profile rights - subcase 1 released no decision docs';
    const subcaseTitleShort4 = 'Cypress test: profile rights - subcase 2 released with decision docs';

    it('check agendas route', () => {
      cy.get(route.agendas.title);
      cy.get(route.agendas.action.newMeeting).should('not.exist');
    });

    it('check agenda route on open agenda', () => {
      cy.visitAgendaWithLink(agendaOpenLink);

      // Main view - Tabs
      cy.get(agenda.agendaTabs.tabs).contains('Overzicht');
      cy.get(agenda.agendaTabs.tabs).contains('Detail');
      cy.get(agenda.agendaTabs.tabs).contains('Documenten');

      // Main view - Side Nav (left)
      cy.agendaNameExists('A', false);
      cy.get(agenda.agendaSideNav.agendaName).contains('Ontwerpagenda B')
        .should('not.exist');

      // Main view - Agenda actions
      cy.get(agenda.agendaVersionActions.optionsDropdown).should('not.exist');
      // Main view - Actions
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments); // TODO-BUG should this button exist when no documents have been released
      cy.get(agenda.agendaActions.toggleEditingMeeting).should('not.exist');
      cy.get(agenda.agendaActions.approveAllAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.releaseDecisions).should('not.exist');
      cy.get(agenda.agendaActions.planReleaseDocuments).should('not.exist');
      cy.get(agenda.agendaActions.publishToWeb).should('not.exist');
      cy.get(agenda.agendaActions.unpublishFromWeb).should('not.exist');

      // Main view - Search
      cy.get(agenda.agendaitemSearch.input);

      // Overview Tab - General actions
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaOverview.formallyOkEdit).should('not.exist');
      cy.get(agenda.agendaOverviewItem.dragging).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveUp).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveDown).should('not.exist');

      // Detail Tab - tabs
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.caseTab);
      cy.get(agenda.agendaitemNav.documentsTab);
      cy.get(agenda.agendaitemNav.decisionTab).should('not.exist');
      cy.get(agenda.agendaitemNav.newsletterTab).should('not.exist');
      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.decisionTab).should('not.exist');
      cy.get(agenda.agendaitemNav.newsletterTab).should('not.exist');

      // Detail Tab - Case tab
      cy.get(agenda.agendaitemControls.actions).should('not.exist');
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
      cy.get(agenda.agendaitemTitlesView.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');

      // Detail Tab - Document tab (no docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort2);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab (with docs, but not propagated internally yet)
      cy.openAgendaitemDocumentTab(subcaseTitleShort1);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab - Document Card
      cy.get(document.accessLevelPill.pill).should('not.exist');
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.pubLink).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).should('not.exist');
    });

    it('check agenda route on closed agenda', () => {
      cy.visitAgendaWithLink(agendaClosedLink);

      // Main view - Agenda actions
      cy.get(agenda.agendaVersionActions.optionsDropdown).should('not.exist');
      // Main view - Actions
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments);
      cy.get(agenda.agendaActions.toggleEditingMeeting).should('not.exist');
      cy.get(agenda.agendaActions.approveAllAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.releaseDecisions).should('not.exist');
      cy.get(agenda.agendaActions.planReleaseDocuments).should('not.exist');
      cy.get(agenda.agendaActions.publishToWeb).should('not.exist');
      cy.get(agenda.agendaActions.unpublishFromWeb).should('not.exist');

      // The rest of the agenda should be the same regardless of released statussen. (for now)
      // The only thing that changes is the visibility of decisions/documents but that is for a propagation test
    });

    it('check agenda route on fully released agenda', () => {
      // Note: not everything is tested again to avoid some needless repetition
      cy.visitAgendaWithLink(agendaReleasedLink);

      // Main view - Agenda actions
      cy.get(agenda.agendaVersionActions.optionsDropdown).should('not.exist');

      // Main view - Actions
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments);
      cy.get(agenda.agendaActions.toggleEditingMeeting).should('not.exist');
      cy.get(agenda.agendaActions.approveAllAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.releaseDecisions).should('not.exist');
      cy.get(agenda.agendaActions.planReleaseDocuments).should('not.exist');
      cy.get(agenda.agendaActions.publishToWeb).should('not.exist');
      cy.get(agenda.agendaActions.unpublishFromWeb).should('not.exist');

      // Main view - Search
      cy.get(agenda.agendaitemSearch.input);

      // Overview Tab - General actions
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaOverview.formallyOkEdit).should('not.exist');
      cy.get(agenda.agendaOverviewItem.dragging).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveUp).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveDown).should('not.exist');

      // Detail Tab - tabs
      cy.openDetailOfAgendaitem(subcaseTitleShort3);
      cy.get(agenda.agendaitemNav.caseTab);
      cy.get(agenda.agendaitemNav.documentsTab);
      cy.get(agenda.agendaitemNav.decisionTab);
      cy.get(agenda.agendaitemNav.newsletterTab).should('not.exist');
      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.newsletterTab);

      // Detail Tab - Case tab
      cy.get(agenda.agendaitemControls.actions).should('not.exist');
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
      cy.get(agenda.agendaitemTitlesView.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');

      // Detail Tab - Document tab (no docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort4);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab (with docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort3);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');

      // Detail Tab - Decisions tab (no decision doc)
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit).should('not.exist');
      cy.get(agenda.agendaitemDecision.create).should('not.exist');

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.create).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).should('not.exist');
    });


    it('check if agenda details tabs can be accessed even if button is absent', () => {
      // If the tab is not displayed, you should not be able to get to it.
      // TODO-bug
      // !This fails because you can go to the address and not get rerouted.
      cy.visitAgendaWithLink(agendaitemLinkOnOpen1);
      cy.get(agenda.agendaitemNav.decisionTab).should('not.exist');
      // TODO-bug navigating to decisions from non-editor actually throws error
      // cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/beslissingen`);
      // cy.get(agenda.agendaitemNav.activeTab).contains('Dossier');
      cy.get(agenda.agendaitemNav.newsletterTab).should('not.exist');
      cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/kort-bestek`);
      // cy.get(agenda.agendaitemNav.activeTab).contains('Dossier');
    });

    it('check agenda documents', () => {
      // There should be no difference since these docs are not blocked behind a release
      // Open agenda
      // Documents Tab (with doc)
      cy.visitAgendaWithLink(agendaOpenLink);
      cy.clickReverseTab('Documenten');
      cy.get(route.agendaDocuments.addDocuments).should('not.exist');
      cy.get(route.agendaDocuments.batchEdit).should('not.exist');

      // Documents Tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');

      // Fully released agenda
      // Documents Tab (with doc)
      cy.visitAgendaWithLink(agendaReleasedLink);
      cy.clickReverseTab('Documenten');
      cy.get(route.agendaDocuments.addDocuments).should('not.exist');
      cy.get(route.agendaDocuments.batchEdit).should('not.exist');

      // Documents Tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).should('not.exist');
    });
  });

  context('Profile rights checks for kort-bestek routes', () => {
    it('check kort bestek general view tabs', () => {
      cy.visit('vergadering/6374F696D9A98BD0A2288559/kort-bestek');
      // no tabs visible, but using address works
      cy.get(newsletter.newsletterHeaderOverview.title);
      cy.get(newsletter.newsletterHeaderOverview.index).should('not.exist');
      cy.get(newsletter.newsletterHeaderOverview.printDraft).should('not.exist');
      cy.get(newsletter.newsletterHeaderOverview.print).should('not.exist');
      cy.get(newsletter.newsletterHeaderOverview.notaUpdates).should('not.exist');
    });

    context('check kort bestek route on open agenda', () => {
      const kortBestekLinkOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek';
      // const kladViewOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek/afdrukken?klad=true';
      // const definitiefViewOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek/afdrukken';
      // const notaUpdatesViewOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek/nota-updates';

      it('check zebra view', () => {
        cy.visit(kortBestekLinkOpenAgenda);
        cy.get(auk.loader).should('not.exist');

        // check edit rights
        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.buttonToolbar.edit)
          .should('not.exist');

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.buttonToolbar.edit)
          .should('not.exist');

        // check actions
        // TODO, actions is available but without options, which throws an error in the frontend
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
        //   .children(appuniversum.button)
        //   .click();
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      });

      // views are broken because newsItems are not released yet
      // it('check klad view', () => {
      //   cy.visit(kladViewOpenAgenda);
      //   cy.get(newsletter.newsletterMeeting.title);

      //   // check edit
      //   cy.get(newsletter.newsletterPrint.edit).should('not.exist');

      //   // check actions
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      //     .children(appuniversum.button)
      //     .click();
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      // });

      // it('check definitief view', () => {
      //   // setup: make sure there is a nota to check in definitief view
      //   cy.visit(definitiefViewOpenAgenda);
      //   cy.get(newsletter.newsletterMeeting.title);

      //   // check actions
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      //     .children(appuniversum.button)
      //     .click();
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');

      //   // check edit doesn't exist
      //   cy.get(newsletter.newsletterPrint.edit).should('not.exist');
      // });
    });

    context('check kort bestek route on released agenda', () => {
      const kortBestekLinkReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek';
      const kladViewReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek/afdrukken?klad=true';
      const definitiefViewReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek/afdrukken';
      // const notaUpdatesViewReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek/nota-updates';

      it('check zebra view', () => {
        cy.visit(kortBestekLinkReleasedAgenda);
        cy.get(auk.loader).should('not.exist');

        // check edit rights
        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.buttonToolbar.edit)
          .should('not.exist');

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.buttonToolbar.edit)
          .should('not.exist');

        // check actions
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
        //   .children(appuniversum.button)
        //   .click();
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      });

      it('check klad view', () => {
        cy.visit(kladViewReleasedAgenda);
        cy.get(newsletter.newsletterMeeting.title);

        // check edit
        cy.get(newsletter.newsletterPrint.edit).should('not.exist');

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      });

      it('check definitief view', () => {
        // setup: make sure there is a nota to check in definitief view
        cy.visit(definitiefViewReleasedAgenda);
        cy.get(newsletter.newsletterMeeting.title);

        // check edit doesn't exist
        cy.get(newsletter.newsletterPrint.edit).should('not.exist');

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      });
    });

    context('check kort bestek route on closed agenda', () => {
      const zebraViewClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek';
      // const kladViewClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek/afdrukken?klad=true';
      // const definitiefViewClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek/afdrukken';
      // const notaUpdatesViewClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek/nota-updates';

      it('check zebra view', () => {
        cy.visit(zebraViewClosedAgenda);
        cy.get(auk.loader).should('not.exist');

        // check edit rights
        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.buttonToolbar.edit)
          .should('not.exist');

        // check actions
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
        //   .children(appuniversum.button)
        //   .click();
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        // cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      });
      // views are broken because newsItems are not released yet
      // it('check klad view', () => {
      //   cy.visit(kladViewClosedAgenda);
      //   cy.get(newsletter.newsletterMeeting.title);

      //   // check edit
      //   cy.get(newsletter.newsletterPrint.edit).should('not.exist');

      //   // check actions
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      //     .children(appuniversum.button)
      //     .click();
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      // });

      // it('check definitief view', () => {
      //   cy.visit(definitiefViewClosedAgenda);
      //   cy.get(newsletter.newsletterMeeting.title);

      //   // check actions
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      //     .children(appuniversum.button)
      //     .click();
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
      //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');

      //   // check edit doesn't exist
      //   cy.get(newsletter.newsletterPrint.edit).should('not.exist');
      // });
    });
  });
});
