/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
// import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as Kabinetdossierbeheerder', () => {
  beforeEach(() => {
    cy.login('Kabinetdossierbeheerder');
    cy.wait(1000);
  });

  // M-header toolbar tests
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
    // const agendaDateOpen = Cypress.dayjs('2022-04-22');
    // const agendaDateReleased = Cypress.dayjs('2022-04-23');
    // const agendaDateReleased = Cypress.dayjs('2020-04-22');

    // agendaitems op open agenda
    const approvalLinkOnOpen = 'vergadering/6374F696D9A98BD0A2288559/agenda/6374F699D9A98BD0A228855D/agendapunten/3df64f10-65bd-11ed-a5a5-db2587a216a4';
    const subcaseTitleShort1 = 'Cypress test: profile rights - subcase 1 no decision docs';
    const agendaitemLinkOnOpen1 = 'vergadering/6374F696D9A98BD0A2288559/agenda/6374F699D9A98BD0A228855D/agendapunten/3e04f510-65bd-11ed-a5a5-db2587a216a4';
    const subcaseTitleShort2 = 'Cypress test: profile rights - subcase 2 with decision docs';
    // const agendaitemLinkOnOpen2 = 'vergadering/6374F696D9A98BD0A2288559/agenda/6374F699D9A98BD0A228855D/agendapunten/3de5ad40-65bd-11ed-a5a5-db2587a216a4';

    // agendaitems op released agenda
    const subcaseTitleShort3 = 'Cypress test: profile rights - subcase 1 released no decision docs';
    // const agendaitemLinkOnReleased1 = 'vergadering/6374FA85D9A98BD0A2288576/agenda/6374FA87D9A98BD0A228857A/agendapunten/6374FA9CD9A98BD0A2288581';
    const subcaseTitleShort4 = 'Cypress test: profile rights - subcase 2 released with decision docs';
    // const agendaitemLinkOnReleased2 = 'vergadering/6374FA85D9A98BD0A2288576/agenda/6374FA87D9A98BD0A228857A/agendapunten/6374FAB4D9A98BD0A2288586';

    it('check agendas route', () => {
      cy.get(route.agendas.title);
      cy.get(route.agendas.action.newMeeting).should('not.exist');
    });

    it('check agenda route on open agenda', () => {
      cy.visitAgendaWithLink(agendaOpenLink);

      // Main view - Tabs
      cy.get(agenda.agendaTabs.tabs).contains('Overzicht');
      cy.get(agenda.agendaTabs.tabs).contains('Detail');
      cy.get(agenda.agendaTabs.tabs).contains('Vergelijk')
        .should('not.exist');
      cy.get(agenda.agendaTabs.tabs).contains('Documenten');

      // Main view - Side Nav (left)
      cy.agendaNameExists('A', false);
      cy.get(agenda.agendaSideNav.agendaName).contains('Ontwerpagenda B')
        .should('not.exist');

      // Main view - Agenda actions
      cy.get(agenda.agendaVersionActions.showOptions).should('not.exist');
      // Main view - Actions
      cy.get(agenda.agendaActions.showOptions).click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToDecisions).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintablePressAgenda);
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

      // Detail Tab - Document tab (with docs)
      cy.openAgendaitemDocumentTab(subcaseTitleShort1);
      cy.get(auk.loader).should('not.exist');
      cy.get(route.agendaitemDocuments.batchEdit).should('not.exist');
      cy.get(route.agendaitemDocuments.openPublication).should('not.exist');
      cy.get(route.agendaitemDocuments.add).should('not.exist');

      // Detail Tab - Document tab - Document Card
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.pubLink).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).click();
      // Detail Tab - Document tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');
    });

    it('check agenda route on closed agenda', () => {
      cy.visitAgendaWithLink(agendaClosedLink);

      // Main view - Agenda actions
      cy.get(agenda.agendaVersionActions.showOptions).should('not.exist');
      // Main view - Actions
      cy.get(agenda.agendaActions.showOptions).click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToDecisions).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintablePressAgenda);
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

    it.only('check agenda route on fully released agenda', () => {
      // Note: not everything is tested again to avoid some needless repetition
      cy.visitAgendaWithLink(agendaReleasedLink);

      // Main view - Agenda actions
      cy.get(agenda.agendaVersionActions.showOptions).should('not.exist');

      // Main view - Actions
      cy.get(agenda.agendaActions.showOptions).click();
      cy.get(agenda.agendaActions.addAgendaitems).should('not.exist');
      cy.get(agenda.agendaActions.navigateToDecisions).should('not.exist');
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintablePressAgenda);
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
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');

      // Detail Tab - Decisions tab - Document Card
      cy.openDetailOfAgendaitem(subcaseTitleShort4);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(agenda.agendaitemDecision.uploadFile).should('not.exist');
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit).should('not.exist');
      cy.get(document.documentCard.actions).should('not.exist');
      cy.get(document.documentCard.versionHistory).click();
      // Detail Tab - Decisions tab - Document Card history
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit)
        .should('not.exist');
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

    it('check agenda compare', () => {
      // There should be no difference with released except that non-editors wont see designagendas
      // Open agenda
      // Compare Tab
      cy.visitAgendaWithLink(agendaOpenLink);
      cy.clickReverseTab('Vergelijk');
      cy.get(agenda.compareAgenda.agendaLeft).click();
      cy.selectFromDropdown('Agenda A');
      cy.get(auk.loader).should('not.exist');

      cy.get(agenda.compareAgenda.agendaRight).click();
      cy.selectFromDropdown('Ontwerpagenda B');
      cy.get(auk.loader).should('not.exist');

      cy.get(agenda.compareAgenda.agendaitemLeft);
      cy.get(agenda.compareAgenda.agendaitemRight);
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
      cy.get(document.documentCard.actions).eq(0)
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
      cy.get(document.documentCard.actions).eq(0)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory).click();

      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit);
    });
  });
});
