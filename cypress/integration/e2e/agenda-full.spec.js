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

    //#region create the meeting/agenda
    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 15).set('hour', 15).set('minute', 15);
    const location = testId + 'Zaal cypress in de wetstraat';

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, location).then((meetingId) => {
      cy.get('.vl-alert').contains('Gelukt');
      cy.wait('@createNewAgenda',{ timeout: 20000 });
      cy.wait('@createNewAgendaItems',{ timeout: 20000 });
      // cy.deleteAgenda(agendaDate, meetingId);

    });

    //#endregion

    //#region create the 1st case and subcase

    let caseTitleShort= testId + 'Cypress test dossier 1';
    let type= 'Nota';
    let newSubcaseTitleShort= caseTitleShort + ' procedure';
    let subcaseTitleLong= testId + 'Cypress test voor het aanmaken van een dossier (1) en procedurestap';
    let subcaseType='In voorbereiding';
    let subcaseName='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitleShort).then((caseId) => {
      cy.get('.vl-alert').contains('Gelukt');
    });

    cy.addSubcase(type,newSubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName).then((subcaseId) => {
      cy.get('.vl-alert').contains('Gelukt');
    });
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });


    //Change the access level
    cy.changeSubcaseAccessLevel(caseTitleShort, true, 'Intern Overheid');

    //Add the themes
    cy.addSubcaseThemes([0, 5 , 10]);
    cy.addSubcaseThemes(['Energie', 'haven' , 'Gezin']);

    //Add the mandatees
    cy.addSubcaseMandatee(0, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

  //#endregion

  //#region create the 2nd case and subcase

    caseTitleShort= testId + 'Cypress test dossier 2';
    type= 'Nota';
    newSubcaseTitleShort= caseTitleShort + ' procedure';
    subcaseTitleLong= testId + 'Cypress test voor het aanmaken van een dossier (2) en procedurestap';
    subcaseType='In voorbereiding';
    subcaseName='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitleShort).then((caseId) => {
      cy.get('.vl-alert').contains('Gelukt');
    });

    cy.addSubcase(type,newSubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName).then((subcaseId) => {
      cy.get('.vl-alert').contains('Gelukt');
    });
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });


    //Change the access level
    // cy.changeSubcaseAccessLevel(caseTitleShort, true, 'Intern Overheid');

    //Add the themes
    cy.addSubcaseThemes([2, 4 , 6]);
    // cy.addSubcaseThemes(['Energie', 'haven' , 'Gezin']);

    //Add the mandatees
    cy.addSubcaseMandatee(1, 0, 0);
    // cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

  //#endregion

  //#region create the 3d case and subcase

    caseTitleShort= testId + 'Cypress test dossier 3';
    type= 'Mededeling';
    newSubcaseTitleShort= caseTitleShort + ' procedure';
    subcaseTitleLong= testId + 'Cypress test voor het aanmaken van een dossier (2) en procedurestap';
    subcaseType='In voorbereiding';
    subcaseName='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitleShort).then((caseId) => {
      cy.get('.vl-alert').contains('Gelukt');
    });

    cy.addSubcase(type,newSubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName).then((subcaseId) => {
      cy.get('.vl-alert').contains('Gelukt');
    });
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });

    cy.proposeSubcaseForAgenda(agendaDate);


    //Change the access level
    // cy.changeSubcaseAccessLevel(caseTitleShort, true, 'Intern Overheid');

    //Add the themes
    // cy.addSubcaseThemes([2, 4 , 6]);
    // cy.addSubcaseThemes(['Energie', 'haven' , 'Gezin']);

    //Add the mandatees
    // cy.addSubcaseMandatee(1, 0, 0);
    // cy.addSubcaseMandatee(2, 0, 0);

  //#endregion
  
  //#region check and approve the agenda > A
  cy.openAgendaForDate(agendaDate);
  cy.contains('Documenten').click();
  cy.addDocVersion([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'}]);

  //#endregion

  //TODO temp to clean up data, implement db restore after test completed ?
  //#region delete agenda
  // cy.deleteAgenda(agendaDate);
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