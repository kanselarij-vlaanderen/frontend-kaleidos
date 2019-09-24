/// <reference types="Cypress" />


context('Case test', () => {
  before(() => {
    cy.login('Admin')
  })

  it('should create a new case and add a subcase', () => {

    cy.server()
    cy.route('GET', '/cases?**').as('getCases');
    cy.route('GET', '/subcases?**').as('getSubCases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('GET', '/cases/**/subcases').as('getCaseSubCases');
    cy.route('POST', '/cases').as('createNewCase');
    cy.route('POST', '/subcases').as('createNewSubCase');
    cy.route('PATCH','/subcases/*').as('patchSubCase');

    const dossierTitelKort= 'Cypress test';
    const type= 'Nota';
    const dossierTitelLang= 'Cypress test voor het aanmaken van een dossier en procedurestap';
    const procedureStap='In voorbereiding';
    const procedureNaam='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(true, dossierTitelKort);
    cy.wait('@createNewCase', { timeout: 20000 })
      .then((res) => {
        const caseId = res.responseBody.data.id;

        cy.get('.vl-alert').contains('Gelukt');
      });

    // cy.visit('');
    
    // cy.visit('/dossiers');
    // cy.wait('@getCases', { timeout: 20000 });
    
    cy.addSubCase(dossierTitelKort,type,dossierTitelKort,dossierTitelLang, procedureStap, procedureNaam);
    cy.wait('@createNewSubCase', { timeout: 20000 })
      .then((res) => {
        const subCaseId = res.responseBody.data.id;

        cy.get('.vl-alert').contains('Gelukt');
      });

    //TODO only use when not creating a subcase
    // cy.get('td').contains(dossierTitelKort).parents('tr').within(() => {
    //   cy.get('.vl-button').get('.vl-vi-nav-right').click()
    // })
    
    cy.wait('@getSubCases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subCasesList');
    cy.get('@subCasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubCases', { timeout: 12000 });


    //Change the access level
    cy.changeSubCaseAccessLevel(dossierTitelKort, true, 'Intern Overheid', 'Cypress test nieuwere titel', 'Cypress test nieuwere lange titel');

    //Add the themes
    cy.addSubCaseThemes([0, 5 , 10]);
    cy.addSubCaseThemes(['Energie', 'haven' , 'Gezin']);

    //Add the mandatees
    cy.addSubCaseMandatee(1, 0, 0);

  });

});
  