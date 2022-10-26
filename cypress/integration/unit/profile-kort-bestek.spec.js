/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as Kort bestek user', () => {
  beforeEach(() => {
    // cy.login does not trigger the transtition to the default route for this profile for some reason
    cy.loginFlow('Kort bestek');
    cy.wait(1000);
  });

  // M-header toolbar tests

  it('Should have agenda, case, search and newsletter in toolbar', () => {
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('exist');
    cy.get(utils.mHeader.search).should('exist');

    cy.get(utils.mHeader.signatures).should('not.exist');
    cy.get(utils.mHeader.publications).should('not.exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should start on newsletter tab after logging in and switch to newsletter tab when newsletter is clicked', () => {
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', 'kort-bestek');

    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');

    cy.get(utils.mHeader.newsletters).click();
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', '/kort-bestek');
  });

  it('Should switch to Agenda tab when agenda is clicked', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');
    cy.url().should('include', 'overzicht');
  });

  it('Should switch to cases tab when cases is clicked', () => {
    cy.get(utils.mHeader.cases).click();
    cy.get(cases.casesHeader.title).should('exist');
    cy.url().should('include', '/dossiers');
  });

  it('Should switch to search tab when search is clicked', () => {
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.title).should('exist');
    cy.url().should('include', '/zoeken');
  });

  it('Should switch to newsletter tab when newsletter is clicked', () => {
    cy.get(utils.mHeader.newsletters).click();
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', '/kort-bestek');
  });

  it('Should have limited options in the agenda actions', () => {
    cy.visitAgendaWithLink('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten');

    cy.get(agenda.agendaActions.showOptions).click();
    // Allowed actions
    cy.get(agenda.agendaActions.navigateToNewsletter).should('exist');
    cy.get(agenda.agendaActions.navigateToPrintablePressAgenda).should('exist');
    cy.get(agenda.agendaActions.navigateToPrintableAgenda).should('exist');
    cy.get(agenda.agendaActions.downloadDocuments).should('exist');
    // TODO Plan publication / withdraw publication should not be done by KB?
    // Restricted actions
    // TODO can KB manage desisions?
    cy.get(agenda.agendaActions.navigateToDecisions).should('not.exist');
  });
});
