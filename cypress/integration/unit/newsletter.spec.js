/* global context, before, cy, beforeEach, afterEach, it, Cypress */
// / <reference types="Cypress" />
import newsletter from '../../selectors/newsletter.selector';

/**
 * @description returns the current time in unix timestamp
 * @name currentTimestamp
 * @memberOf Cypress.Chainable#
 * @function
 * @returns {number} The current time in unix timestamp
 */
function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Test the KB functionality', () => {
  before(() => {
    cy.server();
  });

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO spec newsletterInfo/shouldtestFullWarningFlowOnKB has similar setup and tests the agendaitem part of the NOTA bis updates
  // TODO does that test belong in this spec file instead?

  it('should test the newsletter of an agenda', () => {
    // TODO, this setup contains some unneeded details like mandatees, which are not checked further on
    const testId = `testId=${currentTimestamp()}: `;
    const agendaDate = Cypress.moment().add(2, 'weeks')
      .day(3); // Next friday

    const case1TitleShort = `${testId}Cypress test dossier 1`;
    const type1 = 'Nota';
    const newSubcase1TitleShort = `${case1TitleShort} procedure`;
    const subcase1TitleLong = `${testId}Cypress test voor het aanmaken van een dossier (1) en procedurestap`;
    const subcase1Type = 'In voorbereiding';
    const subcase1Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case1TitleShort);
    cy.addSubcase(type1, newSubcase1TitleShort, subcase1TitleLong, subcase1Type, subcase1Name);
    cy.openSubcase(0);

    // TODO these next 2 lines do not matter for this test
    cy.changeSubcaseAccessLevel(false, true, 'Intern Overheid');
    cy.addSubcaseMandatee(0, 0, 0);

    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'Document dossier 1', fileType: 'Nota',
    };

    cy.addDocumentsToSubcase([file]);

    // Extra Document Version
    cy.addNewPieceToSubcase('Document dossier 1', file);

    const case2TitleShort = `${testId}Cypress test dossier 2`;
    const type2 = 'Nota';
    const newSubcase2TitleShort = `${case2TitleShort} procedure`;
    const subcase2TitleLong = `${testId}Cypress test voor het aanmaken van een dossier (2) en procedurestap`;
    const subcase2Type = 'In voorbereiding';
    const subcase2Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case2TitleShort);

    cy.addSubcase(type2, newSubcase2TitleShort, subcase2TitleLong, subcase2Type, subcase2Name);
    cy.openSubcase(0);
    // TODO these next 3 lines do not matter for this test
    cy.changeSubcaseAccessLevel(false, false, 'Intern Overheid');
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);
    cy.addDocumentsToSubcase([{
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'Document dossier 2', fileType: 'Nota',
    }]);

    // TODO why wait ?
    cy.wait(3000);

    cy.createAgenda('Ministerraad', agendaDate, 'Test Kort bestek toevoegen').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      cy.openAgendaForDate(agendaDate);
      cy.addAgendaitemToAgenda(case1TitleShort, false);
      cy.addAgendaitemToAgenda(case2TitleShort, false);

      // TODO does formally ok status matter for this test ?
      cy.setFormalOkOnItemWithIndex(0);
      cy.setFormalOkOnItemWithIndex(1);
      cy.setFormalOkOnItemWithIndex(2);

      // TODO this route is flaky, check why, used general wait instead
      // cy.route('/document-containers?**').as('getDocumentContainerOfPieces');
      // TODO use visit or action in agenda? visit is faster but then why not visit ".../nota-updates"
      cy.visit(`/vergadering/${result.meetingId}/kort-bestek`);
      cy.get(newsletter.newsletterHeaderOverview.notaUpdates).click();
      cy.wait(2000);
      // cy.wait('@getDocumentContainerOfPieces');
      cy.contains(case1TitleShort).should('exist');
      cy.contains(case2TitleShort).should('not.exist');
    });
  });
});
