/* eslint-disable no-undef */
/// <reference types="Cypress" />

import toolbar from '../../selectors/toolbar.selectors';
import settings from '../../selectors/settings.selectors';
import form from '../../selectors/form.selectors';
import mandatee from '../../selectors/mandatees/mandateeSelectors';
import modal from '../../selectors/modal.selectors';

context('Full test', () => {
  before(() => {
    cy.server();
    // cy.resetCache();
    // cy.resetSearch();
    cy.login('Admin');
  });

  it('should Add new minister', () => {
    const testId = 'testId=' + currentTimestamp() + ': ';

    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const JANUARI = 'maart';
    const YEAR = '2020';
    const DAY = '3';

    const caseTitle_3_Short= testId + 'Cypress test dossier 3';
    const type_3= 'Mededeling';
    const newSubcase_3_TitleShort= caseTitle_3_Short + ' procedure';
    const subcase_3_TitleLong= testId + 'Cypress test voor het aanmaken van een dossier (3) en procedurestap';
    const subcase_3_Type='In voorbereiding';
    const subcase_3_Name='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.route('/');
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
    cy.get(settings.addMinister).should('exist').should('be.visible').click();
    cy.get(mandatee.addMandateeTitleContainer).should('exist').should('be.visible').within(() => {
      cy.get(form.formInput).should('exist').should('be.visible').type('Eerste minister van onderhoud');
    });
    cy.get(mandatee.addMandateeNicknameContainer).should('exist').should('be.visible').within(() => {
      cy.get(form.formInput).should('exist').should('be.visible').type('Eerste minister');
    });
    cy.get(mandatee.addMandateeDropdownContainer).should('exist').should('be.visible').within(() => {
      cy.get('.ember-power-select-trigger').click();
    });
    cy.get('.ember-power-select-option').should('exist').then(() => {
      cy.contains('Liesbeth Homans').click();
    });

    cy.get(mandatee.addMandateeIseCodeDropdownContainer).should('exist').should('be.visible').within(() => {
      cy.get('.ember-power-select-trigger').click();
    });
    cy.get('.ember-power-select-option').should('exist').then(() => {
      cy.contains('Aanvullend net').click();
      cy.get(mandatee.addMandateeIseCodeDropdownContainer).should('exist').should('be.visible').within(() => {
        cy.get('.ember-power-select-trigger').click();
      });
    });
    cy.selectDate('2020','maart','1');
    cy.get(form.formSave).should('exist').should('be.visible').click();
    cy.visit('/').then(()=> {
      cy.createDefaultAgenda(KIND,YEAR,JANUARI,DAY,PLACE).then(() => {
        const agendaDate = Cypress.moment("2020-03-03").set({"hour": 10, "minute": 10});
        cy.openAgendaForDate(agendaDate);
      });
    });

    cy.createCase(false, caseTitle_3_Short);
    cy.addSubcase(type_3,newSubcase_3_TitleShort,subcase_3_TitleLong, subcase_3_Type, subcase_3_Name);

  });


  /**
   * @description returns the current time in unix timestamp
   * @name currentTimestamp
   * @memberOf Cypress.Chainable#
   * @function
   * @returns {number} The current time in unix timestamp
   */
  function currentTimestamp() {
    return Cypress.moment().unix();
  }

});
