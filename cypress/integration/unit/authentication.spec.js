/* global context, it, cy */
// / <reference types="Cypress" />

import route from '../../selectors/route.selectors';

context('Authentication tests', () => {
  const acmidmButtonText = 'Meld u aan';
  it('should login/logout using xhr request (api call)', () => {
    cy.login('Admin');
    cy.url().should('include', 'overzicht');
    cy.logout();
    cy.visit('/overzicht?size=2');
    cy.get(route.login.acmidmButton).contains(acmidmButtonText);
  });

  it('should login/logout using the mock-login and logout button', () => {
    cy.loginFlow('Admin');
    cy.url().should('include', 'overzicht');
    cy.logoutFlow();
    cy.visit('/overzicht?size=2');
    // TODO flaky, sometimes we end up on authentication-ti.vlaanderen
    // cy.get(route.login.acmidmButton).contains(acmidmButtonText);
  });
});
