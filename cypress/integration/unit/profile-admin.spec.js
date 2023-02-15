/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import publication from '../../selectors/publication.selectors';
import route from '../../selectors/route.selectors';
import settings from '../../selectors/settings.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as Admin user', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  context('M-header toolbar tests', () => {
    it('Should have publications, meeting, Case, Newsletter, search and Settings in toolbar', () => {
      cy.get(utils.mHeader.publications).should('exist');
      cy.get(utils.mHeader.agendas).should('exist');
      cy.get(utils.mHeader.cases).should('exist');
      cy.get(utils.mHeader.newsletters).should('exist');
      cy.get(utils.mHeader.search).should('exist');
      cy.get(utils.mHeader.signatures).should('exist');
      cy.get(utils.mHeader.settings).should('exist');
    });

    it('Should switch to Publications tab when publications is clicked', () => {
      cy.get(utils.mHeader.publications).click();
      cy.get(publication.publicationsIndex.title).should('exist');
      cy.url().should('include', 'publicaties');
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

    it('Should switch to newsletter tab when newsletter is clicked', () => {
      cy.get(utils.mHeader.newsletters).click();
      cy.get(newsletter.newsletterHeader.title).should('exist');
      cy.url().should('include', '/kort-bestek');
    });

    it('Should switch to search tab when search is clicked', () => {
      cy.get(utils.mHeader.search).click();
      cy.get(route.search.trigger).should('exist');
      cy.url().should('include', '/zoeken');
    });

    it('Should switch to settings tab when settings is clicked', () => {
      cy.get(utils.mHeader.settings).click();
      cy.get(settings.settings.generalSettings).should('exist');
      cy.get(settings.settings.manageMinisters).should('exist');
      cy.get(settings.settings.manageUsers).should('exist');
      cy.url().should('include', '/instellingen');
    });
  });

  context('Profile rights checks for agendas/agenda routes', () => {
    // setup for this context
    // 1 open agenda B, with a document, nothing released:
    // - 1 approval agendaitem
    // - 1 agendaitem with 5 documents, 1 of each accessLevel (not used yet in test), no decision doc
    // - 1 agendaitem with 0 documents, decision doc
    // 1 closed agenda A, with a document, fully released:
    // - 1 approval agendaitem
    // - 1 agendaitem with 5 documents (1BIS), 1 of each accessLevel (not used yet in test), no decision doc
    // - 1 agendaitem with 0 documents, decision doc (BIS)
    // 1 existing closed agenda A
    // This agenda has documents "published" but decisions and documents have not been released yet.
    // This gives the option to "unpublish" but also "plan document release" and "release decisons". May not be representative to actual work flow.

    const agendaOpenLink = 'vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten';
    const agendaReleasedLink = 'vergadering/6374FA85D9A98BD0A2288576/agenda/6374FA87D9A98BD0A228857A/agendapunten';
    const agendaClosedLink = '/vergadering/5DD7CDA58C70A70008000001/agenda/5DD7CDA58C70A70008000002/agendapunten';
    // const agendaDateOpen = Cypress.dayjs('2022-04-22');
    // const agendaDateReleased = Cypress.dayjs('2022-04-23');
    // const agendaDateReleased = Cypress.dayjs('2020-04-22');

    // agendaitems op open agenda
    const approvalLinkOnOpen = 'vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten/3df64f10-65bd-11ed-a5a5-db2587a216a4';
    const subcaseTitleShort1 = 'Cypress test: profile rights - subcase 1 no decision docs';
    const agendaitemLinkOnOpen1 = 'vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten/3e04f510-65bd-11ed-a5a5-db2587a216a4';
    const subcaseTitleShort2 = 'Cypress test: profile rights - subcase 2 with decision docs';
    // const agendaitemLinkOnOpen2 = 'vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten/3de5ad40-65bd-11ed-a5a5-db2587a216a4';

    // agendaitems op released agenda
    const subcaseTitleShort3 = 'Cypress test: profile rights - subcase 1 released no decision docs';
    // const agendaitemLinkOnReleased1 = 'vergadering/6374FA85D9A98BD0A2288576/agenda/6374FA87D9A98BD0A228857A/agendapunten/6374FA9CD9A98BD0A2288581';
    const subcaseTitleShort4 = 'Cypress test: profile rights - subcase 2 released with decision docs';
    // const agendaitemLinkOnReleased2 = 'vergadering/6374FA85D9A98BD0A2288576/agenda/6374FA87D9A98BD0A228857A/agendapunten/6374FAB4D9A98BD0A2288586';

    it('check agendas route', () => {
      cy.get(route.agendas.title);
      cy.get(route.agendas.action.newMeeting);
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
      // The agenda actions should be admin/kanselarij only so we only test if the button is showing.
      // Some of the options are very dependent on agenda status and are tested elsewhere.
      cy.get(agenda.agendaVersionActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaVersionActions.actions.approveAgenda);
      cy.get(agenda.agendaVersionActions.actions.approveAndCloseAgenda);
      cy.get(agenda.agendaVersionActions.actions.lockAgenda);
      cy.get(agenda.agendaVersionActions.actions.unlockAgenda).should('not.exist');
      cy.get(agenda.agendaVersionActions.actions.deleteAgenda);
      cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion);

      // Main view - Actions
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.addAgendaitems);
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments);
      cy.get(agenda.agendaActions.toggleEditingMeeting);
      cy.get(agenda.agendaActions.approveAllAgendaitems);
      // Also, only some editors should be able to do these actions (might not be implemented yet)
      cy.get(agenda.agendaActions.releaseDecisions).should('not.exist');
      cy.get(agenda.agendaActions.planReleaseDocuments).should('not.exist');
      cy.get(agenda.agendaActions.publishToWeb).should('not.exist');
      cy.get(agenda.agendaActions.unpublishFromWeb).should('not.exist');
      cy.clickReverseTab('Overzicht'); // close dropdown

      // Main view - Search
      cy.get(agenda.agendaitemSearch.input);

      // Overview Tab - General actions
      cy.get(agenda.agendaOverview.formallyOkEdit);

      // Overview Tab - General action - Dragging
      cy.get(agenda.agendaOverviewItem.dragging).should('not.exist');
      cy.get(agenda.agendaOverview.formallyOkEdit).click();
      cy.get(agenda.agendaOverviewItem.dragging);

      // Detail Tab - tabs
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.caseTab);
      cy.get(agenda.agendaitemNav.documentsTab);
      cy.get(agenda.agendaitemNav.decisionTab);
      cy.get(agenda.agendaitemNav.newsletterTab);

      // Detail Tab - Case tab
      cy.get(agenda.agendaitemControls.actions);
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
      cy.get(agenda.agendaitemTitlesView.edit);
      cy.get(mandatee.mandateePanelView.actions.edit);
      cy.get(utils.governmentAreasPanel.edit);

      // Detail Tab - Document tab (no docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort2);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add);

      // Detail Tab - Document tab (with docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort1);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit);
      cy.get(route.agendaitemDocuments.openPublication);
      cy.get(route.agendaitemDocuments.add);

      // Detail Tab - Document tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.pubLink);
      cy.get(document.documentCard.actions)
        .eq(0)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Document tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit);

      // Detail Tab - Decisions tab (no decision doc)
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit);
      cy.get(agenda.agendaitemDecision.uploadFile);

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit);

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
      cy.get(agenda.agendaVersionActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaVersionActions.actions.approveAgenda).should('not.exist');
      cy.get(agenda.agendaVersionActions.actions.approveAndCloseAgenda).should('not.exist');
      cy.get(agenda.agendaVersionActions.actions.lockAgenda).should('not.exist');
      cy.get(agenda.agendaVersionActions.actions.unlockAgenda);
      cy.get(agenda.agendaVersionActions.actions.deleteAgenda);
      cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).should('not.exist');
      // Main view - Actions
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments); // TODO KAS-3696 overheid shouldn't get this button before doc release
      cy.get(agenda.agendaActions.toggleEditingMeeting);
      cy.get(agenda.agendaActions.approveAllAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.releaseDecisions);
      cy.get(agenda.agendaActions.planReleaseDocuments);
      cy.get(agenda.agendaActions.publishToWeb).should('not.exist');
      cy.get(agenda.agendaActions.unpublishFromWeb);

      // The rest of the agenda should be the same regardless of released statussen. (for now)
      // The only thing that changes is the visibility of decisions/documents but that is for a propagation test
    });

    it('check agenda route on fully released agenda', () => {
      // Note: not everything is tested again to avoid some needless repetition
      cy.visitAgendaWithLink(agendaReleasedLink);

      // Main view - Agenda actions
      cy.get(agenda.agendaVersionActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaVersionActions.actions.approveAgenda).should('not.exist');
      cy.get(agenda.agendaVersionActions.actions.approveAndCloseAgenda).should('not.exist');
      cy.get(agenda.agendaVersionActions.actions.lockAgenda).should('not.exist');
      cy.get(agenda.agendaVersionActions.actions.unlockAgenda);
      cy.get(agenda.agendaVersionActions.actions.deleteAgenda);
      cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).should('not.exist');
      // Main view - Actions
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments);
      cy.get(agenda.agendaActions.toggleEditingMeeting);
      cy.get(agenda.agendaActions.approveAllAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.releaseDecisions).should('not.exist');
      cy.get(agenda.agendaActions.planReleaseDocuments).should('not.exist');
      cy.get(agenda.agendaActions.publishToWeb); // re-publish is same button
      cy.get(agenda.agendaActions.unpublishFromWeb);

      // Main view - Search
      cy.get(agenda.agendaitemSearch.input);

      // Overview Tab - General actions
      cy.get(agenda.agendaOverview.formallyOkEdit).should('not.exist');
      cy.get(agenda.agendaOverviewItem.dragging).should('not.exist');

      // Detail Tab - tabs
      cy.openDetailOfAgendaitem(subcaseTitleShort3);
      cy.get(agenda.agendaitemNav.caseTab);
      cy.get(agenda.agendaitemNav.documentsTab);
      cy.get(agenda.agendaitemNav.decisionTab);
      cy.get(agenda.agendaitemNav.newsletterTab);

      // Detail Tab - Case tab
      cy.get(agenda.agendaitemControls.actions).should('not.exist');
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
      cy.get(agenda.agendaitemTitlesView.edit);
      cy.get(mandatee.mandateePanelView.actions.edit);
      cy.get(utils.governmentAreasPanel.edit);

      // Detail Tab - Document tab (no docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort4);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add);

      // Detail Tab - Document tab (with docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort3);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit);
      cy.get(route.agendaitemDocuments.openPublication);
      cy.get(route.agendaitemDocuments.add);

      // Detail Tab - Document tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions)
        .eq(0)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);

      // Detail Tab - Decisions tab (no decision doc)
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit);
      cy.get(agenda.agendaitemDecision.uploadFile);

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit);

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


    it('check if agenda details tabs can be accessed even if button is absent', () => {
      // If the tab is not displayed, you should not be able to get to it.
      cy.visitAgendaWithLink(agendaitemLinkOnOpen1);
      cy.get(agenda.agendaitemNav.documentsTab);
      cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/documenten`);
      cy.get(agenda.agendaitemNav.activeTab).contains('Documenten');
      cy.get(agenda.agendaitemNav.decisionTab);
      cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/beslissingen`);
      cy.get(agenda.agendaitemNav.activeTab).contains('Beslissing');
      cy.get(agenda.agendaitemNav.newsletterTab);
      cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/kort-bestek`);
      cy.get(agenda.agendaitemNav.activeTab).contains('Kort bestek');

      // Approval item (no newsletter tab);
      cy.visitAgendaWithLink(approvalLinkOnOpen);
      cy.get(agenda.agendaitemNav.newsletterTab).should('not.exist');
      cy.visitAgendaWithLink(`${approvalLinkOnOpen}/kort-bestek`);
      // TODO-bug
      // !This fails because you can go to the address and not get rerouted.
      // cy.get(agenda.agendaitemNav.activeTab).contains('Dossier');
    });

    it('check agenda documents', () => {
      // There should be no difference since these docs are not blocked behind a release
      // Open agenda
      // Documents Tab (with doc)
      cy.visitAgendaWithLink(agendaOpenLink);
      cy.clickReverseTab('Documenten');
      cy.get(route.agendaDocuments.addDocuments);
      cy.get(route.agendaDocuments.batchEdit);

      // Documents Tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions)
        .eq(0)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);


      // Fully released agenda
      // Documents Tab (with doc)
      // TODO-profileRights should some editors be blocked from editing after a full release?
      cy.visitAgendaWithLink(agendaReleasedLink);
      cy.clickReverseTab('Documenten');
      cy.get(route.agendaDocuments.addDocuments);
      cy.get(route.agendaDocuments.batchEdit);

      // Documents Tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions)
        .eq(0)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();

      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit);
    });
  });
});
