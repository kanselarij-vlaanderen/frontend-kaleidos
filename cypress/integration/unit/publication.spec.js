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
  const publicationNotViaMinisterOverviewUrl = '/publicaties/in-behandeling/niet-via-ministerraad';
  const someText = 'Some text';
  const publicationNumber = 'CY987';
  const shortTitle = 'Korte titel cypress test';
  const shortTitle2 = 'Korte titel cypress test gewijzigd';
  const longTitle = 'Lange titel voor de cypress test die we in de publicatieflow gaan testen.';

  it('should render error when required fields are not filled in to create new publication', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.aukModal).as('publicationModal');
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
      cy.get(utilsSelectors.aukInput).click({
        force: true,
      })
        .clear()
        .type(someText);
    });
    cy.get(utilsSelectors.aukTextarea).eq(0)
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

  it('should clear input data when closing and reopening modal to create new publication', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.aukModal).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      cy.get(utilsSelectors.aukInput).click({
        force: true,
      })
        .clear()
        .type(someText);
      cy.get(utilsSelectors.aukTextarea).eq(0)
        .click({
          force: true,
        })
        .clear();
    });
    cy.get(modalSelectors.publication.cancelButton).click();
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.contains(someText).should('not.exist');
  });

  it('should create a publication and redirect to its detail page', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.aukModal).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      cy.get(modalSelectors.publication.publicationNumberInput).click({
        force: true,
      })
        .clear()
        .type(publicationNumber);
      cy.get(modalSelectors.publication.publicationShortTitleTextarea).click({
        force: true,
      })
        .clear()
        .type(shortTitle);
      cy.get(modalSelectors.publication.publicationLongTitleTextarea).click({
        force: true,
      })
        .clear()
        .type(longTitle);
    });

    cy.route('/publication-flows/*/case').as('getNewPublicationDetail');
    cy.get(modalSelectors.publication.createButton).click();
    cy.wait('@getNewPublicationDetail');

    cy.get(publicationSelectors.publicationDetailHeaderShortTitle).should('contain', shortTitle);
    cy.get(publicationSelectors.publicationDetailHeaderPublicationNumber).should('contain', publicationNumber);
  });

  it('should have an overview of publication-flows and be able to click on it to go to the detail page', () => {
    cy.visit(publicationNotViaMinisterOverviewUrl);

    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publicationSelectors.goToPublication).click();
    cy.wait('@getNewPublicationDetail');

    cy.get(publicationSelectors.publicationDetailHeaderShortTitle).should('contain', shortTitle);
    cy.get(publicationSelectors.publicationDetailHeaderPublicationNumber).should('contain', publicationNumber);
  });

  it('should edit inscription and this data must be visible in the overview', () => {
    cy.visit(publicationNotViaMinisterOverviewUrl);

    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publicationSelectors.goToPublication).click();
    cy.wait('@getNewPublicationDetail');

    cy.get(publicationSelectors.editInscriptionButton).click();
    cy.get(publicationSelectors.inscriptionShortTitleTextarea).click({
      force: true,
    })
      .clear()
      .type(shortTitle2);

    cy.route('PATCH', '/cases/*').as('patchCaseForPublicationFlow');
    cy.get(publicationSelectors.inscriptionSaveButton).click();
    cy.wait('@patchCaseForPublicationFlow');
    cy.contains(shortTitle2).should('exist');

    // go back in overview
    cy.route('/publication-flows?**').as('goToPublicationOverview');
    cy.get(publicationSelectors.goBackToOverviewButton).click();
    cy.wait('@goToPublicationOverview');

    // check if title has changes
    cy.contains(shortTitle2).should('exist');
    cy.contains(longTitle).should('exist');
  });
});
