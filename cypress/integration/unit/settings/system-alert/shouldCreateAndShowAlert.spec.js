/* global context, it, cy,before,beforeEach */
// / <reference types="Cypress" />

import dependency from '../../../../selectors/dependency.selectors';
import utils from '../../../../selectors/utils.selectors';
import settings from '../../../../selectors/settings.selectors';

const ALERT_POLL_INTERVAL = 70000;

context('Settings: Create a system-alert and verify if it gets shown and closes', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.visit('instellingen/systeemmeldingen');
  });

  it('Should create & Should pop up to the user once polling picks it up', () => {
    // # It creates
    cy.get(settings.systemAlertsIndex.add).click();

    // no dates, depend on default starting "now" (not changing default resulted in bugs in the past)
    cy.get(settings.systemAlertForm.title).type('System alert title');
    cy.get(settings.systemAlertForm.message).type('System alert message');

    cy.route('GET', '/alerts?**').as('getAlerts');
    cy.route('POST', '/alerts').as('postAlerts');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@postAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('exist', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    });
  });

  it('Should close and stay closed', () => {
    cy.route('GET', '/alerts?**').as('getAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass

    cy.get(utils.vlAlert.close).each((button) => {
      cy.get(button).click();
    });
    cy.get(settings.systemAlert).should('not.exist');

    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for another polling-cycle to pass
    cy.get(settings.systemAlert).should('not.exist');
  });

  it('Should delete the alert created', () => {
    cy.route('GET', '/alerts**').as('getAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('exist');

    cy.get('[data-test-vl-modal-dialogwindow] .auk-form-group').click();
    cy.get(dependency.emberPowerSelect.option).click();
    cy.route('GET', '/alerts**').as('getAlerts');
    cy.get(settings.systemAlertsIndex.remove).click();
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('not.exist');
  });
});
