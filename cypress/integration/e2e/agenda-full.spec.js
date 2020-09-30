/* eslint-disable no-undef */
/* global context, before, it, cy, Cypress */
// / <reference types="Cypress" />

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

context('Full test', () => {
  Cypress.moment();
  let testId;

  before(() => {
    cy.server();
    // cy.resetCache();
    cy.login('Admin');
  });

  it('Scenario where a complete agenda is created', () => {
    testId = `testId=${currentTimestamp()}: `;

    // #region routes to be reused
    cy.route('GET', '/subcases?**').as('getSubcases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('POST', '/meetings').as('createNewMeeting');
    cy.route('POST', '/agendas').as('createNewAgenda');
    cy.route('POST', '/cases').as('createNewCase');
    cy.route('POST', '/subcases').as('createNewSubcase');
    cy.route('PATCH', '/subcases/*').as('patchSubcase');

    // #endregion

    const agendaDate = Cypress.moment().add(2, 'weeks')
      .day(3); // Next friday

    // #region create the meeting/agenda
    const location = `${testId}Zaal cypress in de wetstraat`;

    cy.createAgenda('Ministerraad', agendaDate, location);
    // cy.openAgendaForDate(agendaDate);

    // #endregion

    // #region create the 1st case and subcase

    const case1TitleShort = `${testId}Cypress test dossier 1`;
    const type1 = 'Nota';
    const newSubcase1TitleShort = `${case1TitleShort} procedure`;
    const subcase1TitleLong = `${testId}Cypress test voor het aanmaken van een dossier (1) en procedurestap`;
    const subcase1Type = 'In voorbereiding';
    const subcase1Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case1TitleShort);
    cy.addSubcase(type1, newSubcase1TitleShort, subcase1TitleLong, subcase1Type, subcase1Name);
    cy.openSubcase(0);

    cy.changeSubcaseAccessLevel(false, case1TitleShort, true, 'Intern Overheid');
    cy.addSubcaseMandatee(0, 0, 0);

    cy.addDocumentsToSubcase([{
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'Document dossier 1', fileType: 'Nota',
    }]);

    cy.proposeSubcaseForAgenda(agendaDate);

    // #endregion

    // #region create the 2nd case and subcase

    const case2TitleShort = `${testId}Cypress test dossier 2`;
    const type2 = 'Nota';
    const newSubcase2TitleShort = `${case2TitleShort} procedure`;
    const subcase2TitleLong = `${testId}Cypress test voor het aanmaken van een dossier (2) en procedurestap`;
    const subcase2Type = 'In voorbereiding';
    const subcase2Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case2TitleShort);

    cy.addSubcase(type2, newSubcase2TitleShort, subcase2TitleLong, subcase2Type, subcase2Name);
    cy.openSubcase(0);
    cy.changeSubcaseAccessLevel(false, newSubcase2TitleShort, false, 'Intern Overheid');
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    // #endregion

    // #region create the 3d case and subcase

    const caseTitle3Short = `${testId}Cypress test dossier 3`;
    const type3 = 'Mededeling';
    const newSubcase3TitleShort = `${caseTitle3Short} procedure`;
    const subcase3TitleLong = `${testId}Cypress test voor het aanmaken van een dossier (3) en procedurestap`;
    const subcase3Type = 'In voorbereiding';
    const subcase3Name = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitle3Short);

    cy.addSubcase(type3, newSubcase3TitleShort, subcase3TitleLong, subcase3Type, subcase3Name);

    cy.openSubcase();
    cy.changeSubcaseAccessLevel(true, caseTitle3Short, false, 'Intern Overheid');
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);
    // #endregion

    // #region check and approve the agenda > A
    cy.openAgendaForDate(agendaDate);

    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.setFormalOkOnItemWithIndex(2);
    cy.setFormalOkOnItemWithIndex(3);

    // cy.approveCoAgendaitem(case_2_TitleShort); // TODO approvals have low prior and need a refactor

    cy.addDocumentsToAgenda([{
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    }]);
    cy.addNewPieceToMeeting('test pdf', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });
    cy.clickReverseTab('Overzicht');
    cy.addAgendaitemToAgenda();
    cy.setFormalOkOnItemWithIndex(3); // new agendaitem
    cy.approveDesignAgenda();
    // #endregion

    // #endregion

    // #region create the 4th case and subcase

    // #endregion

    // #region create the 5th case and subcase

    // #endregion

    // #region create the 6th case and subcase

    // #endregion

    // #region check and approve the agenda > B

    // #endregion
  });
});
