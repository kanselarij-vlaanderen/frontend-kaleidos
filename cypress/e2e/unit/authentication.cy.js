/* global context, it, cy, Cypress */
// / <reference types="Cypress" />

import route from '../../selectors/route.selectors';

context('Authentication tests', () => {
  const acmidmButtonText = 'Meld u aan';
  it('should login/logout using xhr request (api call)', () => {
    cy.login('Admin');
    cy.url().should('include', 'overzicht');
    cy.logout();
    cy.visit('/overzicht?sizeAgendas=2');
    const isCI = Cypress.env('CI');
    if (isCI) {
      cy.get(route.login.acmidmButton).contains(acmidmButtonText);
    } else {
      // only when we are on env "development" do we come back to mocklogin route after logout
      // aanmelden route fails locally because of it
      cy.get(route.mockLogin.list);
    }
  });

  it('should login/logout using the mock-login and logout button', () => {
    cy.loginFlow('Admin');
    cy.url().should('include', 'overzicht');
    cy.logoutFlow();
    cy.visit('/overzicht?sizeAgendas=2');
    // TODO flaky, sometimes we end up on authentication-ti.vlaanderen
    // cy.get(route.login.acmidmButton).contains(acmidmButtonText);
  });
});
