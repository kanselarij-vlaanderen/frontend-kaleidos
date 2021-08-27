/* global context, it, cy,beforeEach, afterEach */

// / <reference types="Cypress" />
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';

context('Publications tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  // TODO-publication tests that duplicate publication numbers are not possible unless a suffix is given, combination of number+suffix should be unique
  // TODO-publication both during creation as in sidebar
  // Be careful when using fixed numbers in tests, with automatic numbering implemented, some of them were already used

  const someText = 'Some text';
  const shortTitle = 'Korte titel cypress test';
  const shortTitle2 = 'Korte titel cypress test gewijzigd'; // only used in 1 test, `${shortTitle} gewijzigd`
  const longTitle = 'Lange titel voor de cypress test die we in de publicatieflow gaan testen.';
  const numberToCheck = 200; // used for multiple tests


  it('should render error when required fields are not filled in to create new publication', () => {
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.route('POST', '/publication-flows').as('createNewPublicationFlow');
    // No errors on initial view, just info
    cy.get(publication.newPublication.alertInfo).should('exist');
    cy.get(publication.newPublication.alertError).should('not.exist');
    // Clear the next number to validate that empty number is not allowed
    cy.get(publication.newPublication.numberInput).click()
      .clear();
    cy.get(publication.newPublication.create).click();
    // The info alert is replaces by error alert
    cy.get(publication.newPublication.alertError).should('exist');
    cy.get(publication.newPublication.alertInfo).should('not.exist');
    // both number and shortTitle should show error when empty
    cy.get(publication.newPublication.numberError).should('exist');
    cy.get(publication.newPublication.shortTitleError).should('exist');
    // Create publication with number and title
    // TODO-publication with automatic number suggestion, this test could fail if testdata already contains a publication with number 1
    cy.get(publication.newPublication.numberInput).click()
      .clear()
      .type('100');
    cy.get(publication.newPublication.shortTitle)
      .click()
      .clear()
      .type(someText);
    cy.get(publication.newPublication.create).click();
    cy.get(publication.newPublication.alertError).should('not.exist');
    cy.get(publication.newPublication.alertInfo).should('exist');
    cy.wait('@createNewPublicationFlow');
    // TODO-publication new way of creating publication-number with structured identifier can be checked with routes
    // post case
    // post structured identifier
    // post identifier
    // post publication-flows
  });

  it('should clear input data when closing and reopening modal to create new publication', () => {
    // TODO-publication also test if errors are correctly reset after cancel / new creation
    const number = 999;
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.suffixInput).should('be.empty');
    cy.get(publication.newPublication.longTitle).should('be.empty');
    cy.get(publication.newPublication.numberInput)
      .click()
      .clear()
      .type(number);
    cy.get(publication.newPublication.shortTitle)
      .click()
      .type(someText);
    // TODO-publication also test close button
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.publicationsIndex.newPublication).click();
    // TODO-publication check the other fields
    cy.get(publication.newPublication.numberInput).should('not.contain', number);
    cy.get(publication.newPublication.shortTitle).should('not.contain', someText);
  });

  it('should create a publication and redirect to its detail page', () => {
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.numberInput).click()
      .clear()
      .type(numberToCheck);
    cy.get(publication.newPublication.shortTitle).click()
      .clear()
      .type(shortTitle);
    cy.get(publication.newPublication.longTitle).click()
      .clear()
      .type(longTitle);

    cy.route('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.route('/publication-flows/*?include**').as('loadPublicationDetailView');
    cy.get(publication.newPublication.create).click();
    cy.wait('@createNewPublicationFlow');
    cy.wait('@loadPublicationDetailView');

    cy.get(publication.publicationHeader.shortTitle).should('contain', shortTitle);
    cy.get(publication.publicationHeader.number).should('contain', numberToCheck);
  });

  it('should have an overview of publication-flows and be able to click on it to go to the detail page', () => {
    //  TODO-publication this is a click-table.spec test
    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.contains(`${numberToCheck}`).parents('tr')
      .find(publication.publicationTableRow.goToPublication)
      .click();
    cy.wait('@getNewPublicationDetail');
    cy.get(publication.publicationHeader.shortTitle).should('contain', shortTitle);
    cy.get(publication.publicationHeader.number).contains(`PUBLICATIE - NIET VIA MINISTERRAAD - ${numberToCheck}`);
  });

  it('should edit inscription and this data must be visible in the overview', () => {
    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.contains(`${numberToCheck}`).parents('tr')
      .find(publication.publicationTableRow.goToPublication)
      .click();
    cy.wait('@getNewPublicationDetail');

    cy.get(publication.inscriptionPanel.edit).click();
    cy.get(publication.inscriptionPanel.shortTitle).click()
      .clear()
      .type(shortTitle2);
    cy.get(publication.inscriptionPanel.longTitle).click()
      .clear()
      .type(longTitle);

    cy.route('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.inscriptionPanel.save).click();
    cy.wait('@patchPublicationFlow');
    cy.contains(shortTitle2).should('exist');

    // go back in overview
    cy.route('/publication-flows?**').as('goToPublicationOverview');
    cy.get(publication.publicationCaseNav.goBack).click();
    cy.wait('@goToPublicationOverview');

    // check if title has changes
    // TODO-KAS-2849 view selector
    cy.contains(shortTitle2).should('exist');
  });


  it('publications:dossier:Add and delete contact person', () => {
    const contactperson = {
      fin: 'Donald',
      lan: 'Trump',
      eml: 'thedon@whitehouse.gov',
      org: 'US and A',
    };

    cy.route('/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publication.publicationTableRow.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    // TODO-publication get auk.emptyState met selector
    cy.contains('Er zijn nog geen contactpersonen toegevoegd').should('exist');

    // Add contactperson.
    cy.get(publication.contactPersonsPanel.add).click();
    cy.get(auk.modal.container).should('exist');
    cy.get(publication.contactPersonAdd.firstName).clear()
      .type(contactperson.fin);
    cy.get(publication.contactPersonAdd.lastName).clear()
      .type(contactperson.lan);
    cy.get(publication.contactPersonAdd.email).clear()
      .type(contactperson.eml);

    // Click submit.
    cy.route('POST', '/persons').as('postPerson');
    cy.route('POST', '/contact-persons').as('postContactPerson');
    cy.get(publication.contactPersonAdd.submit).click();
    cy.wait('@postPerson');
    cy.wait('@postContactPerson');

    cy.contains(contactperson.fin).should('exist');
    cy.contains(contactperson.lan).should('exist');
    cy.contains(contactperson.eml).should('exist');

    // Delete contact person
    cy.route('DELETE', '/contact-persons/**').as('deleteContactPerson');
    cy.route('DELETE', '/persons/**').as('deletePerson');
    cy.get(publication.contactPersonsPanel.delete).click();
    cy.wait('@deleteContactPerson');
    cy.wait('@deletePerson');

    // assert deleted content
    cy.contains(contactperson.fin).should('not.exist');
    cy.contains(contactperson.lan).should('not.exist');
    cy.contains(contactperson.eml).should('not.exist');

    cy.contains('Er zijn nog geen contactpersonen toegevoegd').should('exist');
  });
});
