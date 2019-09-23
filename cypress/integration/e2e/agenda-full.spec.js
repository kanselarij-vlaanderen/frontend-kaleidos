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
    cy.route('GET', '/subcases?**').as('getSubCases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('GET', '/cases/**/subcases').as('getCaseSubCases');
    cy.route('POST', '/meetings').as('createNewMeeting');
    cy.route('POST', '/agendas').as('createNewAgenda');
    cy.route('POST', '/agendaitems').as('createNewAgendaItems');
    cy.route('POST', '/cases').as('createNewCase');
    cy.route('POST', '/subcases').as('createNewSubCase');
    cy.route('PATCH','/subcases/*').as('patchSubCase');

    //#endregion

    //#region create the meeting/agenda
    const plusMonths = 1;
    const futureDate = Cypress.moment().add('month', plusMonths).set('date', 15).set('hour', 15).set('minute', 15);
    const searchDate = futureDate.date()+ '/' +(futureDate.month()+1) + '/' + futureDate.year();
    const location = 'Zaal cypress in de wetstraat';

    cy.createAgenda('Ministerraad', plusMonths, futureDate, testId + location);
    cy.wait('@createNewMeeting', { timeout: 20000 })
      .then(function (res) {
        const meetingId = res.responseBody.data.id;

        // cy.route('GET', `/meetings/${meetingId}/**`).as('getMeetingAgendas');
        cy.route('DELETE', `/meetings/${meetingId}`).as('deleteMeeting');
        cy.get('.vl-alert').contains('Gelukt');
        cy.wait('@createNewAgenda',{ timeout: 20000 });
        cy.wait('@createNewAgendaItems',{ timeout: 20000 });
      });
      //#endregion


    //#region create the 1st case and subcase

    // const dossierTitelKort= testId + 'Cypress test dossier 1';
    // const type= 'Nota';
    // const dossierTitelLang= testId + 'Cypress test voor het aanmaken van een dossier en procedurestap';
    // const procedureStap='In voorbereiding';
    // const procedureNaam='Principiële goedkeuring m.h.o. op adviesaanvraag';

    // cy.createCase(true, dossierTitelKort);
    // cy.wait('@createNewCase', { timeout: 20000 })
    //   .then((res) => {
    //     const caseId = res.responseBody.data.id;

    //     cy.get('.vl-alert').contains('Gelukt');
    //   });

    // cy.visit('');
    
    // cy.visit('/dossiers');
    // cy.wait('@getCases', { timeout: 20000 });
    
    // cy.addSubCase(dossierTitelKort,type,dossierTitelKort,dossierTitelLang, procedureStap, procedureNaam);
    // cy.wait('@createNewSubCase', { timeout: 20000 })
    //   .then((res) => {
    //     const subCaseId = res.responseBody.data.id;

    //     cy.get('.vl-alert').contains('Gelukt');
    //   });

    // //TODO only use when not creating a subcase
    // // cy.get('td').contains(dossierTitelKort).parents('tr').within(() => {
    // //   cy.get('.vl-button').get('.vl-vi-nav-right').click()
    // // })
    
    // cy.wait('@getSubCases', { timeout: 12000 });
    // cy.get('.vlc-procedure-step').as('subCasesList');
    // cy.get('@subCasesList').eq(0).within(() => {
    //   //TODO figure out why click does not always work w/o waiting or clicking twice (no xhr calls are made)
    //   cy.get('.vl-title').click();
    //   // cy.get('.vl-title').click();
    // })
    // cy.wait('@getCaseSubCases', { timeout: 12000 });


    // cy.get('.vl-title--h4').parents('.vl-u-spacer-extended-bottom-l').as('subCaseParts').should('have.length' , 5);

    // //Change the type
    // cy.get('@subCaseParts').eq(0).within(() => {
    // });

    // //Change the themes
    // cy.get('@subCaseParts').eq(1).within(() => {
    // });

    // //#region Add the mandatees
    // cy.addSubCaseMandatee(1, 0, 0);
    // //#endregion

    // //The ise-code
    // cy.get('@subCaseParts').eq(3).within(() => {
    // });

    // //The subcases
    // cy.get('@subCaseParts').eq(4).within(() => {
    // });

  //#endregion

  //#region create the 2nd case and subcase

  //#endregion

  //#region create the 3d case and subcase

  //#endregion
  
  //#region check and approve the agenda > A
  cy.openAgendaForDate(searchDate);
  // cy.wait('@getMeetingAgendas', { timeout: 20000 });

  //TODO temp to clean up data, implement after test completed ?
  //#region delete agenda
  // cy.get('.vl-data-table > tbody > :nth-child(1) > .vl-u-align-center > .vl-button > .vl-button__icon').click()
  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click()
  cy.get('.vl-popover__link-list__item--action-danger > .vl-link')
    .contains('Agenda verwijderen')
    .click()
    .wait('@deleteMeeting')
    .get('.vl-alert').contains('Gelukt');
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



const generateRandomId = (amount)=>{
  let chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let string = '';
  for(let i=0; i<amount; i++){
      string += chars[Math.floor(Math.random() * chars.length)];
  }
  return string;
}

const currentTimestamp = () => {
  return Cypress.moment().unix();
}