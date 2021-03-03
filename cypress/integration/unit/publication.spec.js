/* global context, before, it, cy,beforeEach, afterEach */

// / <reference types="Cypress" />
import publicationSelectors from '../../selectors/publication.selectors';
import modalSelectors from '../../selectors/modal.selectors';
import auComponentSelectors from '../../selectors/au-component-selectors';

context('Publications tests', () => {
  before(() => {
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO tests that duplicate publication numbers are not possible unless a suffix is given, combination of number+suffix should be unique
  // TODO both during creation as in sidebar
  // Be careful when using fixed numbers in tests, with automatic numbering implemented, some of them were already used

  const publicationOverviewUrl = '/publicaties';
  const someText = 'Some text';
  const shortTitle = 'Korte titel cypress test';
  const shortTitle2 = 'Korte titel cypress test gewijzigd';
  const longTitle = 'Lange titel voor de cypress test die we in de publicatieflow gaan testen.';


  it('should render error when required fields are not filled in to create new publication', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.auModal.container).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      // No errors on initial view, just info
      cy.get(modalSelectors.publication.alertInfo, {
        timeout: 5000,
      }).should('exist');
      cy.get(modalSelectors.publication.alertError, {
        timeout: 5000,
      }).should('not.exist');
      // Clear the next number to validate that empty number is not allowed
      cy.get(modalSelectors.publication.publicationNumberInput).click()
        .clear();
      cy.get(modalSelectors.publication.createButton).click();
      // The info alert is replaces by error alert
      cy.get(modalSelectors.publication.alertError, {
        timeout: 5000,
      }).should('exist');
      cy.get(modalSelectors.publication.alertInfo, {
        timeout: 5000,
      }).should('not.exist');
      // both number and shortTitle should show error when empty
      cy.get(auComponentSelectors.auLabelError).should('have.length', 2);
      // Create publication with number and title
      // TODO with automatic number suggestion, this test could fail if testdata already contains a publication with number 1
      cy.get(modalSelectors.publication.publicationNumberInput).click()
        .clear()
        .type('100');
      cy.get(modalSelectors.publication.publicationShortTitleTextarea)
        .click()
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
  });

  it('should clear input data when closing and reopening modal to create new publication', () => {
    cy.visit(publicationOverviewUrl);
    const numberToCheck = 999;
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.auModal.container).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      // TODO check if suffix and long title are cleared
      cy.get(modalSelectors.publication.publicationNumberInput)
        .click()
        .clear()
        .type(numberToCheck);
      cy.get(modalSelectors.publication.publicationShortTitleTextarea)
        .click()
        .type(someText);
      // Why don't we check the long title text area ?
    });
    cy.get(modalSelectors.publication.cancelButton).click();
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get('@publicationModal').within(() => {
      // TODO check the other fields
      cy.get(modalSelectors.publication.publicationNumberInput).should('not.contain', numberToCheck);
      cy.contains(someText).should('not.exist');
    });
  });

  it('should create a publication and redirect to its detail page', () => {
    cy.visit(publicationOverviewUrl);
    const numberToCheck = 200;
    cy.get(publicationSelectors.newPublicationButton).click();
    cy.get(modalSelectors.auModal.container).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      cy.get(modalSelectors.publication.publicationNumberInput).click()
        .clear()
        .type(numberToCheck);
      cy.get(modalSelectors.publication.publicationShortTitleTextarea).click()
        .clear()
        .type(shortTitle);
      cy.get(modalSelectors.publication.publicationLongTitleTextarea).click()
        .clear()
        .type(longTitle);

      cy.route('/publication-flows/*/case').as('getNewPublicationDetail');
      cy.get(modalSelectors.publication.createButton).click();
      cy.wait('@getNewPublicationDetail');
    });

    cy.get(publicationSelectors.publicationDetailHeaderShortTitle).should('contain', shortTitle);
    cy.get(publicationSelectors.publicationDetailHeaderPublicationNumber).should('contain', numberToCheck);
  });

  it('should have an overview of publication-flows and be able to click on it to go to the detail page', () => {
    cy.visit(publicationOverviewUrl);

    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publicationSelectors.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');
    // TODO This test is VERY dependent on existing data from previous test, fixing this for now but this will break at some point
    cy.get(publicationSelectors.publicationDetailHeaderShortTitle).should('contain', shortTitle);
    cy.get(publicationSelectors.publicationDetailHeaderPublicationNumber).should('contain', 'PUBLICATIE - NIET VIA MINISTERRAAD - 200');
  });

  it('should edit inscription and this data must be visible in the overview', () => {
    cy.visit(publicationOverviewUrl);

    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publicationSelectors.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    cy.get(publicationSelectors.editInscriptionButton).click();
    cy.get(publicationSelectors.inscriptionShortTitleTextarea).click()
      .clear()
      .type(shortTitle2);

    cy.route('PATCH', '/cases/*').as('patchCaseForPublicationFlow');
    cy.get(publicationSelectors.inscriptionSaveButton).click();
    cy.wait('@patchCaseForPublicationFlow');
    cy.contains(shortTitle2).should('exist');

    // go back in overview
    cy.route('/publication-flows?**').as('goToPublicationOverview');
    cy.get(publicationSelectors.nav.goBack).click();
    cy.wait('@goToPublicationOverview');

    // check if title has changes
    cy.contains(shortTitle2).should('exist');
  });


  it('publications:dossier:Add and delete contact person', () => {
    const contactperson = {
      fin: 'Donald',
      lan: 'Trump',
      eml: 'thedon@whitehouse.gov',
      org: 'US and A',
    };

    cy.visit(publicationOverviewUrl);

    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publicationSelectors.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    cy.contains('Er zijn nog geen contactpersonen toegevoegd').should('exist');

    // Add contactperson.
    cy.get(publicationSelectors.contactperson.addButton).click();
    cy.get(modalSelectors.auModal.container).should('exist');
    cy.get(publicationSelectors.contactperson.firstNameInput).clear()
      .type(contactperson.fin);
    cy.get(publicationSelectors.contactperson.lastNameInput).clear()
      .type(contactperson.lan);
    cy.get(publicationSelectors.contactperson.emailInput).clear()
      .type(contactperson.eml);

    // Click submit.
    cy.route('POST', '/contact-persons').as('postContactPerson');
    cy.route('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publicationSelectors.contactperson.submitButton).click();
    cy.wait('@postContactPerson');
    cy.wait('@patchPublicationFlow');

    cy.contains(contactperson.fin).should('exist');
    cy.contains(contactperson.lan).should('exist');
    cy.contains(contactperson.eml).should('exist');

    // Open dropdown menu.
    cy.get(publicationSelectors.contactperson.threedotsButton).click();
    cy.wait(10);

    // Click Delete
    cy.route('DELETE', '/contact-persons/**').as('deleteContactPerson');
    cy.get(publicationSelectors.contactperson.deleteContactpersonButton).click();
    cy.wait('@deleteContactPerson');

    // assert deleted content
    cy.contains(contactperson.fin).should('not.exist');
    cy.contains(contactperson.lan).should('not.exist');
    cy.contains(contactperson.eml).should('not.exist');

    cy.contains('Er zijn nog geen contactpersonen toegevoegd').should('exist');
  });

  it('publications:dossiers:Create publication via ministerraad', () => {
    // prepare agenda data.
    cy.logoutFlow();
    cy.login('Admin');
    cy.route('/agenda-item-treatments/**').as('publicationagendapuntentreatments');
    cy.visit('/vergadering/5EBA960A751CF7000800001D/agenda/5EBA960B751CF7000800001E/agendapunten');
    cy.wait('@publicationagendapuntentreatments');
    cy.approveAndCloseDesignAgenda();
    // TODO this test does not do wat it says it does, no publications are created

    // cy.wait(6000); // 6000 is 6 seconds. Must wait for this case to index.

    // make sure the agenda is approved and calls are not cancelled
    // cy.get(modal.auModal.container, {
    //   timeout: 60000,
    // }).should('not.exist');
  });
});
