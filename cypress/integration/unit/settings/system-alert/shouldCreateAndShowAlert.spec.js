/*global context, it, cy,before,beforeEach,afterEach*/
/// <reference types="Cypress" />
import * as alert from "../../../../selectors/system-wide/alert.selectors";
import * as systemAlert from "../../../../selectors/settings/system-alert.selectors";

const ALERT_POLL_INTERVAL = 60000;

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
    cy.get(systemAlert.managementModal.add).click();

    // no dates, depend on default starting "now" (not changing default resulted in bugs in the past)
    cy.get(systemAlert.formFields.title).type('System alert title');
    cy.get(systemAlert.formFields.message).type('System alert message');

    cy.route('GET', '/alerts?**').as('getAlerts');
    cy.get('[data-test-save-button]').click();
    cy.wait('@getAlerts', { timeout: ALERT_POLL_INTERVAL + 30000 }); // Wait for a polling-cycle to pass
    cy.get(systemAlert.alert).should('exist');
    cy.logou
  });

  it('Should close and stay closed', () => {
    cy.route('GET', '/alerts?**').as('getAlerts');
    cy.wait('@getAlerts', { timeout: ALERT_POLL_INTERVAL + 30000 }); // Wait for a polling-cycle to pass

    cy.get(alert.closeButton).click();
    cy.get(systemAlert.alert).should('not.exist');

    cy.wait('@getAlerts', { timeout: ALERT_POLL_INTERVAL + 30000 }); // Wait for another polling-cycle to pass
    cy.get(systemAlert.alert).should('not.exist');
  });
});
