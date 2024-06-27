/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
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
    cy.url().should('include', 'kort-bestek'); // make sure we transitioned to default route
  });

  context('M-header toolbar tests', () => {
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
      cy.get(newsletter.newsletterHeader.overview);
      cy.get(newsletter.newsletterHeader.search);
      cy.url().should('include', 'kort-bestek');

      cy.get(utils.mHeader.agendas).click();
      cy.get(route.agendas.title).should('exist');

      cy.get(utils.mHeader.newsletters).click();
      cy.get(newsletter.newsletterHeader.title).should('exist');
      cy.get(newsletter.newsletterHeader.overview);
      cy.get(newsletter.newsletterHeader.search);
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
      cy.get(route.search.trigger).should('exist');
      cy.url().should('include', '/zoeken');
    });

    it('Should switch to newsletter tab when newsletter is clicked', () => {
      cy.get(utils.mHeader.newsletters).click();
      cy.get(newsletter.newsletterHeader.title).should('exist');
      cy.url().should('include', '/kort-bestek');
    });
  });

  context('Profile rights checks for agendas/agenda routes', () => {
    // setup for this context -> see profile-admin.spec context
    const digitalAgendaLinkB = 'vergadering/6639E50648A2200932C2E206/agenda/aab25440-0c52-11ef-8806-3dee87cfd9c2/agendapunten';
    const digitalAgendaNoMinutesLinkB = 'vergadering/6639E55748A2200932C2E221/agenda/c758ec80-0c52-11ef-8806-3dee87cfd9c2/agendapunten';
    const subcaseTitleShortDigital1 = 'Cypress test: profile rights - subcase 1 no decision - 1715070204';
    const subcaseTitleShortDigital2 = 'Cypress test: profile rights - subcase 2 with decision - 1715070204';

    const agendaOpenLink = 'vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten';
    const agendaReleasedLink = 'vergadering/6374FA85D9A98BD0A2288576/agenda/6374FA87D9A98BD0A228857A/agendapunten';
    const agendaClosedLink = '/vergadering/5DD7CDA58C70A70008000001/agenda/5DD7CDA58C70A70008000002/agendapunten';

    // agendaitems op open agenda
    const subcaseTitleShort1 = 'Cypress test: profile rights - subcase 1 no decision docs';
    const agendaitemLinkOnOpen1 = 'vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten/3e04f510-65bd-11ed-a5a5-db2587a216a4';
    const subcaseTitleShort2 = 'Cypress test: profile rights - subcase 2 with decision docs';

    // agendaitems op released agenda
    const subcaseTitleShort3 = 'Cypress test: profile rights - subcase 1 released no decision docs';
    const subcaseTitleShort4 = 'Cypress test: profile rights - subcase 2 released with decision docs';

    it('check agendas route', () => {
      cy.visit('/overzicht'); // ovrb starts on publication route by default
      cy.get(route.agendas.title);
      cy.get(route.agendas.action.newMeeting).should('not.exist');
    });

    it('check agenda route on open digital agenda', () => {
      cy.visitAgendaWithLink(digitalAgendaLinkB);

      // Main view - Tabs
      cy.get(agenda.agendaTabs.tabs).contains('Notulen');

      // Main view - Actions
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.downloadDecisions);
      cy.get(agenda.agendaActions.generateSignedDecisionsBundle).should('not.exist');
      cy.get(agenda.agendaActions.markDecisionsForSigning).should('not.exist');
      cy.clickReverseTab('Overzicht'); // close dropdown

      // Detail Tab - Decisions tab (no decision doc)
      cy.openDetailOfAgendaitem(subcaseTitleShortDigital1);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit).should('not.exist');
      cy.get(agenda.agendaitemDecision.create).should('not.exist'); // digital signing
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShortDigital2);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(document.accessLevelPill.pill);
      cy.get(agenda.agendaitemDecision.create).should('not.exist');
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');

      // Detail Tab - Decisions tab - overview
      cy.get(agenda.agendaitemDecision.edit.annotation).should('not.exist');
      cy.get(agenda.agendaitemDecision.edit.concern).should('not.exist');
      cy.get(agenda.agendaitemDecision.edit.treatment).should('not.exist');

      // Minutes Tab - with minutes - Document Card
      cy.get(agenda.agendaTabs.tabs).contains('Notulen')
        .click();
      cy.get(appuniversum.loader).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(appuniversum.loader).should('not.exist');
      cy.get(route.agendaMinutes.currentPieceView).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Minutes Tab - with minutes - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');

      // Minutes Tab - no minutes
      cy.visitAgendaWithLink(digitalAgendaNoMinutesLinkB);
      cy.get(agenda.agendaTabs.tabs).contains('Notulen')
        .click();
      cy.get(appuniversum.loader).should('not.exist');
      cy.get(appuniversum.alert.container).contains('Er zijn nog geen notulen voor deze vergadering');
      cy.get(route.agendaMinutes.createEdit).should('not.exist');
    });

    it('check agenda route on open agenda', () => {
      cy.visitAgendaWithLink(agendaOpenLink);

      // Main view - Tabs
      cy.get(agenda.agendaTabs.tabs).contains('Overzicht');
      cy.get(agenda.agendaTabs.tabs).contains('Detail');
      cy.get(agenda.agendaTabs.tabs).contains('Documenten');

      // Main view - Side Nav (left)
      cy.agendaNameExists('A', false);
      cy.agendaNameExists('B');

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
      cy.get(agenda.agendaitemSearch.formallyReorderEdit).should('not.exist');
      cy.get(agenda.agendaOverviewItem.dragging).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveUp).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveDown).should('not.exist');

      // Detail Tab - tabs
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.caseTab);
      cy.get(agenda.agendaitemNav.documentsTab);
      cy.get(agenda.agendaitemNav.decisionTab);
      cy.get(agenda.agendaitemNav.newsletterTab);

      // Detail Tab - Case tab
      cy.get(agenda.agendaitemControls.actions).should('not.exist'); // TODO-profile should KB see any actions?
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
      cy.get(agenda.agendaitemTitlesView.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');

      // Detail Tab - Document tab (no docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort2);
      cy.get(appuniversum.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab (with docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort1);
      cy.get(appuniversum.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.pubLink).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Document tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');

      // Detail Tab - Decisions tab (no decision doc)
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit).should('not.exist');
      cy.get(agenda.agendaitemDecision.create).should('not.exist'); // pre digital signing
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.create).should('not.exist'); // pre digital signing
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');

      // Detail Tab - Newsletter tab (with newsletter)
      cy.openAgendaitemKortBestekTab(subcaseTitleShort2);
      cy.get(newsletter.newsItem.create).should('not.exist');
      cy.get(newsletter.newsItem.fullscreenEdit);
      cy.get(newsletter.newsItem.edit);

      // Detail Tab - Newsletter tab (no newsletter)
      cy.openAgendaitemKortBestekTab(subcaseTitleShort1);
      cy.get(newsletter.newsItem.create);
      cy.get(newsletter.newsItem.fullscreenEdit).should('not.exist');
      cy.get(newsletter.newsItem.edit).should('not.exist');
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
      // TODO-profileRights planReleaseDocuments should not exist for KB, not their responsibility
      cy.get(agenda.agendaActions.planReleaseDocuments);
      cy.get(agenda.agendaActions.publishToWeb).should('not.exist');
      // TODO-bug testdata has documents released (from a migration) but only externally
      cy.get(agenda.agendaActions.unpublishFromWeb);

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
      // TODO-profileRights KB should only be able to republish newsitems (from their views) and not retract documents
      cy.get(agenda.agendaActions.publishToWeb); // re-publish is same button
      cy.get(agenda.agendaActions.unpublishFromWeb);

      // Main view - Search
      cy.get(agenda.agendaitemSearch.input);

      // Overview Tab - General actions
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaitemSearch.formallyReorderEdit).should('not.exist');
      cy.get(agenda.agendaOverviewItem.dragging).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveUp).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveDown).should('not.exist');

      // Detail Tab - tabs
      cy.openDetailOfAgendaitem(subcaseTitleShort3);
      cy.get(agenda.agendaitemNav.caseTab);
      cy.get(agenda.agendaitemNav.documentsTab);
      cy.get(agenda.agendaitemNav.decisionTab);
      cy.get(agenda.agendaitemNav.newsletterTab);

      // Detail Tab - Case tab
      cy.get(agenda.agendaitemControls.actions).should('not.exist');
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
      cy.get(agenda.agendaitemTitlesView.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');

      // Detail Tab - Document tab (no docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort4);
      cy.get(appuniversum.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab (with docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort3);
      cy.get(appuniversum.loader).should('not.exist');
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
      cy.get(agenda.agendaitemDecision.create).should('not.exist'); // pre digital signing
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.create).should('not.exist'); // pre digital signing
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');

      // Detail Tab - Newsletter tab (with newsletter)
      cy.openAgendaitemKortBestekTab(subcaseTitleShort4);
      cy.get(newsletter.newsItem.create).should('not.exist');
      cy.get(newsletter.newsItem.fullscreenEdit);
      cy.get(newsletter.newsItem.edit);

      // Detail Tab - Newsletter tab (no newsletter)
      cy.openAgendaitemKortBestekTab(subcaseTitleShort3);
      cy.get(newsletter.newsItem.create);
      cy.get(newsletter.newsItem.fullscreenEdit).should('not.exist');
      cy.get(newsletter.newsItem.edit).should('not.exist');
    });


    it.skip('check if agenda details tabs can be accessed even if button is absent', () => {
      // If the tab is not displayed, you should not be able to get to it.
      cy.visitAgendaWithLink(agendaitemLinkOnOpen1);

      cy.get(agenda.agendaitemNav.decisionTab);
      cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/beslissingen`);
      // !This fails because you can go to the address and not get rerouted.
      // cy.get(agenda.agendaitemNav.activeTab).contains('Dossier');;
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
      // TODO-profileRights should some editors be blocked from editing after a full release?
      cy.visitAgendaWithLink(agendaReleasedLink);
      cy.clickReverseTab('Documenten');
      cy.get(route.agendaDocuments.addDocuments).should('not.exist');
      cy.get(route.agendaDocuments.batchEdit).should('not.exist');

      // Documents Tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Documents Tab - Document Card - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');
    });
  });

  context('Profile rights checks for kort-bestek routes', () => {
    it('check kort bestek route', () => {
      cy.visit('/kort-bestek');
      cy.get(newsletter.newsletterHeader.overview);
      cy.get(newsletter.newsletterHeader.search);
    });

    it('check kort bestek general view tabs', () => {
      cy.visit('vergadering/6374F696D9A98BD0A2288559/kort-bestek');
      cy.get(newsletter.newsletterHeaderOverview.index);
      cy.get(newsletter.newsletterHeaderOverview.printDraft);
      cy.get(newsletter.newsletterHeaderOverview.print);
      cy.get(newsletter.newsletterHeaderOverview.notaUpdates);
    });

    context('check kort bestek route on open agenda', () => {
      const kortBestekLinkOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek';
      const kladViewOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek/afdrukken?klad=true';
      const definitiefViewOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek/afdrukken';
      const notaUpdatesViewOpenAgenda = 'vergadering/6374F696D9A98BD0A2288559/kort-bestek/nota-updates';

      it('check zebra view', () => {
        cy.visit(kortBestekLinkOpenAgenda);
        cy.get(appuniversum.loader).should('not.exist');

        // check edit rights
        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.buttonToolbar.edit);

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('not.be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.buttonToolbar.edit);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      });

      it('check klad view', () => {
        cy.visit(kladViewOpenAgenda);

        // check edit
        cy.get(newsletter.newsletterPrint.edit);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');
      });

      it('check definitief view', () => {
        // setup: make sure there is a nota to check in definitief view
        cy.visit(kortBestekLinkOpenAgenda);
        cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
        cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(1)
          .parent()
          .click()
          .wait('@patchNewsItem');

        cy.visit(definitiefViewOpenAgenda);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis).should('not.exist');

        // check edit doesn't exist
        cy.get(newsletter.newsletterPrint.edit).should('not.exist');

        // undo setup in case it matters for other tests
        cy.visit(kortBestekLinkOpenAgenda);
        cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
        cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(1)
          .parent()
          .click()
          .wait('@patchNewsItem');
      });

      it('check update notas view', () => {
        cy.visit(notaUpdatesViewOpenAgenda);
        cy.get(route.notaUpdates.row.showPieceViewer);
        cy.get(route.notaUpdates.row.goToAgendaitemDocuments);
      });
    });

    context('check kort bestek route on released agenda', () => {
      const kortBestekLinkReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek';
      const kladViewReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek/afdrukken?klad=true';
      const definitiefViewReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek/afdrukken';
      // const notaUpdatesViewReleasedAgenda = 'vergadering/6374FA85D9A98BD0A2288576/kort-bestek/nota-updates';

      it('check zebra view', () => {
        cy.visit(kortBestekLinkReleasedAgenda);
        cy.get(appuniversum.loader).should('not.exist');

        // check edit rights
        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(0)
          .find(newsletter.buttonToolbar.edit);

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.tableRow.inNewsletterCheckbox)
          .should('not.be.disabled');

        cy.get(newsletter.tableRow.newsletterRow).eq(1)
          .find(newsletter.buttonToolbar.edit);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis);
      });

      it('check klad view', () => {
        cy.visit(kladViewReleasedAgenda);

        // check edit
        cy.get(newsletter.newsletterPrint.edit);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis);
      });

      it('check definitief view', () => {
        // setup: make sure there is a nota to check in definitief view
        cy.visit(kortBestekLinkReleasedAgenda);
        cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
        cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(1)
          .parent()
          .click()
          .wait('@patchNewsItem');

        cy.visit(definitiefViewReleasedAgenda);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis);

        // check edit doesn't exist
        cy.get(newsletter.newsletterPrint.edit).should('not.exist');

        // undo setup in case it matters for other tests
        cy.visit(kortBestekLinkReleasedAgenda);
        cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
        cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(1)
          .parent()
          .click()
          .wait('@patchNewsItem');
      });
    });

    context('check kort bestek route on closed agenda', () => {
      const kortBestekLinkClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek';
      const kladViewClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek/afdrukken?klad=true';
      const definitiefViewClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek/afdrukken';
      // const notaUpdatesViewClosedAgenda = 'vergadering/5DD7CDA58C70A70008000001/kort-bestek/nota-updates';

      it('check klad view', () => {
        cy.visit(kladViewClosedAgenda);

        // check edit
        cy.get(newsletter.newsletterPrint.edit);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis);
      });

      it('check definitief view', () => {
        // setup: make sure there is a nota to check in definitief view
        cy.visit(kortBestekLinkClosedAgenda);
        cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
        cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(0)
          .parent()
          .click()
          .wait('@patchNewsItem');

        cy.visit(definitiefViewClosedAgenda);

        // check actions
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishAll);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishBelga);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishThemis);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.print);
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.deleteCampaign).should('not.exist');
        cy.get(newsletter.newsletterHeaderOverview.newsletterActions.unpublishThemis);

        // check edit doesn't exist
        cy.get(newsletter.newsletterPrint.edit).should('not.exist');

        // undo setup in case it matters for other tests
        cy.visit(kortBestekLinkClosedAgenda);
        cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
        cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(0)
          .parent()
          .click()
          .wait('@patchNewsItem');
      });
    });
  });

  context('Profile rights checks for case routes', () => {
    // const decisionNotSet = 'Nog geen beslissing ingesteld';
    const decisionApproved = 'Goedgekeurd';
    const decisionPostponed = 'Uitgesteld';
    it('check cases route', () => {
      cy.visit('dossiers?aantal=2');

      cy.get(cases.casesHeader.addCase).should('not.exist');
      cy.get(route.casesOverview.row.goToCase);
    });

    it('check subcases/overview route', () => {
      // actions on open agenda no decisions
      cy.visitCaseWithLink('dossiers/6374F284D9A98BD0A2288538/deeldossiers/6374F28BD9A98BD0A2288539');

      // overview header
      cy.get(cases.subcaseOverviewHeader.publicationFlowLink);
      cy.get(cases.subcaseOverviewHeader.optionsDropdown).should('not.exist');
      cy.get(cases.subcaseOverviewHeader.openAddSubcase).should('not.exist');

      // sidebar
      // * 16/03/24 this has changed > approved should not show before decisions are released?
      cy.get(agenda.decisionResultPill.pill).contains(decisionApproved);

      // subcase header
      cy.get(cases.subcaseHeader.actionsDropdown).should('not.exist');

      // subcase - top panels
      cy.get(cases.subcaseDescription.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');

      // subcase - document panel
      cy.get(document.documentCard.name.value).contains('VR 2022 2204 DOC.0001-5')
        .parent()
        .find(document.documentCard.primarySourceLink)
        .invoke('attr', 'href')
        .should('contain', encodeURIComponent('VR 2022 2204 DOC.0001-5.docx'));
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.accessLevelPill.edit).should('not.exist');

      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // subcase - document panel - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');
      cy.get(route.subcase.add).should('not.exist');

      // subcase - linked document panel
      // none yet
      cy.get(document.linkedDocumentsPanel.add).should('not.exist');


      // actions on released agenda no decisions
      cy.visitCaseWithLink('dossiers/6374F2D6D9A98BD0A2288549/deeldossiers/6374F2DCD9A98BD0A228854A');

      // overview header
      cy.get(cases.subcaseOverviewHeader.publicationFlowLink).should('not.exist');
      cy.get(cases.subcaseOverviewHeader.optionsDropdown).should('not.exist');
      cy.get(cases.subcaseOverviewHeader.openAddSubcase).should('not.exist');

      // sidebar
      cy.get(agenda.decisionResultPill.pill).contains(decisionApproved);

      // subcase header
      cy.get(cases.subcaseHeader.actionsDropdown).should('not.exist');

      // subcase - top panels
      cy.get(cases.subcaseDescription.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');

      // subcase - document panel
      cy.get(document.documentCard.name.value).contains('VR 2022 2304 DOC.0001-5')
        .parent()
        .find(document.documentCard.primarySourceLink)
        .invoke('attr', 'href')
        .should('contain', encodeURIComponent('VR 2022 2304 DOC.0001-5.docx'));
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.accessLevelPill.edit).should('not.exist');

      // TODO released agenda docs has no previous version, setup?
      // cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
      //   .should('not.be.disabled')
      //   .click();
      // // Detail Tab - Decisions tab - Document Card history
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.pill);
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.edit);
      cy.get(route.subcase.add).should('not.exist');

      // subcase - linked document panel
      // none yet
      cy.get(document.linkedDocumentsPanel.add).should('not.exist');


      // actions on closed agenda no decisions
      cy.visitCaseWithLink('dossiers/E14FB514-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/5DD7CDCE8C70A70008000006');

      // overview header
      cy.get(cases.subcaseOverviewHeader.publicationFlowLink).should('not.exist');
      cy.get(cases.subcaseOverviewHeader.optionsDropdown).should('not.exist');
      cy.get(cases.subcaseOverviewHeader.openAddSubcase).should('not.exist');

      // sidebar
      cy.get(agenda.decisionResultPill.pill).contains(decisionPostponed);

      // subcase header
      cy.get(cases.subcaseHeader.actionsDropdown).should('not.exist');

      // subcase - top panels
      cy.get(cases.subcaseDescription.edit).should('not.exist');
      cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
      cy.get(utils.governmentAreasPanel.edit).should('not.exist');

      // subcase - document panel
      // TODO closed agenda docs has no docs, setup?
      // cy.get(document.documentCard.name.value).contains('***')
      //   .parent()
      //   .find(document.documentCard.primarySourceLink)
      //   .invoke('attr', 'href')
      //   .should('contain', 'test.docx');
      // cy.get(document.documentCard.actions).eq(0)
      //   .click();
      // cy.get(document.documentCard.uploadPiece);
      // cy.get(document.documentCard.editPiece);
      // cy.get(document.documentCard.signMarking).should('not.exist');
      // cy.get(document.documentCard.delete);
      // cy.get(document.accessLevelPill.edit);
      // cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
      //   .should('not.be.disabled')
      //   .click();
      // // Detail Tab - Decisions tab - Document Card history
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.pill);
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.edit);
      cy.get(route.subcase.add).should('not.exist');

      // subcase - linked document panel
      // none yet
      cy.get(document.linkedDocumentsPanel.add).should('not.exist');
    });
  });

  context('Profile rights checks for document route', () => {
    it('check document view', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A');
      cy.get(document.documentPreview.title).contains('VR 2022 2204 DOC.0001-1BIS');
      cy.get(document.documentPreview.downloadLink);
      // cy.get(document.documentView.pdfView);
    });

    it('check switching to all tabs', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A');

      cy.get(document.documentPreviewSidebar.tabs.versions).click();
      cy.url().should('include', '?tab=Versies');

      cy.get(document.documentPreviewSidebar.tabs.details).click();
      cy.url().should('not.include', '?tab=Versies');

      cy.get(document.documentPreviewSidebar.tabs.signatures).should('not.exist');
    });

    it('check details tab', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A');

      cy.get(document.previewDetailsTab.documentType);
      cy.get(document.previewDetailsTab.delete).should('not.exist'); // BIS version
      cy.get(document.previewDetailsTab.edit).should('not.exist');
      cy.get(document.previewDetailsTab.sourceFile);
      // switch version
      cy.intercept('GET', '/pieces/*/file').as('getFileType');
      cy.get(document.documentPreviewSidebar.tabs.versions).click()
        .wait('@getFileType');
      cy.get(document.previewVersionCard.name).contains('VR 2022 2204 DOC.0001-1.docx')
        .parents(document.previewVersionCard.container)
        .click();
      // check again
      cy.get(document.documentPreviewSidebar.tabs.details).click();
      cy.get(document.previewDetailsTab.documentType);
      cy.get(document.previewDetailsTab.delete).should('not.exist'); // previous version
      cy.get(document.previewDetailsTab.edit).should('not.exist');
      // * remove signed piece not tested yet

      // confidential file
      cy.visit('document/6374F2FBD9A98BD0A2288552');
      cy.get(document.documentPreview.downloadLink);
      cy.get(document.previewDetailsTab.delete).should('not.exist');
      cy.get(document.previewDetailsTab.edit).should('not.exist');
      cy.get(appuniversum.alert.message).should('not.exist');
      cy.get(document.previewDetailsTab.sourceFile);
      cy.get(document.previewDetailsTab.sourceFileDownload);
    });

    it('check version tab', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A?tab=Versies');
      cy.get(document.previewVersionCard.container).contains('VR 2022 2204 DOC.0001');
      cy.get(document.previewVersionCard.container).contains('Geüpload op');
      cy.get(document.previewVersionCard.container).contains('Rechten gewijzigd op');
    });
  });

  context('Profile rights checks for search routes', () => {
    it('check search/all-types route', () => {
      cy.visit('zoeken/alle-types');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      cy.get(route.search.ministerFilterContainer);
    });

    it('check search/cases route', () => {
      cy.visit('zoeken/dossiers');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      cy.get(route.search.ministerFilterContainer);
      cy.get(route.searchCases.removedCasesList).should('not.exist');
      cy.get(route.searchConfidentialOnly.checkbox);
    });

    it('check search/agendaitems route', () => {
      cy.visit('zoeken/agendapunten');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      cy.get(route.search.ministerFilterContainer);
      cy.get(route.searchAgendaitems.filter.type);
      cy.get(route.searchAgendaitems.filter.finalAgenda);
    });

    it('check search/documents route', () => {
      cy.visit('zoeken/documenten');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      cy.get(route.search.ministerFilterContainer);
      cy.get(route.searchConfidentialOnly.checkbox);
      cy.get(route.searchDocumentTypeFilter.list);
    });

    it('check search/decisions route', () => {
      cy.visit('zoeken/beslissingen');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      cy.get(route.search.ministerFilterContainer);
      cy.get(route.searchDecisions.filterContainer);
    });

    it('check search/newsletters route', () => {
      cy.visit('zoeken/kort-bestek');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      cy.get(route.search.ministerFilterContainer);
    });
  });
});
