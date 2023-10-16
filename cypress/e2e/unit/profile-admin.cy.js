/* global context, it, cy, Cypress, beforeEach */
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

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

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
      cy.get(newsletter.newsletterHeader.title);
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
    // - 1 agendaitem with 0 documents, decision doc (pre piece parts)
    // 1 closed agenda A, with a document, fully released:
    // - 1 approval agendaitem
    // - 1 agendaitem with 5 documents (1BIS), 1 of each accessLevel (not used yet in test), no decision doc
    // - 1 agendaitem with 0 documents, decision doc (BIS) (pre piece parts)
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
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaOverview.formallyOkEdit);

      // Overview Tab - General action - Dragging
      cy.get(agenda.agendaOverviewItem.dragging).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveUp).should('not.exist');
      cy.get(agenda.agendaOverviewItem.moveDown).should('not.exist');
      cy.get(agenda.agendaOverview.formallyOkEdit).click();
      cy.get(agenda.agendaOverviewItem.dragging);
      cy.get(agenda.agendaOverviewItem.moveUp);
      cy.get(agenda.agendaOverviewItem.moveDown);

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
      cy.get(document.documentCard.signMarking);
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
      cy.get(agenda.agendaitemDecision.create);

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.create).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.signMarking);
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
      cy.get(document.documentCard.signMarking);
      cy.get(document.documentCard.delete);

      // Detail Tab - Decisions tab (no decision doc)
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit);
      cy.get(agenda.agendaitemDecision.create);

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.create).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions)
        .children(appuniversum.button)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.signMarking);
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
      cy.get(agenda.agendaitemNav.tabs)
        .find(auk.tab.activeHref)
        .contains('Documenten');
      cy.get(agenda.agendaitemNav.decisionTab);
      cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/beslissingen`);
      cy.get(agenda.agendaitemNav.tabs)
        .find(auk.tab.activeHref)
        .contains('Beslissing');
      cy.get(agenda.agendaitemNav.newsletterTab);
      cy.visitAgendaWithLink(`${agendaitemLinkOnOpen1}/kort-bestek`);
      cy.get(agenda.agendaitemNav.tabs)
        .find(auk.tab.activeHref)
        .contains('Kort bestek');

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
      cy.get(document.documentCard.signMarking).should('not.exist');
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
      cy.get(document.documentCard.signMarking).should('not.exist');
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

  context('Profile rights checks for kort-bestek routes', () => {
    const agendaDate = Cypress.dayjs().add(3, 'weeks')
      .day(3);

    it.skip('setup for update notas tests', () => {
      const todayFormatted = Cypress.dayjs().format('DD-MM-YYYY');
      const caseTitle = `testId=${currentTimestamp()}: Cypress test nota updates`;
      const subcaseTitle1 = `${caseTitle} test stap 1`;
      const file = {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
      };
      const files = [file];

      cy.createCase(caseTitle);
      cy.addSubcase('Nota',
        subcaseTitle1,
        'Cypress test voor nota updates',
        'Principiële goedkeuring',
        'Principiële goedkeuring m.h.o. op adviesaanvraag');
      cy.createAgenda(null, agendaDate, 'Zaal oxford bij Cronos Leuven');

      cy.openAgendaForDate(agendaDate);
      cy.addAgendaitemToAgenda(subcaseTitle1);
      cy.addDocumentsToAgendaitem(subcaseTitle1, files);
      cy.addNewPieceToAgendaitem(subcaseTitle1, file.newFileName, file);

      cy.setFormalOkOnItemWithIndex(0);
      cy.setFormalOkOnItemWithIndex(1);
      cy.approveAndCloseDesignAgenda();
      cy.releaseDecisions();
      cy.wait(80000);
      // check status pills (use within because find doesn't work, probably can't chain of appuniversum wormhole)
      cy.get(agenda.publicationPills.container).within(() => {
        cy.get(appuniversum.pill).contains(`Beslissingen zijn vrijgegeven op ${todayFormatted}`);
      });
    });

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
        cy.get(auk.loader).should('not.exist');

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
        cy.get(auk.loader).should('not.exist');

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

      // TODO We need setup for this test, needs to be added to ZIP
      it.skip('check update notas view', () => {
        // setup: create nota with bis
        cy.openAgendaForDate(agendaDate);
        cy.get(agenda.agendaActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
        cy.get(newsletter.newsletterHeaderOverview.notaUpdates).click();

        cy.get(route.notaUpdates.row.showPieceViewer);
        cy.get(route.notaUpdates.row.goToAgendaitemDocuments);
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

      it.skip('check update notas view', () => {
        // setup: create nota with bis
        cy.openAgendaForDate(agendaDate);
        cy.get(agenda.agendaActions.optionsDropdown)
          .children(appuniversum.button)
          .click();
        cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
        cy.get(newsletter.newsletterHeaderOverview.notaUpdates).click();

        cy.get(route.notaUpdates.row.showPieceViewer);
        cy.get(route.notaUpdates.row.goToAgendaitemDocuments);
      });
    });
  });

  context('Profile rights checks for publications routes', () => {
    it('check publications route', () => {
      cy.visit('publicaties/overzicht/alle-dossiers');

      cy.get(publication.publicationsIndex.newPublication);
      cy.get(publication.publicationsIndex.tabs.all);
      cy.get(publication.publicationsIndex.tabs.urgent);
      cy.get(publication.publicationsIndex.tabs.translations);
      cy.get(publication.publicationsIndex.tabs.proof);
      cy.get(publication.publicationsIndex.tabs.proofread);
      cy.get(publication.publicationsIndex.tabs.late);
      // cy.get(publication.publicationsIndex.tabs.reports);
      // cy.get(publication.publicationsIndex.tabs.search);

      cy.get(publication.publicationsIndex.tabs.reports).click();
      cy.get(auk.loader).should('not.exist');
      cy.get(publication.reportsPanelEntry.create).should('not.be.disabled');

      cy.get(publication.publicationsIndex.tabs.search).click();
      cy.get(auk.loader).should('not.exist');
      cy.get(route.search.input);
      cy.get(route.search.trigger);
    });

    it('check publications/publication route', () => {
      cy.visit('publicaties/6374F718D9A98BD0A228856E/dossier');

      // main view - status
      cy.get(publication.statusPill.changeStatus);

      // case view
      cy.get(publication.publicationNav.case);
      cy.get(publication.publicationCaseInfo.edit);
      cy.get(publication.remark.edit);
      cy.get(publication.inscription.view.edit);
      cy.get(publication.mandateesPanel.add);
      cy.get(utils.governmentAreasPanel.edit);
      cy.get(publication.contactPersons.add);

      // decisions view
      cy.get(publication.publicationNav.decisions).click();
      cy.get(publication.decisionsInfoPanel.edit);
      cy.get(publication.decisionsIndex.uploadReference);

      // translations view
      cy.get(publication.publicationNav.translations).click();
      cy.get(publication.translationsInfoPanel.edit);
      cy.get(publication.translationsIndex.upload);
      cy.get(publication.translationsIndex.requestTranslation);

      // proofs view
      cy.get(publication.publicationNav.proofs).click();
      cy.get(publication.proofInfoPanel.edit);
      cy.get(publication.proofsIndex.upload);
      cy.get(publication.proofsIndex.newRequest);

      // publications view
      cy.get(publication.publicationNav.publications).click();
      cy.get(publication.publicationsInfoPanel.edit);
      cy.get(publication.publicationActivities.register);
      cy.get(publication.publicationActivities.request);
    });
  });

  context('Profile rights checks for signatures routes', () => {
    it('check signatures/start route', () => {
      cy.visit('ondertekenen/opstarten');
      cy.get(auk.loader).should('not.exist');
      cy.get(route.signatures.openMinisterFilter);
    });

    it('check signatures/ongoing route', () => {
      cy.visit('ondertekenen/opvolgen');
      cy.get(auk.loader).should('not.exist');
      cy.get(route.ongoing.statusFilter).find(appuniversum.checkbox);
      cy.get(route.ongoing.ministerFilter).find(appuniversum.checkbox);
    });
  });

  context('Profile rights checks for case routes', () => {
    it('check cases route', () => {
      cy.visit('dossiers');

      cy.get(cases.casesHeader.addCase);
      cy.get(route.casesOverview.showArchived);
      cy.get(route.casesOverview.row.actionsDropdown).eq(0)
        .click();
      cy.get(route.casesOverview.row.actions.edit);
      cy.get(route.casesOverview.row.actions.archive);
      cy.get(route.casesOverview.row.goToCase);
    });

    it('check subcases/overview route', () => {
      // open agenda
      cy.visit('dossiers/6374F284D9A98BD0A2288538/deeldossiers');

      cy.get(cases.subcaseOverviewHeader.publicationFlowLink);
      cy.get(cases.subcaseOverviewHeader.editCase);
      cy.get(cases.subcaseOverviewHeader.createSubcase);
      cy.get(cases.subcaseItem.pending);

      cy.get(cases.subcaseItem.showDocuments).click();
      cy.get(document.documentBadge.link).contains('VR 2022 2204 DOC.0001-5');

      // released agenda
      cy.visit('dossiers/6374F2D6D9A98BD0A2288549/deeldossiers');

      cy.get(cases.subcaseItem.approved);

      cy.get(cases.subcaseItem.showDocuments).click();
      cy.get(document.documentBadge.link).contains('VR 2022 2304 DOC.0001-5');

      // closed agenda
      cy.visit('dossiers/E14FB514-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');

      cy.get(cases.subcaseItem.pending);

      cy.get(cases.subcaseItem.showDocuments).should('not.exist');
    });

    it('check subcases/overview route', () => {
      // actions on open agenda no decisions
      cy.visit('dossiers/6374F284D9A98BD0A2288538/deeldossiers/6374F28BD9A98BD0A2288539');

      cy.get(cases.subcaseHeader.actionsDropdown).click();
      cy.get(cases.subcaseHeader.actions.moveSubcase);

      // overview tab
      cy.get(cases.subcaseDetailNav.overview);
      cy.get(cases.subcaseDescription.edit);
      cy.get(cases.subcaseTitlesView.edit);
      cy.get(mandatee.mandateePanelView.actions.edit);
      cy.get(utils.governmentAreasPanel.edit);

      // documents tab
      cy.get(cases.subcaseDetailNav.documents).click();
      cy.get(route.subcaseDocuments.batchEdit);

      cy.get(document.documentCard.actions).eq(0)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.signMarking).should('not.exist');
      cy.get(document.documentCard.delete);
      cy.get(document.accessLevelPill.edit);

      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      // Detail Tab - Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit);

      cy.get(route.subcaseDocuments.add);
      cy.get(document.linkedDocuments.add);

      // docs visible on open agenda no decisions
      cy.get(document.documentCard.name.value).contains('VR 2022 2204 DOC.0001-5')
        .parent()
        .find(document.documentCard.primarySourceLink)
        .invoke('attr', 'href')
        .should('contain', 'test.docx');

      // decisions tab (on open agenda with decision)
      cy.visit('dossiers/6374F2C7D9A98BD0A2288546/deeldossiers/6374F2CDD9A98BD0A2288547/beslissing');
      cy.get(cases.subcaseDetailNav.decisions);
      cy.get(document.documentCard.card);
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      //  Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');

      // actions on released agenda no decisions
      cy.visit('dossiers/6374F2D6D9A98BD0A2288549/deeldossiers/6374F2DCD9A98BD0A228854A');

      cy.get(cases.subcaseHeader.actionsDropdown).click();
      cy.get(cases.subcaseHeader.actions.moveSubcase);

      // overview tab
      cy.get(cases.subcaseDetailNav.overview);
      cy.get(cases.subcaseDescription.edit);
      cy.get(cases.subcaseTitlesView.edit);
      cy.get(mandatee.mandateePanelView.actions.edit);
      cy.get(utils.governmentAreasPanel.edit);

      // documents tab
      cy.get(cases.subcaseDetailNav.documents).click();
      cy.get(route.subcaseDocuments.batchEdit);

      cy.get(document.documentCard.actions).eq(0)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.signMarking).should('not.exist');
      cy.get(document.documentCard.delete);
      cy.get(document.accessLevelPill.edit);

      // TODO released agenda docs has no previous version, setup?
      // cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
      //   .should('not.be.disabled')
      //   .click();
      // // Detail Tab - Decisions tab - Document Card history
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.pill);
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.edit);

      cy.get(route.subcaseDocuments.add);
      cy.get(document.linkedDocuments.add);

      // docs visible on released agenda no decisions
      cy.get(document.documentCard.name.value).contains('VR 2022 2304 DOC.0001-5')
        .parent()
        .find(document.documentCard.primarySourceLink)
        .invoke('attr', 'href')
        .should('contain', 'test.docx');

      // decisions tab (on released agenda with decision)
      cy.visit('dossiers/6374F30CD9A98BD0A2288557/deeldossiers/6374F312D9A98BD0A2288558/beslissing');
      cy.get(cases.subcaseDetailNav.decisions);
      cy.get(document.documentCard.card);
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      //  Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');

      // actions on closed agenda no decisions
      cy.visit('dossiers/6374F2D6D9A98BD0A2288549/deeldossiers/6374F2DCD9A98BD0A228854A');

      cy.get(cases.subcaseHeader.actionsDropdown).click();
      cy.get(cases.subcaseHeader.actions.moveSubcase);

      // overview tab
      cy.get(cases.subcaseDetailNav.overview);
      cy.get(cases.subcaseDescription.edit);
      cy.get(cases.subcaseTitlesView.edit);
      cy.get(mandatee.mandateePanelView.actions.edit);
      cy.get(utils.governmentAreasPanel.edit);

      // documents tab
      cy.get(cases.subcaseDetailNav.documents).click();
      cy.get(route.subcaseDocuments.batchEdit);

      cy.get(document.documentCard.actions).eq(0)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.signMarking).should('not.exist');
      cy.get(document.documentCard.delete);
      cy.get(document.accessLevelPill.edit);

      // TODO released agenda docs has no previous version, setup?
      // cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
      //   .should('not.be.disabled')
      //   .click();
      // // Detail Tab - Decisions tab - Document Card history
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.pill);
      // cy.get(document.vlDocument.piece)
      //   .find(document.accessLevelPill.edit);

      cy.get(route.subcaseDocuments.add);
      cy.get(document.linkedDocuments.add);

      // docs visible on closed agenda no decisions
      cy.get(document.documentCard.name.value).contains('VR 2022 2304 DOC.0001-5')
        .parent()
        .find(document.documentCard.primarySourceLink)
        .invoke('attr', 'href')
        .should('contain', 'test.docx');

      // decisions tab (on closed agenda with decision)
      cy.visit('dossiers/6374F30CD9A98BD0A2288557/deeldossiers/6374F312D9A98BD0A2288558/beslissing');
      cy.get(cases.subcaseDetailNav.decisions);
      cy.get(document.documentCard.card);
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.versionHistory).find(auk.accordion.header.button)
        .should('not.be.disabled')
        .click();
      //  Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');
    });
  });

  context.only('Profile rights checks for document route', () => {
    it('check document view', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A');
      cy.get(document.documentPreview.title).contains('VR 2022 2204 DOC.0001-1BIS');
      cy.get(document.documentPreview.downloadLink);
      // cy.get(document.documentView.pdfView);
    });

    it('check switching to all tabs', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A');
      cy.get(document.documentPreviewSidebar.tabs.signatures).click();
      cy.url().should('include', '?tab=Ondertekenen');

      cy.get(document.documentPreviewSidebar.tabs.versions).click();
      cy.url().should('include', '?tab=Versies');

      cy.get(document.documentPreviewSidebar.tabs.details).click();
      cy.url().should('not.include', '?tab=Versies');
      cy.url().should('not.include', '?tab=Ondertekenen');
    });

    it('check details tab', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A');

      cy.get(document.previewDetailsTab.delete); // BIS version
      cy.get(document.previewDetailsTab.edit);
      // switch version
      cy.intercept('GET', '/pieces/*/file').as('getFileType');
      cy.get(document.documentPreviewSidebar.tabs.versions).click()
        .wait('@getFileType');
      cy.get(document.previewVersionCard.name).contains('VR 2022 2204 DOC.0001-1.docx')
        .parents(document.previewVersionCard.container)
        .click();
      // check again
      cy.get(document.documentPreviewSidebar.tabs.details).click();
      cy.get(document.previewDetailsTab.delete).should('not.exist'); // previous version
      cy.get(document.previewDetailsTab.edit);
    });

    it('check signatures tab', () => {
      // agendaitem document
      cy.visit('document/6374F6E4D9A98BD0A228856A?tab=Ondertekenen');
      cy.get(document.previewSignaturesTab.markForSignflow);

      // decision document
      cy.visit('document/6374F736D9A98BD0A2288574?tab=Ondertekenen');
      cy.get(document.previewSignaturesTab.markForSignflow);

      // setup for notulen
      cy.visit('vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/notulen');
      cy.get(route.agendaitemMinutes.createEdit).click();
      cy.get(route.agendaitemMinutes.editor.updateContent).click();
      cy.intercept('PATCH', '/minutes/**').as('patchMinutes');
      cy.get(route.agendaitemMinutes.editor.save).click()
        .wait('@patchMinutes');
      cy.get(document.documentCard.name.value)
        .invoke('removeAttr', 'target')
        .parent()
        .click();
      // check notulen document
      cy.get(document.documentPreviewSidebar.tabs.signatures).click();
      cy.get(document.previewSignaturesTab.markForSignflow);
    });

    it('check version tab', () => {
      cy.visit('document/6374F6E4D9A98BD0A228856A?tab=Versies');
      cy.get(document.previewVersionCard.container).contains('VR 2022 2204 DOC.0001');
      cy.get(document.previewVersionCard.container).contains('Geüpload op');
      cy.get(document.previewVersionCard.container).contains('Rechten gewijzigd op');
    });
  });

  context.only('Profile rights checks for search routes', () => {
    // const searchTerm = 'test';
    it('check search/all-types route', () => {
      cy.visit('zoeken/alle-types');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      // cy.get(route.searchMinisterFilter.list);
      cy.get(utils.ministerFilter.pastMinisters);

      // cy.get(route.search.input).clear();
      // cy.get(route.search.input).type(searchTerm);
    });

    it('check search/cases route', () => {
      cy.visit('zoeken/dossiers');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      // cy.get(route.searchMinisterFilter.list);
      cy.get(utils.ministerFilter.pastMinisters);
      cy.get(route.searchCases.removedCasesList);
      cy.get(route.searchConfidentialOnly.checkbox);

      // cy.get(route.search.input).clear();
      // cy.get(route.search.input).type(searchTerm);
      // cy.get(route.searchCases.dataTable);
    });

    it('check search/agendaitems route', () => {
      cy.visit('zoeken/agendapunten');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      // cy.get(route.searchMinisterFilter.list);
      cy.get(utils.ministerFilter.pastMinisters);
      cy.get(route.searchAgendaitems.filter.type);
      cy.get(route.searchAgendaitems.filter.finalAgenda);

      // cy.get(route.search.input).clear();
      // cy.get(route.search.input).type(searchTerm);
      // cy.get(route.searchAgendaitems.dataTable);
    });

    it('check search/documents route', () => {
      cy.visit('zoeken/documenten');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      // cy.get(route.searchMinisterFilter.list);
      cy.get(utils.ministerFilter.pastMinisters);
      cy.get(route.searchConfidentialOnly.checkbox);
      cy.get(route.searchDocumentTypeFilter.list);

      // cy.get(route.search.input).clear();
      // cy.get(route.search.input).type(searchTerm);
    });

    it('check search/decisions route', () => {
      cy.visit('zoeken/beslissingen');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      // cy.get(route.searchMinisterFilter.list);
      cy.get(utils.ministerFilter.pastMinisters);
      cy.contains('Resultaat beslissing');

      // cy.get(route.search.input).clear();
      // cy.get(route.search.input).type(searchTerm);
    });

    it('check search/newsletters route', () => {
      cy.visit('zoeken/kort-bestek');

      cy.get(route.search.input);
      cy.get(route.search.from);
      cy.get(route.search.to);
      // cy.get(route.searchMinisterFilter.list);
      cy.get(utils.ministerFilter.pastMinisters);

      // cy.get(route.search.input).clear();
      // cy.get(route.search.input).type(searchTerm);
    });
  });
});
