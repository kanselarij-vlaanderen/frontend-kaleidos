/// <reference types="Cypress" />

context('Case test', () => {
  before(() => {
    cy.login('Admin')
  })

  it('should create a new case and add a subcase', () => {

    cy.server()
      cy.route({
      method: 'PATCH',
      url: '/subcases/*',
    }).as('patchCheck')

    const dossierTitelKort= 'Cypress test 1'
    const type= 'Nota'
    const dossierTitelLang= 'Cypress test voor het aanmaken van een dossier en procedurestap'
    const procedureStap='In voorbereiding'
    const procedureNaam='Principiële goedkeuring m.h.o. op adviesaanvraag'

    cy.createCase(dossierTitelKort)

    cy.visit("")
    cy.contains('Dossiers').click()
    cy.wait(1000)
    
    cy.addSubCase(dossierTitelKort,type,dossierTitelKort,dossierTitelLang, procedureStap, procedureNaam)

    cy.wait(1000)
    cy.get('td').contains(dossierTitelKort).parents('tr').within(() => {
      cy.get('.vl-button').get('.vl-vi-nav-right').click()
    })
    cy.wait(1000)

    cy.get('.vlc-procedure-step a').eq(0).click()

    cy.get('h4').contains('Ministers en beleidsvelden').parents('.vl-u-spacer-extended-bottom-s').within(() => {
      cy.get('a').click()
    })
    cy.get('.vlc-box a').contains('Minister toevoegen').click()
    cy.get('.mandatee-selector-container').click()
    cy.get('.ember-power-select-option').should('not.have.length', 1)
    cy.get('.ember-power-select-option').eq(0).click()
    cy.wait(1000)
    cy.get('.vlc-checkbox-tree').eq(0).within(() => {
      cy.get('.vl-checkbox').eq(0).click()
    })

    cy.get('.vlc-toolbar').within(() => {
      cy.contains('Toevoegen').click()
    })
    
    cy.get('h4').contains('Ministers en beleidsvelden').parents('.vl-u-spacer-extended-bottom-l').within(() => {
      cy.get('.vlc-toolbar').contains('Opslaan').click().wait('@patchCheck').then((xhr) => {
        assert.isNotNull(xhr.response.body, 'PATCH success')
      })
    })
    
  })

})
  