/// <reference types="Cypress" />

context('Agenda tests', () => {
  before(() => {
    cy.login('Admin')
  })
  
  
  it('should create a new agenda and then delete it', () => {
    cy.visit('')
    const plusMonths = 1
    const futureDate = Cypress.moment().add('month', plusMonths).set('date', 20).set('hour',20).set('minute',20)

    cy.createAgenda('Elektronische procedure', plusMonths, futureDate, 'Zaal oxford bij Cronos Leuven')
    cy.wait(500).get('.vl-alert').contains('Gelukt')
    const latestModified = Cypress.moment().format("DD-MM-YYYY HH:mm")

    cy.wait(2000)
    cy.get('td').contains(latestModified).parents('tr').within(() => {
        cy.contains(futureDate.format("DD.MM.YYYY")).should('exist')
        cy.contains('Ontwerpagenda A').should('exist')
      cy.get('.vl-button').click()
    })

    cy.contains('Acties').click()
    cy.contains('Agenda verwijderen').click()
    cy.wait(500).get('.vl-alert').contains('Gelukt')
  })

})
  