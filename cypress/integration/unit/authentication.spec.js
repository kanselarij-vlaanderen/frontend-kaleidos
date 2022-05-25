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

  it('Logging in as user should redirect to /accountless-users', () => {
    const title = 'Geen rechten';
    const message = 'U heeft zich aangemeld om binnen Kaleidos gebruiksrechten te bekomen.';
    cy.login('User');
    // TODO-BUG after logging in, the user can see the m-header with the content of accountless users but the accountless users does not have the m-header.
    cy.get(route.accountlessUsers.title).contains(title);
    cy.get(route.accountlessUsers.message).contains(message);
    cy.url().should('contain', '/onbevoegde-gebruiker');
  });
});
