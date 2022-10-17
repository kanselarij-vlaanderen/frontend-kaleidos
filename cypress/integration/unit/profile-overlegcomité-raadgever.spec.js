/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
// import cases from '../../selectors/case.selectors';
// import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as Overlegcomité raadgever', () => {
  beforeEach(() => {
    cy.loginFlow('Overlegcomité raadgever');
    cy.wait(1000);
  });

  // M-header toolbar tests

  it('Should have agenda, case and search in toolbar', () => {
    cy.get(utils.mHeader.search).should('exist');
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');

    cy.get(utils.mHeader.publications).should('not.exist');
    cy.get(utils.mHeader.signatures).should('not.exist');
    cy.get(utils.mHeader.newsletters).should('not.exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should not have acces to agendas or cases at the moment', () => {
    cy.get(route.agendasOverview.filter.warning);
    cy.get(utils.mHeader.cases).click();
    cy.get(route.casesOverview.dataTable).contains('Geen resultaten gevonden');
  });
});
