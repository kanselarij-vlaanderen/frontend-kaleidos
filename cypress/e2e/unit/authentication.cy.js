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
      cy.get(route.login.acmidmContainer).get(route.login.loginButton)
        .contains(acmidmButtonText);
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
    // cy.get(route.login.acmidmContainer).get(route.login.loginButton)
    //   .contains(acmidmButtonText);
  });

  it('should login/logout multiple times', () => {
    const amountToRun = 3;
    // idea behind this. there is an ongoing issue with using cy.login() right after cy.logoutFlow()
    // mocklogin service does not play nice if we try to login too fast after logging out
    // this stress test can indicate if the problem is getting worse or is resurfacing
    for (let int = 0; int < amountToRun; int++) {
      cy.login('Admin');
      cy.url().should('include', 'overzicht');
      cy.logoutFlow();
      cy.visit('/overzicht?sizeAgendas=2');
    }
    for (let int = 0; int < amountToRun; int++) {
      cy.login('Admin');
      cy.url().should('include', 'overzicht');
      cy.logout();
      cy.visit('/overzicht?sizeAgendas=2');
    }
  });
});
