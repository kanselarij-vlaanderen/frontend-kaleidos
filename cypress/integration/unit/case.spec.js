/* eslint-disable no-undef */
/// <reference types="Cypress" />


context('Case test', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  it('should create a new case and add a subcase', () => {

    cy.server()
    cy.route('GET', '/cases?**').as('getCases');
    cy.route('GET', '/subcases?**').as('getSubcases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
    cy.route('PATCH','/subcases/*').as('patchSubcase');

    const caseTitleShort= 'Cypress test ' + currentTimestamp();
    const type= 'Nota';
    const newSubcaseTitleShort= caseTitleShort;
    const subcaseTitleLong= 'Cypress test voor het aanmaken van een dossier en procedurestap';
    const subcaseType='In voorbereiding';
    const subcaseName='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitleShort).then(() => {
      cy.verifyAlertSuccess();
    });

    cy.addSubcase(type,newSubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName).then(() => {
      cy.verifyAlertSuccess();
    });
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });


    //Change the access level
    cy.changeSubcaseAccessLevel(false, caseTitleShort, true, 'Intern Overheid', 'Cypress test nieuwere titel', 'Cypress test nieuwere lange titel');

    //Add the themes
    cy.addSubcaseThemes([0, 5 , 10]);

    //Add the mandatees
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);

    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR.270919/1', fileType: 'Nota'}]);

  // });

  // it('should propose a subcase to an new agenda', () => {
    // cy.server()
    cy.route('GET', '/cases?**').as('getCases');
    cy.route('GET', '/subcases?**').as('getSubcases');

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 5).set('hour', 20).set('minute', 20);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      
      cy.visit('/dossiers');
      cy.wait('@getCases', { timeout: 12000 });
      cy.get('td').eq(0).parents('tr').within(() => {
        cy.get('.vl-button').get('.vl-vi-nav-right').click();
      });

      cy.wait('@getSubcases', { timeout: 12000 });

      cy.get('.vlc-procedure-step').as('subcasesList');
      cy.get('@subcasesList').eq(0).within(() => {
        //TODO figure out why click does not always work w/o waiting or clicking twice (no xhr calls are made)
        cy.wait(500); 
        cy.get('.vl-title').click();
      });

      cy.proposeSubcaseForAgenda(agendaDate);

      cy.openAgendaForDate(agendaDate,meetingId);
      //TODO verify that subcase is an the agenda, check if all tabs are present and link to subcase is there
      cy.deleteAgenda(meetingId, true);

    });
    
  });

});

const currentTimestamp = () => {
  return Cypress.moment().unix();
}

