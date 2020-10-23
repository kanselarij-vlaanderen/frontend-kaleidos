/* global context, before, it, cy,beforeEach, afterEach */

// / <reference types="Cypress" />
import publicationSelectors from '../../selectors/publication.selectors';
import modalSelectors from '../../selectors/modal.selectors';
import utilsSelectors from '../../selectors/utils.selectors';

context('Publications tests', () => {
  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const publicationOverviewUrl = '/publicaties/in-behandeling';
  const someText = 'Some text';

  it('should render error when required fields are not filled in', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.au2Modal).as('publicationModal');
    cy.get(modalSelectors.publication.alertInfo, {
      timeout: 5000,
    }).should('exist');
    cy.get(modalSelectors.publication.alertError, {
      timeout: 5000,
    }).should('not.exist');
    cy.get(modalSelectors.publication.createButton).click();
    cy.get(modalSelectors.publication.alertError, {
      timeout: 5000,
    }).should('exist');
    cy.get(modalSelectors.publication.alertInfo, {
      timeout: 5000,
    }).should('not.exist');
    cy.get('@publicationModal').within(() => {
      cy.get(utilsSelectors.au2Input).click({
        force: true,
      })
        .clear()
        .type(someText);
    });
    cy.get(utilsSelectors.au2Textarea).eq(0)
      .click({
        force: true,
      })
      .clear()
      .type(someText);
    cy.get(modalSelectors.publication.createButton).click();
    cy.get(modalSelectors.publication.alertError, {
      timeout: 5000,
    }).should('not.exist');
    cy.get(modalSelectors.publication.alertInfo, {
      timeout: 5000,
    }).should('exist');
  });

  it('should clear input data when closing and reopening modal', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.au2Modal).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      cy.get(utilsSelectors.au2Input).click({
        force: true,
      })
        .clear()
        .type(someText);
      cy.get(utilsSelectors.au2Textarea).eq(0)
        .click({
          force: true,
        })
        .clear();
    });
    cy.get(modalSelectors.publication.cancelButton).click();
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.contains(someText).should('not.exist');
  });
});
