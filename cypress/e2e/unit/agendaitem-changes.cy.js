/* global context, beforeEach, afterEach, it, cy */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';

function agendaitemExistsInOverview(agendaitemTitle, exists) {
  if (exists) {
    cy.get(agenda.agendaOverviewItem.subitem).contains(agendaitemTitle);
  } else {
    cy.get(agenda.agendaOverviewItem.subitem).contains(agendaitemTitle)
      .should('not.exist');
  }
}
function agendaitemDocIsNewInOverview(agendaitemTitle) {
  cy.get(agenda.agendaOverviewItem.subitem).contains(agendaitemTitle)
    .parents(agenda.agendaOverviewItem.container)
    .find(document.documentBadge.isNew);
}

function agendaitemIsNewInOverview(agendaitemTitle) {
  cy.get(agenda.agendaOverviewItem.subitem).contains(agendaitemTitle)
    .parents(agenda.agendaOverviewItem.container)
    .find(agenda.agendaOverviewItem.isNew);
}

context('Agendaitem changes tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // const agendaDate = Cypress.dayjs('2020-04-02');
  const agendaURL = '/vergadering/5EBA48CF95A2760008000006/agenda/f66c6d79-6ad2-49e2-af55-702df3a936d8/agendapunten';
  const approvalTitle = 'Goedkeuring van het verslag van de vergadering van vrijdag 22-11-2019';
  const agendaitemIndex2 = 'testId=1589276690: Cypress test dossier 1 test stap 1';
  const caseTitle = 'testId=1589266576: Cypress test dossier 1';
  const subcaseTitle1 = `${caseTitle} test stap 1`;
  const subcaseTitle2 = `${caseTitle} test stap 2`;
  const subcaseTitle3 = `${caseTitle} test stap 3`;
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
  };
  const files = [file];

  // The setup of this test:
  /*
    agenda A:
    -punt 1: verslag van de vorige vergadering (formeel ok)
    -punt 2: geagendeerde procedurestap (formeel ok)
    ontwerpagenda B:
    -punt 1: idem (geen changes)
    -punt 2: idem (geen changes)
    -punt 3 (nieuw agendapunt met 1 document) (nog niet formeel ok)
  */

  it('should add a document to an agenda and should highlight as added', () => {
    cy.visitAgendaWithLink(agendaURL);
    cy.addDocumentsToAgendaitem(subcaseTitle1, files);
    cy.setFormalOkOnItemWithIndex(1);
    agendaitemDocIsNewInOverview(subcaseTitle1);
    cy.toggleShowChanges();
    agendaitemExistsInOverview(approvalTitle, false);
    agendaitemExistsInOverview(subcaseTitle1, true);
    agendaitemExistsInOverview(agendaitemIndex2, true);
    cy.toggleShowChanges();
  });

  it('should add an agendaitem and highlight it as changed', () => {
    cy.visitAgendaWithLink(agendaURL);
    // when toggling show changes the agendaitem added since current agenda should show
    cy.addAgendaitemToAgenda(subcaseTitle2);
    cy.setFormalOkOnItemWithIndex(2); // punt 3
    cy.setFormalOkOnItemWithIndex(3); // punt 4
    agendaitemIsNewInOverview(subcaseTitle2);
    cy.toggleShowChanges();
    agendaitemExistsInOverview(approvalTitle, false);
    agendaitemExistsInOverview(subcaseTitle1, true);
    agendaitemExistsInOverview(agendaitemIndex2, true);
    agendaitemExistsInOverview(subcaseTitle2, true);
    cy.toggleShowChanges();
    cy.approveDesignAgenda();
  });

  it('should add a piece to an item and highlight it as changed', () => {
    cy.visitAgendaWithLink(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda'); // switch from agenda B to ontwerpagenda C
    // when toggling show changes  the agendaitem with a new document version should show
    cy.addNewPieceToAgendaitem(subcaseTitle1, file.newFileName, file);
    cy.setFormalOkOnItemWithIndex(1);
    agendaitemDocIsNewInOverview(subcaseTitle1);
    cy.toggleShowChanges();
    agendaitemExistsInOverview(approvalTitle, false);
    agendaitemExistsInOverview(subcaseTitle1, true);
    agendaitemExistsInOverview(agendaitemIndex2, false);
    agendaitemExistsInOverview(subcaseTitle2, false);
    cy.toggleShowChanges();
  });

  it('should add an agendaitem of type remark and highlight it as added', () => {
    const caseLink = 'dossiers/E14FB4CE-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers';
    cy.visit(caseLink);
    cy.addSubcaseViaModal({
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitle3,
      longTitle: `${subcaseTitle3} lange titel`,
      subcaseType: 'principiële goedkeuring',
      subcaseName: 'Principiële goedkeuring m.h.o. op adviesaanvraag',
    });
    cy.visitAgendaWithLink(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // when toggling show changes  the agendaitem added since current agenda should show
    cy.addAgendaitemToAgenda(subcaseTitle3);
    cy.setFormalOkOnItemWithIndex(4);
    agendaitemIsNewInOverview(subcaseTitle3);
    cy.toggleShowChanges();
    agendaitemExistsInOverview(approvalTitle, false);
    agendaitemExistsInOverview(subcaseTitle1, true);
    agendaitemExistsInOverview(agendaitemIndex2, false);
    agendaitemExistsInOverview(subcaseTitle2, false);
    agendaitemExistsInOverview(subcaseTitle3, true);
    cy.toggleShowChanges();
    cy.approveDesignAgenda();
  });

  it('should add a document version to a remark and highlight it as changed', () => {
    cy.visitAgendaWithLink(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // when toggling show changes  the agendaitem with a new document version should show
    cy.addDocumentsToAgendaitem(subcaseTitle3, files);
    cy.setFormalOkOnItemWithIndex(4);
    cy.toggleShowChanges();
    agendaitemExistsInOverview(approvalTitle, false);
    agendaitemExistsInOverview(subcaseTitle1, false);
    agendaitemExistsInOverview(agendaitemIndex2, false);
    agendaitemExistsInOverview(subcaseTitle2, false);
    agendaitemExistsInOverview(subcaseTitle3, true);
    cy.toggleShowChanges();
    // TODO checking locally shows that doc is new, but failed in headless tests
    agendaitemDocIsNewInOverview(subcaseTitle3);
  });

  it('should add a document to the approval (verslag) and highlight it as changed', () => {
    cy.visitAgendaWithLink(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // workaround for adding documents to approval, cy.addDocumentsToAgendaitem fails because of no subcase
    // TODO-command new command to add documentsToApprovals (no subcase)
    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(route.agendaitemDocuments.add).click();
    cy.addNewDocumentsInUploadModal(files, 'agendaitems');
    cy.setFormalOkOnItemWithIndex(0);
    agendaitemDocIsNewInOverview(approvalTitle);
    cy.toggleShowChanges();
    agendaitemExistsInOverview(approvalTitle, true);
    agendaitemExistsInOverview(subcaseTitle1, false);
    agendaitemExistsInOverview(agendaitemIndex2, false);
    agendaitemExistsInOverview(subcaseTitle2, false);
    agendaitemExistsInOverview(subcaseTitle3, true);
    cy.toggleShowChanges();
  });

  it('should verify that only changes are shown by approving with no changes', () => {
    cy.visitAgendaWithLink(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.approveDesignAgenda();
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 5);
    cy.get(agenda.agendaOverviewItem.isNew).should('not.exist');
    cy.get(document.documentBadge.isNew).should('not.exist');
    cy.toggleShowChanges();
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 0);
    cy.toggleShowChanges();
  });

  it('should check the printable version of the agenda', () => {
    cy.visitAgendaWithLink(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // when navigating to print view, should contain all relevant info
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToPrintableAgenda).forceClick();
    cy.wait(1000);
    cy.get(agenda.printableAgenda.headerTitle, {
      timeout: 80000,
    }).should('be.visible');
    cy.get(agenda.printableAgenda.headerTitle).contains('Agenda van');
    cy.get(agenda.printableAgenda.container).should('exist')
      .should('be.visible');

    // TODO-printableAgenda check the order of the items is as expected with list sections
    // TODO-printableAgenda move test to last one to also check mandatee headers
    cy.get(agenda.printableAgenda.container).contains(approvalTitle);
    cy.get(agenda.printableAgenda.container).contains(subcaseTitle1);
    cy.get(agenda.printableAgenda.container).contains(agendaitemIndex2);
    cy.get(agenda.printableAgenda.container).contains(subcaseTitle2);
    cy.get(agenda.printableAgenda.container).contains(subcaseTitle3);
  });

  it('should assign an agenda-item to a minister and no longer under NO ASSIGNMENT', () => {
    cy.visitAgendaWithLink(agendaURL);
    const ministerTitle = 'Minister-president van de Vlaamse Regering';
    cy.changeSelectedAgenda('Ontwerpagenda');
    // TODO-users CHECK WITH USERS, should there be a mandatee header between approval and first item without mandatee
    // check if only 'Geen toekenning' is a header
    cy.get(agenda.agendaitemGroupHeader.section)
      .should('have.length', 0);
    // cy.get(agenda.agendaitemGroupHeader.section).eq(0)
    //   .should('contain.text', 'Geen toekenning');
    cy.openDetailOfAgendaitem('Cypress test dossier 1 test stap 1');
    cy.addAgendaitemMandatee(mandateeNames['02102019-10052021'].first);
    cy.clickReverseTab('Overzicht');
    cy.get(agenda.agendaitemGroupHeader.section).eq(0)
      .should('contain.text', ministerTitle);
    cy.get(agenda.agendaitemGroupHeader.section).should('have.length', 2);
    cy.get(agenda.agendaitemGroupHeader.section).eq(1)
      .should('contain.text', 'Geen toekenning');
  });

  it('should test the scroll anchor', () => {
    const title = 'Cypress test dossier 1 test stap 3';
    const visibleTitle = 'Cypress test dossier 1 test stap 2';
    const approvalTitle = 'verslag';
    cy.visitAgendaWithLink(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.get(agenda.agendaOverview.notesSectionTitle).should('be.visible');
    cy.get(agenda.agendaOverviewItem.subitem).contains(approvalTitle)
      .should('be.visible');
    cy.openDetailOfAgendaitem(title);
    cy.clickReverseTab('Overzicht');
    cy.get(agenda.agendaOverviewItem.subitem).contains(visibleTitle)
      .should('be.visible');
    cy.get(agenda.agendaOverview.notesSectionTitle).should('not.be.visible');
    cy.get(agenda.agendaOverviewItem.subitem).contains(approvalTitle)
      .should('not.be.visible');
    // After a page reload (or going to the address), the anchor still exists and is used for scrolling
    cy.reload();
    cy.get(agenda.agendaOverview.notesSectionTitle);
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaOverviewItem.subitem).contains(visibleTitle)
      .should('be.visible');
    cy.get(agenda.agendaOverview.notesSectionTitle).should('not.be.visible');
    cy.get(agenda.agendaOverviewItem.subitem).contains(approvalTitle)
      .should('not.be.visible');
    // Switching between detail and overview with nav tabs should keep the anchor
    // TODO-bug clicking on detail with anchor always goes to first item instead of anchor
    cy.clickReverseTab('Detail');
    // our agendaitem should be highlighted but isn't due to bug
    cy.clickReverseTab('Overzicht');
    cy.get(agenda.agendaOverviewItem.subitem).contains(visibleTitle)
      .should('be.visible');
    cy.get(agenda.agendaOverview.notesSectionTitle).should('not.be.visible');
    cy.get(agenda.agendaOverviewItem.subitem).contains(approvalTitle)
      .should('not.be.visible');
    // different anchor after going to detail
    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.clickReverseTab('Overzicht');
    cy.get(agenda.agendaOverview.notesSectionTitle).should('be.visible');
    cy.get(agenda.agendaOverviewItem.subitem).contains(approvalTitle)
      .should('be.visible');
  });

  it('check agendaitem move up and move down buttons', () => {
    // uses the profile spec agenda
    const agendaitemTitle = 'Cypress test: profile rights - subcase 1 no decision docs';

    cy.visit('vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten');

    cy.get(agenda.agendaitemSearch.formallyReorderEdit).click();
    cy.get(agenda.agendaOverviewItem.subitem).contains(agendaitemTitle)
      .parents(agenda.agendaOverviewItem.container)
      .as('agendaItem');

    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(2);
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveUp)
      .click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveUp)
      .should('be.disabled');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(1);

    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveDown)
      .click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveUp)
      .should('not.be.disabled');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(2);

    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveDown)
      .click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveDown)
      .should('be.disabled');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(3);

    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveUp)
      .click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.moveDown)
      .should('not.be.disabled');
    cy.get('@agendaItem').find(agenda.agendaOverviewItem.numbering)
      .contains(2);
  });
});
