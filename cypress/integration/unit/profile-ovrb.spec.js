/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
// import cases from '../../selectors/case.selectors';
// import newsletter from '../../selectors/newsletter.selectors';
import publication from '../../selectors/publication.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as OVRB', () => {
  beforeEach(() => {
    // cy.login does not trigger the transtition to the default route for this profile for some reason
    cy.loginFlow('OVRB');
    cy.wait(1000);
  });

  // M-header toolbar tests

  it('Should have agenda, case, search, publications and signatures in toolbar', () => {
    cy.get(utils.mHeader.search).should('exist');
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.publications).should('exist');
    cy.get(utils.mHeader.signatures).should('exist');

    cy.get(utils.mHeader.newsletters).should('not.exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should start on publications tab after logging in and switch to publications tab when publications is clicked', () => {
    cy.get(publication.publicationsIndex.title).should('exist');
    cy.url().should('include', 'publicaties');

    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');

    cy.get(utils.mHeader.publications).click();
    cy.get(publication.publicationsIndex.title).should('exist');
    cy.url().should('include', 'publicaties');
  });
});
