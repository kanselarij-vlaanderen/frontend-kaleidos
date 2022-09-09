/* eslint-disable no-undef */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import settings from '../../selectors/settings.selectors';
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
    return Cypress.dayjs().unix();
  }

  before(() => {
    cy.login('Admin');
  });

  // TODO-mandateeThemis After themis migration, creating of mandatee has been disabled
  // TODO decide if we want to keep this test for future reenabling or just remove, many selectors no longer exist
  xit('should add new minister', () => {
    cy.visit('/overzicht?size=2');
    const KIND = 'Ministerraad';

    const agendaDate = Cypress.dayjs().add(1, 'weeks')
      .day(3);
    const caseTitle = `testId=${currentTimestamp()}: Cypress test dossier 1`;
    const subcaseTitle1 = `${caseTitle} test stap 1`;
    // const subcaseTitle2 = `${caseTitle} test stap 2`;
    const ministerTitle = 'Eerste minister van onderhoud';
    const ministerNickName = 'Eerste minister';

    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    cy.intercept('GET', '/ise-codes?sort=name').as('getIseCodes');
    cy.get(settings.ministers.add).click();
    cy.wait('@getIseCodes', {
      timeout: 30000,
    });
    // We could use input fields directly (after au refactor)
    cy.get(mandatee.createMandatee.titleContainer).type(ministerTitle);
    cy.get(mandatee.createMandatee.nicknameContainer).type(ministerNickName);
    cy.get(mandatee.personSelector.personDropdown).find(dependency.emberPowerSelect.trigger)
      .scrollIntoView()
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Liesbeth Homans')
      .scrollIntoView()
      .click();

    cy.get(mandatee.createMandatee.iseCodeContainer).find(dependency.emberPowerSelect.trigger)
      .scrollIntoView()
      .click();

    cy.get(dependency.emberPowerSelect.option).contains('Aanvullend net')
      .click();
    cy.get(mandatee.createMandatee.iseCodeContainer).find(dependency.emberPowerSelect.trigger)
      .scrollIntoView()
      .click();

    cy.get(auk.datepicker).eq(0)
      .click();
    cy.setDateInFlatpickr(agendaDate);

    cy.intercept('POST', '/mandatees').as('postMandateeData');
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@postMandateeData');

    cy.createCase(caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda(KIND, agendaDate, 'locatie');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1);
    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.addSubcaseMandatee(0, 'Homans', ministerTitle);
    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveDesignAgenda();

    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    cy.contains(ministerNickName).parents(settings.ministers.sortableGroupRow)
      .find(settings.ministers.mandatee.edit)
      .click();
    const enddateForMandatee = Cypress.dayjs().set({
      hour: 10, minute: 10,
    });

    cy.get(auk.datepicker).eq(1)
      .click();
    cy.setDateInFlatpickr(enddateForMandatee);
    cy.get(mandatee.editMandatee.save).click();
    cy.get(utils.vlModalVerify.save).contains('Einddatum aanpassen');
    cy.get(utils.vlModalVerify.cancel).click();
    cy.get(mandatee.editMandatee.cancel).click();
    cy.visit('/overzicht?size=2');
    cy.get(utils.mHeader.settings).click();
    cy.get(settings.settings.manageMinisters).click();
    cy.url().should('include', 'instellingen/ministers');
    cy.contains(ministerNickName).parents(settings.ministers.sortableGroupRow)
      .find(settings.ministers.mandatee.resign)
      .click();
    cy.get(mandatee.manageMandatee.changesAlert).should('be.visible');
    cy.get(utils.vlModalFooter.cancel).click();
    cy.contains(ministerNickName).parents(settings.ministers.sortableGroupRow)
      .find(settings.ministers.mandatee.delete)
      .click();
    cy.get(utils.vlModalVerify.save).click();
  });
});
