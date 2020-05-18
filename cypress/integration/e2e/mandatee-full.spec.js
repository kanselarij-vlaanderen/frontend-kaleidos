/* eslint-disable no-undef */
/// <reference types="Cypress" />

import toolbar from '../../selectors/toolbar.selectors';
import settings from '../../selectors/settings.selectors';
import form from '../../selectors/form.selectors';
import mandatee from '../../selectors/mandatees/mandateeSelectors';
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
    cy.route('GET', '/mandatee-service/**').as('getMandateeIsCompetentOnFutureAgendaItem');
    const KIND = 'Ministerraad';
    const plusMonths = 3;

    const agendaDate = currentMoment().add('month', plusMonths).set('date', 3).set('hour', 20).set('minute', 20);
    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const subcaseTitle1 = caseTitle + ' test stap 1';
    const subcaseTitle2 = caseTitle + ' test stap 2';

    cy.route('/');
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
    cy.route('GET', '/ise-codes?sort=name').as('getIseCodesMinister');
    cy.get(settings.addMinister).should('exist').should('be.visible').click();
    cy.wait('@getIseCodesMinister', { timeout: 60000 });
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

    cy.get('.vl-datepicker').eq(0).click();
    cy.setDateInFlatpickr(agendaDate, plusMonths);

    cy.route('POST', '/mandatees').as('postMandateeData');
    cy.get(form.formSave).should('exist').should('be.visible').click();
    cy.wait('@postMandateeData');

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
      cy.createAgenda(KIND,3,agendaDate,"locatie");

      // when toggling show changes  the agendaitem with a document added should show
      cy.openAgendaForDate(agendaDate);
      cy.addAgendaitemToAgenda(subcaseTitle1, false);
      cy.openDetailOfAgendaitem(subcaseTitle1);
      cy.addSubcaseMandatee(0,-1,-1);
     cy.get(agenda.approveAgenda).click();
      cy.get(modal.verify.save).click();
    });
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
    cy.get('[data-test-mandatee-edit="0"]').click();
    const enddateForMandatee = Cypress.moment("2020-03-02").set({"hour": 10, "minute": 10});
    cy.get('.vl-datepicker').eq(1).click();
    cy.get(agenda.numInputWrapper).get(agenda.inputNumInputCurYear).eq(1).clear().type(enddateForMandatee.year(), {delay: 300});
    cy.get('.flatpickr-months').eq(1).within(() => {
      for (let n = 0; n < plusMonths; n++) {
        cy.get('.flatpickr-next-month').click();
      }
    });
    cy.get('.flatpickr-days').eq(1).within(() => {
      cy.get('.flatpickr-day').not('.prevMonthDay').not('.nextMonthDay').contains(enddateForMandatee.date()).click();
    });
    cy.get(form.formSave).should('exist').should('be.visible').click();
    cy.wait(3000);
    cy.get(modal.verify.save).should('exist').should('be.visible').contains('Eindatum aanpassen');
    cy.get(modal.verify.cancel).should('exist').should('be.visible').click();
    cy.get(mandatee.mandateeEditCancel).should('exist').should('be.visible').click();
    cy.route('/');
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
    cy.get('[data-test-mandatee-resign="0"]').click();
    cy.wait(3000);
    cy.get(mandatee.manageMandateeChangesAlert).should('exist').should('be.visible');
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
