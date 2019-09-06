
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
  cy.visit('mock-login')
  cy.get('.grid',{timeout: 12000}).within(() => {
      cy.contains(name).click()
      .wait('@mockLogin');
  })
})

Cypress.Commands.add('createAgenda', (kind, plusMonths, date, location) => {
  cy.visit('')
  cy.get('.vlc-page-header__title').should('be', 'Agenda\'s')
  cy.contains('Nieuwe agenda aanmaken').click()
  cy.get('.vl-modal-dialog').contains('Aard').parents('.vlc-input-field-block').within(() => {
      cy.get('[role=button]').click()
      
    })
  
  cy.contains(kind).click()

  cy.get('.vl-modal-dialog').contains('Start datum').parents('.vlc-input-field-block').within(() => {
    cy.get('.vl-datepicker').click()
  })

  cy.get('.flatpickr-months').within(() => {
      for(let n= 0; n<plusMonths; n++){
          cy.get('.flatpickr-next-month').click()
      }
  })

  cy.get('.flatpickr-days').within(() => {
    cy.get('.flatpickr-day').not('.prevMonthDay').not('.nextMonthDay').contains(date.date()).click()
  })

  cy.get('.flatpickr-time').within(() => {
    cy.get('.flatpickr-hour').type(date.hour())
    cy.get('.flatpickr-minute').type(date.minutes())
  })

  cy.get('.vl-modal-dialog').within(() => {
    cy.contains('Plaats van de vergadering').parent().parent().within(() => {
      cy.get('input').click().type(location)
      
    })
  })
  cy.get('button').contains('Toevoegen').click()
})

Cypress.Commands.add('createCase', (shortTitle) => {
  cy.visit("/dossiers")
  cy.wait(1000)

  cy.contains('Nieuw dossier aanmaken').click()

  cy.get('.vl-modal-dialog').contains('Korte titel dossier').parents('.vlc-input-field-block').within(() => {
    cy.get('.vl-textarea').click().type(shortTitle)
  })

  cy.get('button').contains('Dossier aanmaken').click()
})

Cypress.Commands.add('addSubCase', (caseShortTitle, type, newShortTitle, longTitle, step, stepName ) => {
  cy.server().route('GET', '/cases?*').as('getCases');
  cy.visit("/dossiers").wait('@getCases')
  cy.get('td').contains(caseShortTitle).parents('tr').within(() => {
    cy.get('.vl-button').get('.vl-vi-nav-right').click()
  })
  cy.wait(1000)
  cy.url().should('include', '/deeldossiers')
  cy.contains('Procedurestap toevoegen').click()

  cy.get('.vlc-input-field-block').should('have.length', 5)

  cy.get('.vlc-input-field-block').eq(0).within(() => {
      cy.contains(type).click()
  })

  cy.get('.vlc-input-field-block').eq(1).within(() => {
      cy.get('.vl-textarea').click().clear().type(newShortTitle)
  })

  cy.get('.vlc-input-field-block').eq(2).within(() => {
      cy.get('.vl-textarea').click().type(longTitle)
  })

  cy.get('.vlc-input-field-block').eq(3).within(() => {
      cy.get('[role=button]').click()
  })
  cy.get('.ember-power-select-option').contains(step).click()

  cy.get('.vlc-input-field-block').eq(4).within(() => {
      cy.get('[role=button]').click()
  })
  cy.get('.ember-power-select-option').contains(stepName).click()

  cy.get('.vlc-toolbar').within(() => {
      cy.contains('Procedurestap aanmaken').click()
  })
})
