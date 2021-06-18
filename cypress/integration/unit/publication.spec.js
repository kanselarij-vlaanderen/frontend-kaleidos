/* global context, before, it, cy,beforeEach, afterEach */

// / <reference types="Cypress" />
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';

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
  const shortTitle2 = 'Korte titel cypress test gewijzigd'; // only used in 1 test, `${shortTitle} gewijzigd`
  const longTitle = 'Lange titel voor de cypress test die we in de publicatieflow gaan testen.';
  const numberToCheck = 200; // used for multiple tests


  it('should render error when required fields are not filled in to create new publication', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publication.newPublicationButton).click();
    cy.get(auk.modal.container).as('publicationModal');
    cy.route('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.get('@publicationModal').within(() => {
      // No errors on initial view, just info
      cy.get(publication.newPublicationModal.alertInfo, {
        timeout: 5000,
      }).should('exist');
      cy.get(publication.newPublicationModal.alertError, {
        timeout: 5000,
      }).should('not.exist');
      // Clear the next number to validate that empty number is not allowed
      cy.get(publication.newPublicationModal.publicationNumberInput).click()
        .clear();
      cy.get(publication.newPublicationModal.createButton).click();
      // The info alert is replaces by error alert
      cy.get(publication.newPublicationModal.alertError, {
        timeout: 5000,
      }).should('exist');
      cy.get(publication.newPublicationModal.alertInfo, {
        timeout: 5000,
      }).should('not.exist');
      // both number and shortTitle should show error when empty
      // TODO this does not indicate where the errors should be, make selectors for both errors and get those
      cy.get(auk.label.error).should('have.length', 2);
      // Create publication with number and title
      // TODO with automatic number suggestion, this test could fail if testdata already contains a publication with number 1
      cy.get(publication.newPublicationModal.publicationNumberInput).click()
        .clear()
        .type('100');
      cy.get(publication.newPublicationModal.publicationShortTitleTextarea)
        .click()
        .clear()
        .type(someText);
      cy.get(publication.newPublicationModal.createButton).click();
      cy.get(publication.newPublicationModal.alertError, {
        timeout: 5000,
      }).should('not.exist');
      cy.get(publication.newPublicationModal.alertInfo, {
        timeout: 5000,
      }).should('exist');
    });
    cy.wait('@createNewPublicationFlow', {
      timeout: 20000,
    });
    // TODO new way of creating publication-number with structured identifier can be checked with routes
    // post case
    // post structured identifier
    // post identifier
    // post publication-flows
  });

  it('should clear input data when closing and reopening modal to create new publication', () => {
    // TODO also test if errors are correctly reset after cancel / new creation
    cy.visit(publicationOverviewUrl);
    const number = 999;
    cy.get(publication.newPublicationButton).click();
    cy.get(auk.modal.container).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      // TODO check if suffix and long title are cleared
      cy.get(publication.newPublicationModal.publicationNumberInput)
        .click()
        .clear()
        .type(number);
      cy.get(publication.newPublicationModal.publicationShortTitleTextarea)
        .click()
        .type(someText);
    });
    // TODO also test close button
    cy.get(publication.newPublicationModal.cancelButton).click();
    cy.get(publication.newPublicationButton).click();
    cy.get('@publicationModal').within(() => {
      // TODO check the other fields
      cy.get(publication.newPublicationModal.publicationNumberInput).should('not.contain', number);
      cy.contains(someText).should('not.exist');
    });
  });

  it('should create a publication and redirect to its detail page', () => {
    cy.visit(publicationOverviewUrl);
    cy.get(publication.newPublicationButton).click();
    cy.get(auk.modal.container).as('publicationModal');
    cy.get('@publicationModal').within(() => {
      cy.get(publication.newPublicationModal.publicationNumberInput).click()
        .clear()
        .type(numberToCheck);
      cy.get(publication.newPublicationModal.publicationShortTitleTextarea).click()
        .clear()
        .type(shortTitle);
      cy.get(publication.newPublicationModal.publicationLongTitleTextarea).click()
        .clear()
        .type(longTitle);

      cy.route('POST', '/publication-flows').as('createNewPublicationFlow');
      cy.route('/publication-flows/*?include**').as('loadPublicationDetailView');
      cy.get(publication.newPublicationModal.createButton).click();
      cy.wait('@createNewPublicationFlow');
      cy.wait('@loadPublicationDetailView');
    });

    cy.get(publication.publicationDetailHeaderShortTitle).should('contain', shortTitle);
    cy.get(publication.publicationDetailHeaderPublicationNumber).should('contain', numberToCheck);
  });

  it('should have an overview of publication-flows and be able to click on it to go to the detail page', () => {
    cy.visit(publicationOverviewUrl);
    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.contains(`${numberToCheck}`).parents('tr')
      .within(() => {
        cy.get(publication.goToPublication)
          .click();
      });
    cy.wait('@getNewPublicationDetail');
    cy.get(publication.publicationDetailHeaderShortTitle).should('contain', shortTitle);
    cy.contains(publication.publicationDetailHeaderPublicationNumber, `PUBLICATIE - NIET VIA MINISTERRAAD - ${numberToCheck}`).should('exist');
  });

  it('should edit inscription and this data must be visible in the overview', () => {
    cy.visit(publicationOverviewUrl);
    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.contains(`${numberToCheck}`).parents('tr')
      .within(() => {
        cy.get(publication.goToPublication)
          .click();
      });
    cy.wait('@getNewPublicationDetail');

    // TODO test long title
    cy.get(publication.editInscriptionButton).click();
    cy.get(publication.inscriptionShortTitleTextarea).click()
      .clear()
      .type(shortTitle2);

    cy.route('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.inscriptionSaveButton).click();
    cy.wait('@patchPublicationFlow');
    cy.contains(shortTitle2).should('exist');

    // go back in overview
    cy.route('/publication-flows?**').as('goToPublicationOverview');
    cy.get(publication.nav.goBack).click();
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
    cy.get(publication.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    // TODO get auk.emptyState met selector
    cy.contains('Er zijn nog geen contactpersonen toegevoegd').should('exist');

    // Add contactperson.
    cy.get(publication.contactperson.addButton).click();
    cy.get(auk.modal.container).should('exist');
    cy.get(publication.contactperson.firstNameInput).clear()
      .type(contactperson.fin);
    cy.get(publication.contactperson.lastNameInput).clear()
      .type(contactperson.lan);
    cy.get(publication.contactperson.emailInput).clear()
      .type(contactperson.eml);

    // Click submit.
    cy.route('POST', '/contact-persons').as('postContactPerson');
    cy.route('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.contactperson.submitButton).click();
    cy.wait('@postContactPerson');
    cy.wait('@patchPublicationFlow');

    cy.contains(contactperson.fin).should('exist');
    cy.contains(contactperson.lan).should('exist');
    cy.contains(contactperson.eml).should('exist');

    // Open dropdown menu.
    cy.get(publication.contactperson.threedotsButton).click();
    cy.wait(10);

    // Click Delete
    cy.route('DELETE', '/contact-persons/**').as('deleteContactPerson');
    cy.get(publication.contactperson.deleteContactpersonButton).click();
    cy.wait('@deleteContactPerson');

    // assert deleted content
    cy.contains(contactperson.fin).should('not.exist');
    cy.contains(contactperson.lan).should('not.exist');
    cy.contains(contactperson.eml).should('not.exist');

    cy.contains('Er zijn nog geen contactpersonen toegevoegd').should('exist');
  });
});
