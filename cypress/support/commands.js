
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

//#region Agenda commands

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

Cypress.Commands.add('openAgendaForDate', (searchDate) => {
  cy.route('GET', `/meetings/**`).as('getMeetings')

  cy.visit('');
  cy.get('.vlc-input-field-group-wrapper--inline').within(() => {
    cy.get('.vl-input-field').type(searchDate);
    cy.get('.vl-button').click();
  });
  cy.wait('@getMeetings', { timeout: 10000 });
  cy.get('.vl-data-table > tbody > :nth-child(1) > .vl-u-align-center > .vl-button > .vl-button__icon').click()
});

//#endregion

//#region Case commands

Cypress.Commands.add('createCase', (confidential, shortTitle) => {
  cy.route('GET', '/cases?**').as('getCases');
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
});

Cypress.Commands.add('addSubCase', (caseShortTitle, type, newShortTitle, longTitle, step, stepName) => {
  cy.route('GET', '/cases?*').as('getCases');
  cy.route('GET', '/subcases?*').as('getSubCases');

  //TODO
  // cy.visit("/dossiers").wait('@getCases', { timeout: 12000 })
  // cy.get('td').contains(caseShortTitle).parents('tr').within(() => {
  //   cy.get('.vl-button').get('.vl-vi-nav-right').click();
  // });
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

//#endregion

//#region Subcase commands

/**
 * Changes the subcase access levels and titles when used in the subcase view (/dossiers/..id../overzicht)
 * shortTitle is required to find the dom element
 * 
 * @param {string} shortTitle - Current title of the subcase (same as case title unless already renamed)
 * @param {boolean} [confidentialityChange] -Will change the current confidentiality if true
 * @param {string} [accessLevel] -Access level to set, must match exactly with possible options in dropdown
 * @param {string} [newShortTitle] - new short title for the subcase
 * @param {string} [newLongTitle] - new long title for the subcase
 */
Cypress.Commands.add('changeSubCaseAccessLevel', (shortTitle, confidentialityChange, accessLevel, newShortTitle, newLongTitle) => {
  cy.route('PATCH','/subcases/*').as('patchSubCase');

  cy.get('.vl-title--h4').contains(shortTitle).parents('.vl-u-spacer-extended-bottom-l').within(() => {
    cy.get('a').click();
  });

  cy.get('.vl-form__group').as('subCaseAccessLevel');

  if(accessLevel) {
    cy.get('@subCaseAccessLevel').within(() => {
      cy.get('.ember-power-select-trigger').click();
    });
    cy.get('.ember-power-select-option').contains(accessLevel).click();
  }

  cy.get('@subCaseAccessLevel').within(() => {
    cy.get('.vlc-input-field-block').as('editCaseForm').should('have.length', 3);

    if(confidentialityChange) {
      cy.get('@editCaseForm').eq(0).within(() => {
        cy.get('.vl-checkbox--switch__label').click();
      });
    }
    if(newShortTitle) {
      cy.get('@editCaseForm').eq(1).within(() => {
        cy.get('.vl-textarea').click().clear().type(newShortTitle);
      });
    }
    if(newLongTitle) {
      cy.get('@editCaseForm').eq(2).within(() => {
        cy.get('.vl-textarea').click().clear().type(newLongTitle);
      });
    }

    cy.get('.vl-action-group > .vl-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubCase', { timeout: 20000 }).then(() => {
    cy.get('.vl-alert').contains('Gelukt');
  });
});

/**
 * Changes the themes of a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * 
 * @param {Array<Number|String>} themes - An array of theme names that must match exactly or an array of numbers that correspond to the checkboxes in themes 
 * 
 */
Cypress.Commands.add('addSubCaseThemes', (themes) => {
  cy.route('GET', '/themes').as('getThemes');
  cy.route('PATCH','/subcases/*').as('patchSubCase');
  cy.get('.vl-title--h4').contains(`Thema's`).parents('.vl-u-spacer-extended-bottom-l').as('subCaseTheme');

  cy.get('@subCaseTheme').within(() => {
    cy.get('a').click();
    cy.wait('@getThemes', { timeout: 12000 });
    themes.forEach(element => {
      if(isNaN(element)){
        cy.get('.vl-checkbox').contains(element).click();
      } else {
        cy.get('.vl-checkbox').eq(element).click();
      }
      
    });
    cy.get('.vl-action-group > .vl-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubCase', { timeout: 20000 }).then(() => {
    cy.get('.vl-alert').contains('Gelukt');
  });
});

Cypress.Commands.add('addSubCaseMandatee', (mandateeNumber, fieldNumber, domainNumber) => {
  cy.route('GET', '/mandatees?**').as('getMandatees');
  cy.route('GET', '/ise-codes/**').as('getIseCodes');
  cy.route('GET', '/government-fields/**').as('getGovernmentFields');
  cy.route('PATCH','/subcases/*').as('patchSubCase');

  cy.get('.vl-title--h4').contains(`Ministers en beleidsvelden`).parents('.vl-u-spacer-extended-bottom-l').as('subCaseMandatees');
  cy.get('@subCaseMandatees').within(() => {
    cy.get('a').click();
  });

  cy.get('.vlc-box a').contains('Minister toevoegen').click();
  cy.get('.mandatee-selector-container').click();
  cy.wait('@getMandatees', { timeout: 12000 });
  cy.get('.ember-power-select-option').should('not.have.length', 1);
  cy.get('.ember-power-select-option').eq(mandateeNumber).click();
  cy.wait('@getIseCodes', { timeout: 12000 });
  cy.wait('@getGovernmentFields', { timeout: 12000 });
  cy.get('.vlc-checkbox-tree').eq(fieldNumber).within(() => {
    cy.get('.vl-checkbox').eq(domainNumber).click();
  });
  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Toevoegen').click();
  });
  cy.get('@subCaseMandatees').within(() => {
    cy.get('.vlc-toolbar')
    .contains('Opslaan')
    .click();
  });
  cy.wait('@patchSubCase', { timeout: 20000 }).then(() => {
    cy.get('.vl-alert').contains('Gelukt');
  });
});

//#endregion

Cypress.Commands.add('addDocVersion', (docName) => {

});
