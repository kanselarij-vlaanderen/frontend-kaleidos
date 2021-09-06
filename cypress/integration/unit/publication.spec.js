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
  // TODO-publication publication numbers edit both during creation as in sidebar
  // Be careful when using fixed numbers in tests, with automatic numbering implemented, some of them were already used

  it('should render error when required fields are not filled in to create new publication', () => {
    const pubNumber = '100';
    const shortTitle = 'new publication: required fields';
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.route('POST', '/publication-flows').as('createNewPublicationFlow');
    // No errors on initial view, just info
    cy.get(publication.newPublication.alertInfo).should('exist');
    cy.get(publication.newPublication.alertError).should('not.exist');
    // Clear the next number to validate that empty number is not allowed
    cy.get(publication.newPublication.number).click()
      .clear();
    cy.get(publication.newPublication.create).click();
    // The info alert is replaces by error alert
    cy.get(publication.newPublication.alertError).should('exist');
    cy.get(publication.newPublication.alertInfo).should('not.exist');
    // both number and shortTitle should show error when empty
    cy.get(publication.newPublication.numberError).should('exist');
    cy.get(publication.newPublication.shortTitleError).should('exist');
    // Create publication with number and title
    // TODO-publication with automatic number suggestion, this test could fail if testdata already contains a publication with number 100
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(pubNumber);
    cy.get(publication.newPublication.shortTitle)
      .click()
      .clear()
      .type(shortTitle);
    cy.get(publication.newPublication.create).click();
    cy.get(publication.newPublication.alertError).should('not.exist');
    cy.get(publication.newPublication.alertInfo).should('exist');
    cy.wait('@createNewPublicationFlow');
    // TODO-publication new way of creating publication-number with structured identifier can be checked with routes
    // post case
    // post structured identifier
    // post identifier
    // post publication-flows

    cy.get(publication.publicationHeader.shortTitle).should('contain', shortTitle);
    cy.get(publication.publicationHeader.number).contains(`PUBLICATIE - NIET VIA MINISTERRAAD - ${pubNumber}`);
  });

  it('should clear input data when closing and reopening modal to create new publication', () => {
    // TODO-publication also test if errors are correctly reset after cancel / new creation
    const number = 999;
    const someText = 'Some text';
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.suffix).should('be.empty');
    cy.get(publication.newPublication.longTitle).should('be.empty');
    cy.get(publication.newPublication.number)
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
    cy.get(publication.newPublication.number).should('not.contain', number);
    cy.get(publication.newPublication.shortTitle).should('not.contain', someText);
  });

  it('should edit inscription and this data must be visible in the overview', () => {
    const pubNumber = 200;
    const shortTitle = 'Korte titel cypress test';
    const shortTitleEdit = 'Korte titel cypress test gewijzigd';
    const longTitle = 'Lange titel voor de cypress test.';
    const longTitleEdit = 'Lange titel voor de cypress test gewijzigd.';
    cy.route('GET', '/publication-flows/**').as('getNewPublicationDetail');
    cy.createPublication(pubNumber, null, shortTitle, longTitle);
    cy.get(publication.inscription.view.edit).click();
    cy.get(publication.inscription.edit.shortTitle).click()
      .clear()
      .type(shortTitleEdit);
    cy.get(publication.inscription.edit.longTitle).click()
      .clear()
      .type(longTitleEdit);

    cy.route('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.inscription.edit.save).click();
    cy.wait('@patchPublicationFlow');
    cy.get(publication.inscription.view.shortTitle).contains(shortTitleEdit);
    cy.get(publication.inscription.view.longTitle).contains(longTitleEdit);

    // go back in overview
    cy.route('GET', '/publication-flows?**').as('goToPublicationOverview');
    cy.get(publication.publicationNav.goBack).click();
    cy.wait('@goToPublicationOverview');

    // check if title has changes
    cy.get(publication.publicationTableRow.row.shortTitle).contains(shortTitleEdit);
  });

  it('publications:dossier:Add and delete contact person', () => {
    const noContactPersons = 'Er zijn nog geen contactpersonen toegevoegd';
    const contactperson = {
      fin: 'Donald',
      lan: 'Trump',
      eml: 'thedon@whitehouse.gov',
      org: 'US and A',
    };

    cy.route('GET', '/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publication.publicationTableRow.row.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    cy.get(auk.emptyState.message).contains(noContactPersons);

    // Add contactperson.
    cy.get(publication.contactPersons.add).click();
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
    cy.get(publication.contactPersons.rows).should('have.length', 1);

    cy.get(publication.contactPersons.row.fullName).contains(contactperson.fin)
      .contains(contactperson.lan);
    cy.get(publication.contactPersons.row.email).contains(contactperson.eml);

    // Delete contact person
    cy.route('DELETE', '/contact-persons/**').as('deleteContactPerson');
    cy.route('DELETE', '/persons/**').as('deletePerson');
    cy.get(publication.contactPersons.row.delete).click();
    cy.wait('@deleteContactPerson');
    cy.wait('@deletePerson');

    // assert deleted content
    cy.get(publication.contactPersons.rows).should('not.exist');
    cy.get(auk.emptyState.message).contains(noContactPersons);
  });

  // TODO-PUBLICATION code snipper for searching in overview table
  // cy.get(publication.publicationTableRow.row.number).contains(`${pubNumber}`)
  //   .parents(publication.publicationTableRow.rows)
  //   .find(publication.publicationTableRow.row.goToPublication)
  //   .click();
  // cy.wait('@getNewPublicationDetail');
});
