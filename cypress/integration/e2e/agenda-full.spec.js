/* eslint-disable no-undef */
/*global context, before, it, cy, Cypress*/
/// <reference types="Cypress" />

context('Full test', () => {
  const testStart =  Cypress.moment();

  let testId;

  before(() => {
    cy.server();
    // cy.resetCache();
    cy.login('Admin');
  });

  it('Scenario where a complete agenda is created', () => {
    testId = 'testId=' + currentTimestamp() + ': ';

    //#region routes to be reused
    cy.route('GET', '/subcases?**').as('getSubcases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
    cy.route('POST', '/meetings').as('createNewMeeting');
    cy.route('POST', '/agendas').as('createNewAgenda');
    cy.route('POST', '/cases').as('createNewCase');
    cy.route('POST', '/subcases').as('createNewSubcase');
    cy.route('PATCH','/subcases/*').as('patchSubcase');

    //#endregion

    const agendaDate = Cypress.moment().add(2, 'weeks').day(3); // Next friday

    //#region create the meeting/agenda
    const location = testId + 'Zaal cypress in de wetstraat';

    cy.createAgenda('Ministerraad', agendaDate, location);
    // cy.openAgendaForDate(agendaDate);

    //#endregion

    //#region create the 1st case and subcase

    const case_1_TitleShort= testId + 'Cypress test dossier 1';
    const type_1= 'Nota';
    const newSubcase_1_TitleShort= case_1_TitleShort + ' procedure';
    const subcase_1_TitleLong= testId + 'Cypress test voor het aanmaken van een dossier (1) en procedurestap';
    const subcase_1_Type='In voorbereiding';
    const subcase_1_Name='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case_1_TitleShort);
    cy.addSubcase(type_1,newSubcase_1_TitleShort,subcase_1_TitleLong, subcase_1_Type, subcase_1_Name);
    cy.openSubcase(0);

    cy.changeSubcaseAccessLevel(false, case_1_TitleShort, true, 'Intern Overheid');
    cy.addSubcaseMandatee(0, 0, 0);

    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'Document dossier 1', fileType: 'Nota'}]);

    cy.proposeSubcaseForAgenda(agendaDate);

    //#endregion

    //#region create the 2nd case and subcase

    const case_2_TitleShort= testId + 'Cypress test dossier 2';
    const type_2= 'Nota';
    const newSubcase_2_TitleShort= case_2_TitleShort + ' procedure';
    const subcase_2_TitleLong= testId + 'Cypress test voor het aanmaken van een dossier (2) en procedurestap';
    const subcase_2_Type='In voorbereiding';
    const subcase_2_Name='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case_2_TitleShort);

    cy.addSubcase(type_2,newSubcase_2_TitleShort,subcase_2_TitleLong, subcase_2_Type, subcase_2_Name);
    cy.openSubcase(0);
    cy.changeSubcaseAccessLevel(false, case_2_TitleShort, false, 'Intern Overheid');
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    //#endregion

    //#region create the 3d case and subcase

    const caseTitle_3_Short= testId + 'Cypress test dossier 3';
    const type_3= 'Mededeling';
    const newSubcase_3_TitleShort= caseTitle_3_Short + ' procedure';
    const subcase_3_TitleLong= testId + 'Cypress test voor het aanmaken van een dossier (3) en procedurestap';
    const subcase_3_Type='In voorbereiding';
    const subcase_3_Name='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitle_3_Short);

    cy.addSubcase(type_3,newSubcase_3_TitleShort,subcase_3_TitleLong, subcase_3_Type, subcase_3_Name);

    cy.openSubcase();
    cy.changeSubcaseAccessLevel(true, caseTitle_3_Short, false, 'Intern Overheid');
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);
    //#endregion

    //#region check and approve the agenda > A
    cy.openAgendaForDate(agendaDate);

    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.setFormalOkOnItemWithIndex(2);
    cy.setFormalOkOnItemWithIndex(3);

    // cy.approveCoAgendaitem(case_2_TitleShort); // TODO approvals have low prior and need a refactor

    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'}]);
    cy.addNewDocumentVersionToMeeting('test pdf', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});

    cy.addAgendaitemToAgenda();
    cy.setFormalOkOnItemWithIndex(3); //new agendaitem
    cy.approveDesignAgenda();
    //#endregion

    //#endregion

    //#region create the 4th case and subcase

    //#endregion

    //#region create the 5th case and subcase

    //#endregion

    //#region create the 6th case and subcase

    //#endregion

    //#region check and approve the agenda > B

    //#endregion


  });

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
});
