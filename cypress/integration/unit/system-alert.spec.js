/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

import dependency from '../../selectors/dependency.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';
import settings from '../../selectors/settings.selectors';

const ALERT_POLL_INTERVAL = 70000;

context('Settings: Create a system-alert and verify if it gets shown and closes', () => {
  beforeEach(() => {
    cy.login('Admin');
    cy.visit('instellingen/systeemmeldingen');
  });

  it('Should create & Should pop up to the user once polling picks it up', () => {
    // # It creates
    cy.get(settings.systemAlertsIndex.add).click();

    // no dates, depend on default starting "now" (not changing default resulted in bugs in the past)
    cy.get(settings.systemAlertForm.title).type('System alert title');
    cy.get(settings.systemAlertForm.message).type('System alert message');

    cy.intercept('GET', '/alerts?**').as('getAlerts');
    cy.intercept('POST', '/alerts').as('postAlerts');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@postAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('exist', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    });
  });

  it('Should close and stay closed', () => {
    cy.get(auk.auModal.header.close).click();
    cy.get(auk.auModal.container).should('not.exist');
    cy.intercept('GET', '/alerts?**').as('getAlerts');
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
    cy.intercept('GET', '/alerts**').as('getAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('exist');

    cy.get(settings.systemAlertsIndex.alerts).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).click();
    cy.intercept('GET', '/alerts**').as('getAlerts');
    cy.get(settings.systemAlertsIndex.remove).click();
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('not.exist');
  });
});
