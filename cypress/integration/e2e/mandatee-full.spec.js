/* eslint-disable no-undef */
/// <reference types="Cypress" />

import toolbar from '../../selectors/toolbar.selectors';
import settings from '../../selectors/settings.selectors';
import form from '../../selectors/form.selectors';
import mandatee from '../../selectors/mandatees/mandateeSelectors';
import cases from '../../selectors/case.selectors';
import modal from '../../selectors/modal.selectors';
import agenda from '../../selectors/agenda.selectors';

context('Full test', () => {
  before(() => {
    cy.server();
    cy.resetCache();
    cy.resetSearch();
    cy.login('Admin');
  });

  it('should Add new minister', () => {
    const testId = 'testId=' + currentTimestamp() + ': ';

    cy.route('GET', ' /ise-codes/**').as('getIsecodes');
    cy.route('GET', ' /government-fields/**').as('getGovernmentfields');

    const PLACE = 'Brussel';
    const KIND = 'Ministerraad';
    const MONTH = 'maart';
    const YEAR = '2020';
    const DAY = '3';
    const agendaDate = Cypress.moment("2020-03-03").set({"hour": 10, "minute": 10});
    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const subcaseTitle1 = caseTitle + ' test stap 1';
    const subcaseTitle2 = caseTitle + ' test stap 2';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
    const files = [file];



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
      cy.createCase(false, caseTitle);
      cy.addSubcase('Nota',
        subcaseTitle1,
        'Cypress test voor het testen van toegevoegde documenten',
        'In voorbereiding',
        'Principiële goedkeuring m.h.o. op adviesaanvraag');
      cy.addSubcase('Nota',
        subcaseTitle2,
        'Cypress test voor het testen van toegevoegde agendapunten',
        'In voorbereiding',
        'Principiële goedkeuring m.h.o. op adviesaanvraag');
      cy.visit('/');
      cy.createDefaultAgenda(KIND, YEAR, MONTH, DAY, PLACE);

      // when toggling show changes  the agendaitem with a document added should show
      cy.openAgendaForDate(agendaDate);
      cy.addAgendaitemToAgenda(subcaseTitle1, false);
      cy.agendaItemExists(subcaseTitle1).click();
      cy.addSubcaseMandatee(0,-1,-1);
     cy.get(agenda.approveDesignAgenda).click();
      cy.get(modal.verify.save).click();
    });
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
    cy.get('[data-test-mandatee-edit="0"]').click();
    cy.selectDate('2020','maart','2',1)
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

  function currentMoment() {
    return Cypress.moment();
  }

});
