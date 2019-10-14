/* eslint-disable no-undef */
/// <reference types="Cypress" />

context('Full test', () => {
  let testId;

  before(() => {
    cy.login('Admin')
  });

  it('Scenario where a complete agenda is created', () => {
    testId = 'testId=' + currentTimestamp() + ': '
    cy.server();

    //#region routes to be reused
    cy.route('GET', '/cases?**').as('getCases');
    cy.route('GET', '/subcases?**').as('getSubcases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
    cy.route('POST', '/meetings').as('createNewMeeting');
    cy.route('POST', '/agendas').as('createNewAgenda');
    cy.route('POST', '/agendaitems').as('createNewAgendaItems');
    cy.route('POST', '/cases').as('createNewCase');
    cy.route('POST', '/subcases').as('createNewSubcase');
    cy.route('PATCH','/subcases/*').as('patchSubcase');

    //#endregion

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 1).set('hour', 15).set('minute', 15);

    //#region create the meeting/agenda
    const location = testId + 'Zaal cypress in de wetstraat';

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, location).then(() => {
      cy.verifyAlertSuccess();
      cy.wait('@createNewAgenda',{ timeout: 20000 });
      cy.wait('@createNewAgendaItems',{ timeout: 20000 });

    });

    //#endregion

    //#region create the 1st case and subcase

    const case_1_TitleShort= testId + 'Cypress test dossier 1';
    const type_1= 'Nota';
    const newSubcase_1_TitleShort= case_1_TitleShort + ' procedure';
    const subcase_1_TitleLong= testId + 'Cypress test voor het aanmaken van een dossier (1) en procedurestap';
    const subcase_1_Type='In voorbereiding';
    const subcase_1_Name='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case_1_TitleShort).then(() => {
      cy.verifyAlertSuccess();
    });

    cy.addSubcase(type_1,newSubcase_1_TitleShort,subcase_1_TitleLong, subcase_1_Type, subcase_1_Name).then(() => {
      cy.verifyAlertSuccess();
    });
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });


    //Change the access level
    cy.changeSubcaseAccessLevel(false, case_1_TitleShort, true, 'Intern Overheid');

    //Add the themes
    cy.addSubcaseThemes([0, 5 , 10]);
    cy.addSubcaseThemes([1, 15 , 20]);

    //Add the mandatees
    cy.addSubcaseMandatee(0, 0, 0);

    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'Document dossier 1', fileType: 'Nota'}]);

    cy.get('.vlc-toolbar__item').within(() => {
      cy.contains('Documenten').click();
    })
    cy.proposeSubcaseForAgenda(agendaDate);

  //#endregion

    //#region create the 2nd case and subcase

    const case_2_TitleShort= testId + 'Cypress test dossier 2';
    const type_2= 'Nota';
    const newSubcase_2_TitleShort= case_2_TitleShort + ' procedure';
    const subcase_2_TitleLong= testId + 'Cypress test voor het aanmaken van een dossier (2) en procedurestap';
    const subcase_2_Type='In voorbereiding';
    const subcase_2_Name='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, case_2_TitleShort).then(() => {
      cy.verifyAlertSuccess();
    });

    cy.addSubcase(type_2,newSubcase_2_TitleShort,subcase_2_TitleLong, subcase_2_Type, subcase_2_Name).then(() => {
      cy.verifyAlertSuccess();
    });
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });


    //Change the access level
    cy.changeSubcaseAccessLevel(false, case_2_TitleShort, false, 'Intern Overheid');

    //Add the themes
    cy.addSubcaseThemes([2, 4 , 6]);

    //Add the mandatees
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

    cy.createCase(false, caseTitle_3_Short).then(() => {
      cy.verifyAlertSuccess();
    });

    cy.addSubcase(type_3,newSubcase_3_TitleShort,subcase_3_TitleLong, subcase_3_Type, subcase_3_Name).then(() => {
      cy.verifyAlertSuccess();
    });
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });

    
    //Change the access level
    cy.changeSubcaseAccessLevel(true, caseTitle_3_Short, false, 'Intern Overheid');

    //Add the themes
    // cy.addSubcaseThemes([8, 15 , 20, 25]); //no themes for a mededeling

    //Add the mandatees
    // cy.addSubcaseMandatee(2, 0, 0); //no mandatees for a mededeling

    cy.proposeSubcaseForAgenda(agendaDate);
    //#endregion
    
    //#region check and approve the agenda > A
    cy.openAgendaForDate(agendaDate);
    
    cy.setFormalOkOnAllItems();
    
    cy.approveCoAgendaitem(case_2_TitleShort);

    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'}]);
    cy.addNewDocumentVersion('test pdf', {folder: 'files', fileName: 'test', fileExtension: 'pdf'});

    cy.setFormalOkOnAllItems();
    cy.addRemarkToAgenda('Titel mededeling', 
      'mededeling omschrijving', 
      [{folder: 'files', fileName: 'test', fileExtension: 'pdf'}, {folder: 'files', fileName: 'test', fileExtension: 'txt'}]);
    cy.addAgendaitemToAgenda('Cypress test', false);
    cy.approveDesignAgenda();
    //#endregion

    //TODO Clean up data, implement db restore after test completed ?

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


});



// const generateRandomId = (amount)=>{
//   let chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
//   let string = '';
//   for(let i=0; i<amount; i++){
//       string += chars[Math.floor(Math.random() * chars.length)];
//   }
//   return string;
// }

const currentTimestamp = () => {
  return Cypress.moment().unix();
}