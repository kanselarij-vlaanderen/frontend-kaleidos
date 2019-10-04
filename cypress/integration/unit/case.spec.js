/* eslint-disable no-undef */
/// <reference types="Cypress" />


context('Case test', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  it.only('should create a new case and add a subcase', () => {

    cy.server()
    cy.route('GET', '/cases?**').as('getCases');
    cy.route('GET', '/subcases?**').as('getSubcases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
    cy.route('PATCH','/subcases/*').as('patchSubcase');

    const caseTitleShort= 'Cypress test';
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
    cy.changeSubcaseAccessLevel(caseTitleShort, true, 'Intern Overheid', 'Cypress test nieuwere titel', 'Cypress test nieuwere lange titel');

    //Add the themes
    cy.addSubcaseThemes([0, 5 , 10]);
    cy.addSubcaseThemes(['Energie', 'Jeugd' , 'Gezin']);

    //Add the mandatees
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);

    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR.270919/1', fileType: 'Nota'}]);

  });

  it('should propose a subcase to an new agenda', () => {
    cy.server()
    cy.route('GET', '/cases?**').as('getCases');
    cy.route('GET', '/subcases?**').as('getSubcases');
    cy.route('POST', '/agendas').as('createNewAgenda');
    cy.route('POST', '/agendaitems').as('createNewAgendaItems');

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 5).set('hour', 20).set('minute', 20);

    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test documenten toevoegen').then((meetingId) => {
      cy.verifyAlertSuccess();
      cy.wait('@createNewAgenda',{ timeout: 20000 });
      cy.wait('@createNewAgendaItems',{ timeout: 20000 });

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

      cy.deleteAgenda(agendaDate, meetingId);

    });
    
  });

});

