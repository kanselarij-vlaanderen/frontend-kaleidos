/* global context, before, beforeEach, afterEach, it, cy */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import actionModal from '../../selectors/action-modal.selectors';


context('Agendaitem changes tests', () => {
  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const agendaURL = '/vergadering/5EBA48CF95A2760008000006/agenda/f66c6d79-6ad2-49e2-af55-702df3a936d8/agendapunten';
  const approvalTitle = 'Goedkeuring van het verslag van de vergadering van vrijdag 22-11-2019.';
  const agendaitemIndex2 = 'testId=1589276690: Cypress test dossier 1 test stap 1';
  const caseTitle = 'testId=1589266576: Cypress test dossier 1';
  const subcaseTitle1 = `${caseTitle} test stap 1`;
  const subcaseTitle2 = `${caseTitle} test stap 2`;
  const subcaseTitle3 = `${caseTitle} test stap 3`;
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
  };
  const files = [file];
  const waitTime = 3000;

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
    // TODO change not needed, already on ontwerpagenda (is this to change away from detail to overview?)
    cy.changeSelectedAgenda('Ontwerpagenda');
    // TODO refresh true has been disabled, no longer needed
    cy.toggleShowChanges(true);
    cy.agendaitemExists(subcaseTitle1);
  });

  it('should add an agendaitem and highlight it as changed', () => {
    cy.visitAgendaWithLink(agendaURL);
    // when toggling show changes  the agendaitem added since current agenda should show
    cy.addAgendaitemToAgenda(subcaseTitle2, false);
    cy.setFormalOkOnItemWithIndex(2); // punt 3
    cy.toggleShowChanges(true);
    // TODO don't use then here, cypress awaits each command anyway
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 3)
      .then(() => {
        cy.agendaitemExists(subcaseTitle2);
        cy.setFormalOkOnItemWithIndex(2); // punt 4
        cy.approveDesignAgenda();
      });
  });

  it('should add a piece to an item and highlight it as changed', () => {
    cy.visit(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda'); // switch from agenda B to ontwerpagenda C
    // TODO check "toon aangepaste punten" shows no agendaitems ?
    // when toggling show changes  the agendaitem with a new document version should show
    cy.addNewPieceToAgendaitem(subcaseTitle1, file.newFileName, file);
    cy.setFormalOkOnItemWithIndex(1);
    cy.wait(waitTime); // Computeds are not reloaded yet , maybe
    // TODO change not needed, already on ontwerpagenda
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.toggleShowChanges(true);
    cy.agendaitemExists(subcaseTitle1);
  });

  it('should add an agendaitem of type remark and highlight it as added', () => {
    cy.wait(1000); // flaky, page not loading ?
    cy.openCase(caseTitle);
    cy.addSubcase('Mededeling', subcaseTitle3, `${subcaseTitle3} lange titel`, 'In voorbereiding', 'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.visit(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.wait(2000);
    // when toggling show changes  the agendaitem added since current agenda should show
    cy.addAgendaitemToAgenda(subcaseTitle3, false);
    cy.setFormalOkOnItemWithIndex(4);
    cy.toggleShowChanges(true);
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 2)
      .then(() => {
        cy.agendaitemExists(subcaseTitle3);
        cy.approveDesignAgenda();
      });
  });

  it('should add a document version to a remark and highlight it as changed', () => {
    cy.visit(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // when toggling show changes  the agendaitem with a new document version should show
    cy.addDocumentsToAgendaitem(subcaseTitle3, files);
    cy.wait(waitTime); // Computeds are not reloaded yet , maybe
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.setFormalOkOnItemWithIndex(4);
    cy.toggleShowChanges(true);
    cy.agendaitemExists(subcaseTitle3);
  });

  it('should add a document to the approval (verslag) and highlight it as changed', () => {
    cy.visit(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // workaround for adding documents to approval, cy.addDocumentsToAgendaitem fails because of no subcase
    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.get(agenda.agendaitemDocumentsTab).click();
    cy.contains('Documenten toevoegen').click();
    cy.addNewDocumentsInUploadModal(files, 'agendaitems');
    cy.wait(waitTime); // Computeds are not reloaded yet , maybe
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.setFormalOkOnItemWithIndex(0);
    cy.toggleShowChanges(true);
    cy.agendaitemExists(approvalTitle);
  });

  it('should verify that only changes are shown by approving with no changes', () => {
    cy.visit(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.wait(2000);
    cy.approveDesignAgenda();
    cy.toggleShowChanges(true);
    cy.get('.vlc-agenda-items__sub-item').should('have.length', 0);
  });

  it('should check the printable version of the agenda', () => {
    cy.visit(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // when navigating to print view, should contain all relevant info
    cy.get(actionModal.showActionOptions).click();
    cy.get(agenda.navigateToPrintableAgenda).click();
    cy.wait(1000);
    cy.get(agenda.printHeaderTitle, {
      timeout: 80000,
    }).should('exist')
      .should('be.visible');
    cy.get(agenda.printHeaderTitle).contains('Agenda van');
    // TODO Type is now visible in printHeaderTitle, but not tested for correctness
    cy.get(agenda.printContainer).should('exist')
      .should('be.visible');

    // TODO check the order of the items is as expected?
    cy.get(agenda.printContainer).contains(approvalTitle);
    cy.get(agenda.printContainer).contains(subcaseTitle1);
    cy.get(agenda.printContainer).contains(agendaitemIndex2);
    cy.get(agenda.printContainer).contains(subcaseTitle2);
    cy.get(agenda.printContainer).contains(subcaseTitle3);
  });

  it('should verify that you can compare agendas', () => {
    cy.visit('/vergadering/5EBA48CF95A2760008000006/agenda/f66c6d79-6ad2-49e2-af55-702df3a936d8/vergelijken');
    // compare Agenda B against Agenda C
    cy.get(agenda.compare.agendaLeft).click();
    cy.contains('Agenda B').click();
    cy.get(agenda.compare.agendaRight).click();
    cy.contains('Agenda C').click();
    cy.get(agenda.compare.agendaitemLeft).should('have.length', 4);
    cy.get(agenda.compare.agendaitemRight).should('have.length', 4);
    cy.get(agenda.compare.announcementLeft).should('have.length', 0);
    cy.get(agenda.compare.announcementRight).should('have.length', 1);
    cy.get(agenda.compare.showChanges).click();
    cy.get(agenda.compare.agendaitemLeft).should('have.length', 1);
    cy.get(agenda.compare.agendaitemRight).should('have.length', 1);
    cy.get(agenda.compare.announcementLeft).should('have.length', 0);
    cy.get(agenda.compare.announcementRight).should('have.length', 1);
    cy.contains(subcaseTitle1);
    cy.contains(subcaseTitle3);
    cy.contains(approvalTitle).should('not.exist');
    cy.contains(agendaitemIndex2).should('not.exist');
    cy.contains(subcaseTitle2).should('not.exist');
    cy.get(agenda.compare.showChanges).click();

    // compare Agenda C against Agenda D
    cy.get(agenda.compare.agendaLeft).click();
    cy.contains('Agenda C').click();
    cy.get(agenda.compare.agendaRight).click();
    cy.contains('Agenda D').click();
    cy.get(agenda.compare.agendaitemLeft).should('have.length', 4);
    cy.get(agenda.compare.agendaitemRight).should('have.length', 4);
    cy.get(agenda.compare.announcementLeft).should('have.length', 1);
    cy.get(agenda.compare.announcementRight).should('have.length', 1);
    cy.get(agenda.compare.showChanges).click();
    cy.get(agenda.compare.agendaitemLeft).should('have.length', 1);
    cy.get(agenda.compare.agendaitemRight).should('have.length', 1);
    cy.get(agenda.compare.announcementLeft).should('have.length', 1);
    cy.get(agenda.compare.announcementRight).should('have.length', 1);
    cy.contains(approvalTitle);
    cy.contains(subcaseTitle3);
    cy.contains(subcaseTitle1).should('not.exist');
    cy.contains(agendaitemIndex2).should('not.exist');
    cy.contains(subcaseTitle2).should('not.exist');

    cy.get(agenda.compare.showChanges).click();

    // compare Agenda D against Agenda E
    cy.get(agenda.compare.agendaLeft).click();
    cy.contains('Agenda D').click();
    cy.get(agenda.compare.agendaRight).click();
    cy.contains('Ontwerpagenda E').click();
    cy.get(agenda.compare.agendaitemLeft).should('have.length', 4);
    cy.get(agenda.compare.agendaitemRight).should('have.length', 4);
    cy.get(agenda.compare.announcementLeft).should('have.length', 1);
    cy.get(agenda.compare.announcementRight).should('have.length', 1);
    cy.get(agenda.compare.showChanges).click();
    cy.get(agenda.compare.agendaitemLeft).should('have.length', 0);
    cy.get(agenda.compare.agendaitemRight).should('have.length', 0);
    cy.get(agenda.compare.announcementLeft).should('have.length', 0);
    cy.get(agenda.compare.announcementRight).should('have.length', 0);
  });

  it('should assign an agenda-item to a minister and no longer under NO ASSIGNMENT', () => {
    cy.visit(agendaURL);
    cy.changeSelectedAgenda('Ontwerpagenda');
    // check if only 'Geen toekenning' is a header
    cy.get(agenda.agendaOverviewItemHeader)
      .should('have.length', 0);
    // TODO CHECK WITH USERS, should there be a mandatee header between approval and first item without mandatee
    // cy.get(agenda.agendaOverviewItemHeader).eq(0)
    //   .should('contain.text', 'Geen toekenning');
    cy.openDetailOfAgendaitem('Cypress test dossier 1 test stap 1');
    cy.addAgendaitemMandatee(0, -1, 0, 'Minister-president van de Vlaamse Regering');
    cy.clickReverseTab('Overzicht');
    cy.get(agenda.agendaOverviewItemHeader).eq(0)
      .should('contain.text', 'Minister-president van de Vlaamse Regering');
    cy.get(agenda.agendaOverviewItemHeader).should('have.length', 2);
  });
});
