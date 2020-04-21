/* eslint-disable no-undef */
/// <reference types="Cypress" />

import toolbar from '../../selectors/toolbar.selectors';
import settings from '../../selectors/settings.selectors';
import form from '../../selectors/form.selectors';
import mandatee from '../../selectors/mandatees/mandateeSelectors';

context('Full test', () => {
  before(() => {
    cy.server();
    // cy.resetCache();
    cy.login('Admin');
  });

  it('should Add new minister', () => {
    cy.route('/');
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
    cy.get(settings.addMinister).should('exist').should('be.visible').click();
    cy.get(mandatee.addMandateeTitleContainer).should('exist').should('be.visible').within(() => {
      cy.get(form.formInput).should('exist').should('be.visible').type('Eerste minister van onderhoud');
    }).then(() => {
      cy.get(mandatee.addMandateeNicknameContainer).should('exist').should('be.visible').within(() => {
        cy.get(form.formInput).should('exist').should('be.visible').type('Eerste minister');
      })
    }).then(() => {
      cy.get(mandatee.addMandateeDropdownContainer).should('exist').should('be.visible').within(() => {
        cy.get('.ember-power-select-trigger').click().then(() => {
          cy.get('.ember-power-select-option').eq(0).click();
        })
      })
    })
  })




});
