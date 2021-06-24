/* global context, it, cy, before, beforeEach */
// / <reference types="Cypress" />

import route from '../../../selectors/route.selectors';
import utils from '../../../selectors/utils.selectors';

context('NewsletterInfo: Switching the finished switch', () => {
  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.visit('/');
  });

  const goToKortBestek = () => {
    cy.log('going to kort bestek');
    cy.visit('/vergadering/5EBA9588751CF70008000012/kort-bestek');
    cy.get(route.newsletter.dataTable, {
      timeout: 20000,
    });
    cy.log('went to kort bestek');
  };

  it('Should check the box "in kort bestek"', () => {
    cy.route('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    goToKortBestek();
    cy.get(utils.vlCheckbox.label).eq(0)
      .scrollIntoView()
      .click();
    cy.get('@patchNewsletterInfo');
  });

  it('Should check the box "in kort bestek" and uncheck it afterward', () => {
    cy.route('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    goToKortBestek();
    cy.get(utils.vlCheckbox.label).eq(0)
      .scrollIntoView()
      .click();
    cy.get('@patchNewsletterInfo');
    cy.get(utils.vlCheckbox.label).eq(0)
      .scrollIntoView()
      .click();
    cy.get('@patchNewsletterInfo');
  });
});
