/* eslint-disable no-undef */
// / <reference types="Cypress" />

import settings from '../../selectors/settings.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import dependency from '../../selectors/dependency.selectors';
import utils from '../../selectors/utils.selectors';

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
    const KIND = 'Ministerraad';

    const agendaDate = Cypress.moment().add(1, 'weeks')
      .day(3);
    const caseTitle = `testId=${currentTimestamp()}: Cypress test dossier 1`;
    const subcaseTitle1 = `${caseTitle} test stap 1`;
    // const subcaseTitle2 = `${caseTitle} test stap 2`;
    const ministerTitle = 'Eerste minister van onderhoud';
    const ministerNickName = 'Eerste minister';

    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    cy.route('GET', '/ise-codes?sort=name').as('getIseCodes');
    cy.get(settings.ministers.add)
      .click();
    cy.wait('@getIseCodes', {
      timeout: 30000,
    });
    // TODO use input fields directly (after au refactor)
    // TODO KAS-2693
    cy.get(mandatee.createMandatee.titleContainer).within(() => {
      cy.get(utils.vlFormInput).type(ministerTitle);
    });
    cy.get(mandatee.createMandatee.nicknameContainer).within(() => {
      cy.get(utils.vlFormInput).type(ministerNickName);
    });
    cy.get(mandatee.personSelector.personDropdown).within(() => {
      cy.get(dependency.emberPowerSelect.trigger)
        .scrollIntoView()
        .click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Liesbeth Homans')
      .scrollIntoView()
      .click();

    cy.get(mandatee.createMandatee.iseCodeContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger)
        .scrollIntoView()
        .click();
    });

    cy.get(dependency.emberPowerSelect.option).contains('Aanvullend net')
      .click();
    cy.get(mandatee.createMandatee.iseCodeContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger)
        .scrollIntoView()
        .click();
    });

    cy.get(utils.vlDatepicker).eq(0)
      .click();
    cy.setDateInFlatpickr(agendaDate);

    cy.route('POST', '/mandatees').as('postMandateeData');
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@postMandateeData');

    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda(KIND, agendaDate, 'locatie');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.addSubcaseMandatee(0, -1, -1, ministerTitle);
    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveDesignAgenda();

    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    // TODO is there a better way to get this by name?
    // TODO KAS-2693 use find and row selector
    cy.contains(ministerNickName).parents('tr')
      .within(() => {
        cy.get(settings.ministers.mandatee.edit).click();
      });
    // TODO make this agendaDate minus x days or weeks, no set date
    const enddateForMandatee = Cypress.moment('2020-03-02').set({
      hour: 10, minute: 10,
    });

    cy.get(utils.vlDatepicker).eq(1)
      .click();
    cy.setDateInFlatpickr(enddateForMandatee);

    cy.get(mandatee.editMandatee.save).click();
    cy.wait(3000); // TODO KAS-2693 await patch call
    // TODO KAS-2693 Fix grammar einddatum
    cy.get(utils.vlModalVerify.save).contains('Eindatum aanpassen');
    cy.get(utils.vlModalVerify.cancel).click();
    cy.get(mandatee.editMandatee.cancel).click();
    cy.visit('/');
    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    // TODO is there a better way to get this by name?
    cy.contains(ministerNickName).parents('tr')
      .within(() => {
        cy.get(settings.ministers.mandatee.resign).click();
      });
    cy.wait(3000);
    // TODO Fix grammar of popup ?
    cy.get(mandatee.manageMandatee.changesAlert).should('be.visible');
    cy.get(utils.vlModalFooter.cancel).click();
    // TODO is there a better way to get this by name?
    cy.contains(ministerNickName).parents('tr')
      .within(() => {
        cy.get(settings.ministers.mandatee.delete).click();
      });
    cy.get(utils.vlModalVerify.save).click();
  });
});
