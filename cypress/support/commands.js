
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (name) => {
  cy.server().route('POST', '/mock/sessions').as('mockLogin');
  cy.visit('mock-login');
  cy.get('.grid', { timeout: 12000 }).within(() => {
    cy.contains(name).click()
      .wait('@mockLogin');
  });
});

Cypress.Commands.add('setDateInFlatpickr', (date, plusMonths) => {
  cy.get('.flatpickr-months').within(() => {
    for (let n = 0; n < plusMonths; n++) {
      cy.get('.flatpickr-next-month').click();
    }
  });
  cy.get('.flatpickr-days').within(() => {
    cy.get('.flatpickr-day').not('.prevMonthDay').not('.nextMonthDay').contains(date.date()).click();
  });
  cy.get('.flatpickr-time').within(() => {
    cy.get('.flatpickr-hour').type(date.hour());
    cy.get('.flatpickr-minute').type(date.minutes());
  });
});

Cypress.Commands.add('createAgenda', (kind, plusMonths, date, location) => {
  cy.visit('/');
  cy.get('.vlc-toolbar__item > .vl-button')
    .contains('Nieuwe agenda aanmaken')
    .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() =>{
    cy.get('.vlc-input-field-block').as('newAgendaForm').should('have.length', 3)
  });

  //#region Set the kind
  cy.get('@newAgendaForm').eq(0).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.contains(kind).click();
  //#endregion

  //#region Set the start date
  cy.get('@newAgendaForm').eq(1).within(() => {
    cy.get('.vl-datepicker').click();
  });
  cy.setDateInFlatpickr(date, plusMonths);
  //#endregion

  //Set the location
  cy.get('@newAgendaForm').eq(2).within(() => {
    cy.get('.vl-input-field').click().type(location);
  });

  cy.get('@dialog').within(()=> {
    cy.get('.vlc-toolbar__item').contains('Toevoegen').click();
  });
});

Cypress.Commands.add('createCase', (confidential, shortTitle) => {
  cy.server().route('GET', '/cases?**').as('getCases');
  cy.visit('/dossiers');
  cy.wait('@getCases', { timeout: 12000 });

  cy.get('.vlc-toolbar__item .vl-button')
  .contains('Nieuw dossier aanmaken')
  .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() =>{
    cy.get('.vlc-input-field-block').as('newCaseForm').should('have.length', 2);
  });

  //Set confidentiality
  if(confidential){
    cy.get('@newCaseForm').eq(0).within(() => {
      cy.get('.vl-checkbox--switch__label').click();
    });
  }
  
  //Set short title
  cy.get('@newCaseForm').eq(1).within(() => {
    cy.get('.vl-textarea').click().type(shortTitle);
  });

  cy.get('@dialog').within(()=> {
    cy.get('.vlc-toolbar__item > .vl-button').contains('Dossier aanmaken').click();
  });
})

Cypress.Commands.add('addSubCase', (caseShortTitle, type, newShortTitle, longTitle, step, stepName) => {
  cy.server();
  cy.route('GET', '/cases?*').as('getCases');
  cy.route('GET', '/subcases?*').as('getSubCases');

  cy.visit("/dossiers").wait('@getCases', { timeout: 12000 })
  cy.get('td').contains(caseShortTitle).parents('tr').within(() => {
    cy.get('.vl-button').get('.vl-vi-nav-right').click();
  });
  cy.wait('@getSubCases',{ timeout: 12000 });

  cy.get('.vlc-toolbar__item .vl-button')
  .contains('Procedurestap toevoegen')
  .click();

  cy.get('.vlc-input-field-block').should('have.length', 5);

  //Set the type
  cy.get('.vlc-input-field-block').eq(0).within(() => {
    cy.contains(type).click();
  });

  //Set the short title
  cy.get('.vlc-input-field-block').eq(1).within(() => {
    cy.get('.vl-textarea').click().clear().type(newShortTitle);
  });

  //Set the long title
  cy.get('.vlc-input-field-block').eq(2).within(() => {
    cy.get('.vl-textarea').click().type(longTitle);
  });

  //#region Set the step type
  cy.get('.vlc-input-field-block').eq(3).within(() => {
    cy.get('[role=button]').click();
  });
  cy.get('.ember-power-select-option').contains(step).click();
  //#endregion

  //#region Set the step name
  cy.get('.vlc-input-field-block').eq(4).within(() => {
    cy.get('[role=button]').click();
  });
  cy.get('.ember-power-select-option').contains(stepName).click();
  //#endregion
  
  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Procedurestap aanmaken').click();
  });
});
