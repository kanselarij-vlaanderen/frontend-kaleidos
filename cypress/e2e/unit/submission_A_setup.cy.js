/* global context, it, cy, Cypress, before, afterEach */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import settings from '../../selectors/settings.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';
import utils from '../../selectors/utils.selectors';

const agendaDate = Cypress.dayjs().add(4, 'weeks')
  .day(1); // anything but day 4
// const agendaDate = Cypress.dayjs('2024-09-13');

const linkedMandatee = {
  // the second active mandatee will be our linked mandatee
  mandatee: mandateeNames.current.second, // might not be needed, depends what we want to check
  fullName: mandateeNames.current.second.fullName,
  submitter: true,
};

before(() => {
  cy.login('Admin');
  cy.createAgenda(null, agendaDate, 'indieningen kabinet');
  cy.logoutFlow();
});

context('setup emails and mandatees', () => {
  afterEach(() => {
    cy.logout();
  });

  it('add one mandatee to dossierbeheerder', () => {
    cy.login('Admin');
    // setup: add minister to dossierbeheerder
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    cy.get(settings.organization.technicalInfo.showSelectMandateeModal).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should(
      'not.exist'
    );
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should(
      'not.exist'
    );
    cy.get(dependency.emberPowerSelect.option)
      .contains(linkedMandatee.fullName)
      .scrollIntoView()
      .click();
    cy.intercept('PATCH', '/user-organizations/**').as(
      'patchUserOrganizations'
    );
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');
  });

  it('set email setting defaults', () => {
    cy.login('Admin');
    cy.get(utils.mHeader.settings).click();
    cy.get(settings.overview.manageEmails).click();
    cy.get(settings.email.publication.requestTo).click()
      .clear()
      .type('example@test.com');
    cy.get(settings.email.submission.toSecretary).click()
      .clear()
      .type('example+sec@test.com');
    cy.get(settings.email.submission.toIKW).click()
      .clear()
      .type('example+ikw@test.com');
    cy.get(settings.email.submission.toKCGroup).click()
      .clear()
      .type('example+KC@test.com');
    cy.get(settings.email.submission.replyTo).click()
      .clear()
      .type('example+replyTo@test.com');
    cy.intercept('PATCH', '/email-notification-settings/**')
      .as('patchEmailSettings');
    cy.get(settings.email.save).click();
    cy.wait('@patchEmailSettings');
  });
});
