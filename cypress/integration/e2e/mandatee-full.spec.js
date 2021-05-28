/* eslint-disable no-undef */
// / <reference types="Cypress" />

import toolbar from '../../selectors/toolbar.selectors';
import settings from '../../selectors/settings.selectors';
import form from '../../selectors/form.selectors';
import mandatee from '../../selectors/mandatees/mandateeSelectors';
import modal from '../../selectors/modal.selectors';

context('Full test for creating mandatees', () => {
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

  before(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should add new minister', () => {
    cy.visit('/');
    cy.route('GET', '/mandatee-service/**').as('getMandateeIsCompetentOnFutureAgendaitem'); // not used ..
    const KIND = 'Ministerraad';

    const agendaDate = Cypress.moment().add(1, 'weeks')
      .day(3);
    const caseTitle = `testId=${currentTimestamp()}: Cypress test dossier 1`;
    const subcaseTitle1 = `${caseTitle} test stap 1`;
    // const subcaseTitle2 = `${caseTitle} test stap 2`;
    const ministerTitle = 'Eerste minister van onderhoud';
    const ministerNickName = 'Eerste minister';

    cy.get(toolbar.mHeader.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    cy.route('GET', '/ise-codes?sort=name').as('getIseCodes');
    cy.get(settings.addMinister).should('exist')
      .should('be.visible')
      .click();
    cy.wait('@getIseCodes', {
      timeout: 30000,
    });
    // TODO use input fields directly (after au refactor)
    cy.get(mandatee.createMandatee.titleContainer).should('exist')
      .should('be.visible')
      .within(() => {
        cy.get(form.formInput).should('exist')
          .should('be.visible')
          .type(ministerTitle);
      });
    cy.get(mandatee.createMandatee.nicknameContainer).should('exist')
      .should('be.visible')
      .within(() => {
        cy.get(form.formInput).should('exist')
          .should('be.visible')
          .type(ministerNickName);
      });
    cy.get(mandatee.personSelector.personDropdown).should('exist')
      .should('be.visible')
      .within(() => {
        cy.get('.ember-power-select-trigger').scrollIntoView()
          .click();
      });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Liesbeth Homans').scrollIntoView()
          .click();
      });

    cy.get(mandatee.createMandatee.iseCodeContainer).should('exist')
      .should('be.visible')
      .within(() => {
        cy.get('.ember-power-select-trigger').scrollIntoView()
          .click();
      });

    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Aanvullend net').click();
        cy.get(mandatee.createMandatee.iseCodeContainer).should('exist')
          .should('be.visible')
          .within(() => {
            cy.get('.ember-power-select-trigger').scrollIntoView()
              .click();
          });
      });

    cy.get('.vl-datepicker').eq(0)
      .click();
    cy.setDateInFlatpickr(agendaDate);

    cy.route('POST', '/mandatees').as('postMandateeData');
    cy.get(form.formSave).should('exist')
      .should('be.visible')
      .click();
    cy.wait('@postMandateeData');

    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    // cy.addSubcase('Nota',
    //   subcaseTitle2,
    //   'Cypress test voor het testen van toegevoegde agendapunten',
    //   'In voorbereiding',
    //   'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda(KIND, agendaDate, 'locatie');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.addSubcaseMandatee(0, -1, -1, ministerTitle);
    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveDesignAgenda();

    cy.get(toolbar.mHeader.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    cy.contains(ministerNickName).parents('tr')
      .within(() => {
        cy.get(settings.mandateeEdit).click();
      });
    // TODO make this agendaDate minus x days or weeks, no set date
    const enddateForMandatee = Cypress.moment('2020-03-02').set({
      hour: 10, minute: 10,
    });

    cy.get('.vl-datepicker').eq(1)
      .click();
    cy.setDateInFlatpickr(enddateForMandatee);

    cy.get(mandatee.editMandatee.save).should('exist')
      .should('be.visible')
      .click();
    cy.wait(3000);
    // TODO Fix grammar einddatum
    cy.get(modal.verify.save).should('exist')
      .should('be.visible')
      .contains('Eindatum aanpassen');
    cy.get(modal.verify.cancel).should('exist')
      .should('be.visible')
      .click();
    cy.get(mandatee.editMandatee.cancel).should('exist')
      .should('be.visible')
      .click();
    cy.visit('/');
    cy.get(toolbar.mHeader.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    // TODO index is risky business
    cy.get('[data-test-mandatee-resign="0"]').click();
    cy.wait(3000);
    // TODO Fix grammar of popup ?
    cy.get(mandatee.manageMandateeChangesAlert).should('exist')
      .should('be.visible');
    cy.get(form.formCancelButton).click();
    cy.contains(ministerNickName).parents('tr')
      .within(() => {
        cy.get(settings.mandateeDelete).click();
      });
    cy.get(modal.verify.save).click();
  });
});
