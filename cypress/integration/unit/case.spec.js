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
    cy.route('GET', '/cases/**/subcases').as('getCaseSubCases');
    cy.route('POST', '/cases').as('createNewCase');
    cy.route('POST', '/subcases').as('createNewSubCase');
    cy.route('PATCH','/subcases/*').as('patchCheck');

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

    cy.visit('');
    
    cy.visit('/dossiers');
    cy.wait('@getCases', { timeout: 20000 });
    
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
      //TODO figure out why click does not always work w/o waiting or clicking twice (no xhr calls are made)
      cy.get('.vl-title').click();
      // cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubCases', { timeout: 12000 });


    cy.get('.vl-title--h4').parents('.vl-u-spacer-extended-bottom-l').as('subCaseParts').should('have.length' , 5);

    //Change the type
    cy.get('@subCaseParts').eq(0).within(() => {
    });

    //Change the themes
    cy.get('@subCaseParts').eq(1).within(() => {
    });

    //#region Change the mandatees
    cy.get('@subCaseParts').eq(2).within(() => {
      cy.get('a').click();
    });
    cy.get('.vlc-box a').contains('Minister toevoegen').click();
    cy.get('.mandatee-selector-container').click();
    cy.get('.ember-power-select-option').should('not.have.length', 1);
    cy.get('.ember-power-select-option').eq(0).click();
    cy.wait('@getMandatees', { timeout: 12000 });
    cy.get('.vlc-checkbox-tree').eq(0).within(() => {
      cy.get('.vl-checkbox').eq(0).click();
    });
    cy.get('.vlc-toolbar').within(() => {
      cy.contains('Toevoegen').click();
    });
    cy.get('@subCaseParts').eq(2).within(() => {
      cy.get('.vlc-toolbar')
      .contains('Opslaan')
      .click();
    });
    cy.wait('@patchCheck', { timeout: 20000 }).then(() => {
      cy.get('.vl-alert').contains('Gelukt');
    });
    //#endregion

    //The ise-code
    cy.get('@subCaseParts').eq(3).within(() => {
    });

    //The subcases
    cy.get('@subCaseParts').eq(4).within(() => {
    });

  });

});
  