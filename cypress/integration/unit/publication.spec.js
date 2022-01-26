/* global context, it, cy, beforeEach, afterEach, Cypress */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import utils from '../../selectors/utils.selectors';

context('Publications tests', () => {
  const pubNumber = '100';

  function checkIfNewPublicationFieldsAreEmpty(number, currentDate) {
    cy.get(publication.newPublication.number).should('not.contain', number);
    // "beslissingsdatum"
    cy.get(auk.datepicker).eq(0)
      .should('be.empty');
    // "ontvangstdatum"
    cy.get(auk.datepicker).eq(1)
      .should('have.value', currentDate);
    // "uiterste datum publicatie"
    cy.get(auk.datepicker).eq(2)
      .should('be.empty');
    cy.get(publication.newPublication.shortTitle).should('be.empty');
    cy.get(publication.newPublication.longTitle).should('be.empty');
  }

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
    // The info alert is replaced by error alert
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
    const fields = {
      number: 999,
      suffix: 'BIS',
      decisionDate: Cypress.moment().add(1, 'weeks')
        .day(3),
      receptionDate: Cypress.moment().add(1, 'weeks')
        .day(3),
      targetPublicationdate: Cypress.moment().add(1, 'weeks')
        .day(3),
      shortTitle: 'Some text',
      longTitle: 'Some text',
    };
    const currentDate = Cypress.moment().format('DD-MM-YYYY');

    // error validation (and reset after cancel)
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.number).click()
      .clear();
    cy.get(publication.newPublication.shortTitle).should('be.empty');
    cy.get(publication.newPublication.create).click();
    cy.get(publication.newPublication.alertError).should('exist');
    cy.get(publication.newPublication.numberError).should('exist');
    cy.get(publication.newPublication.shortTitleError).should('exist');
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.alertInfo).should('exist');
    cy.get(publication.newPublication.alertError).should('not.exist');
    cy.get(publication.newPublication.numberError).should('not.exist');
    cy.get(publication.newPublication.shortTitleError).should('not.exist');

    // check reset after cancel
    cy.fillInNewPublicationFields(fields);
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.publicationsIndex.newPublication).click();
    checkIfNewPublicationFieldsAreEmpty(fields.number, currentDate);

    // check reset after close
    cy.fillInNewPublicationFields(fields);
    cy.get(auk.modal.header.close).click();
    cy.get(publication.publicationsIndex.newPublication).click();
    checkIfNewPublicationFieldsAreEmpty(fields.number, currentDate);
  });

  it('should edit inscription and this data must be visible in the overview', () => {
    const fields = {
      number: 200,
      shortTitle: 'Korte titel cypress test',
      longTitle: 'Lange titel voor de cypress test.',
    };
    const shortTitleEdit = 'Korte titel cypress test gewijzigd';
    const longTitleEdit = 'Lange titel voor de cypress test gewijzigd.';
    cy.route('GET', '/publication-flows/**').as('getNewPublicationDetail');
    cy.createPublication(fields);

    // error validation and reset after cancel
    cy.get(publication.inscription.view.edit).click();
    cy.get(publication.inscription.edit.shortTitle).click()
      .clear();
    cy.get(publication.inscription.edit.save).click();
    cy.get(publication.inscription.edit.shortTitleError).should('exist');
    cy.get(publication.inscription.edit.cancel).click();
    cy.get(publication.inscription.view.edit).click();
    cy.get(publication.inscription.edit.shortTitleError).should('not.exist');
    cy.get(publication.inscription.edit.shortTitle).click()
      .clear()
      .type(shortTitleEdit);
    cy.get(publication.inscription.edit.longTitle).click()
      .clear()
      .type(longTitleEdit);
    cy.get(publication.inscription.edit.cancel).click();
    cy.get(publication.inscription.view.shortTitle).should('contain', fields.shortTitle);
    cy.get(publication.inscription.view.longTitle).should('contain', fields.longTitle);

    // edit
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

  it('publications:dossier: Add and delete mandataris', () => {
    const noMandatees = 'Er zijn nog geen ministers toegevoegd.';
    const mandateeName = 'Jan Jambon';

    cy.route('GET', '/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publication.publicationTableRow.row.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    cy.get(auk.emptyState.message).contains(noMandatees);

    // add mandatee
    cy.route('GET', '/mandatees**http://themis.vlaanderen.be/id/bestuursorgaan/**').as('getMandatees');
    cy.get(publication.mandateesPanel.add).click();
    cy.wait('@getMandatees');
    cy.get(utils.mandateesSelector.add).should('be.disabled');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionSearchMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(mandateeName)
      .click();
    cy.route('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchPublicationFlow');
    cy.get(publication.mandateesPanel.rows).should('have.length', 1);
    cy.get(publication.mandateesPanel.row.fullName).contains(mandateeName);

    // Delete mandatee
    cy.get(publication.mandateesPanel.row.unlink).click();
    cy.wait('@patchPublicationFlow');

    // assert deleted content
    cy.get(publication.mandateesPanel.rows).should('not.exist');
    cy.get(auk.emptyState.message).contains(noMandatees);
  });

  it('publications:dossier: Add and delete beleidsdomein', () => {
    const noGovernmentFields = 'Er zijn nog geen beleidsvelden toegevoegd';
    const labelName = 'Cultuur, Jeugd, Sport en Media';
    const fieldsName = 'Media';

    cy.route('GET', '/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publication.publicationTableRow.row.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    cy.get(auk.emptyState.message).contains(noGovernmentFields);

    // reset after cancel
    cy.get(utils.governmentAreasPanel.edit).click();
    cy.get(utils.governmentAreaSelectorForm.container).contains(labelName)
      .find(utils.governmentAreaSelectorForm.field)
      .contains(fieldsName)
      .click();
    cy.get(auk.modal.footer.cancel).click();
    cy.get(auk.emptyState.message).contains(noGovernmentFields);


    // link government field
    cy.route('PATCH', '/cases/**').as('patchCase');
    cy.route('GET', 'concepts**http://themis.vlaanderen.be/id/concept-schema/**').as('getConceptSchemes');
    cy.get(utils.governmentAreasPanel.edit).click();
    cy.wait('@getConceptSchemes');
    cy.get(utils.governmentAreaSelectorForm.container).contains(labelName)
      .find(utils.governmentAreaSelectorForm.field)
      .contains(fieldsName)
      .click();
    cy.get(utils.editGovernmentFieldsModal.save).click();
    cy.wait('@patchCase');
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 1);
    cy.get(utils.governmentAreasPanel.row.label).contains(labelName);
    cy.get(utils.governmentAreasPanel.row.fields).contains(fieldsName);
    // unlink government field
    cy.get(utils.governmentAreasPanel.edit).click();
    cy.get(utils.governmentAreaSelectorForm.container).contains(labelName)
      .find(utils.governmentAreaSelectorForm.field)
      .contains(fieldsName)
      .click();
    cy.get(utils.editGovernmentFieldsModal.save).click();
    cy.wait('@patchCase');
    cy.get(auk.emptyState.message).contains(noGovernmentFields);
  });

  it('publications:dossier:Add and delete contact person', () => {
    const noContactPersons = 'Er zijn nog geen contactpersonen toegevoegd';
    const contactperson = {
      fin: 'Donald',
      lan: 'Trump',
      eml: 'thedon@whitehouse.gov',
      org: 'US and A',
    };

    // TODO open publication (with index)
    cy.route('GET', '/publication-flows/**').as('getNewPublicationDetail');
    cy.get(publication.publicationTableRow.row.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    cy.get(auk.emptyState.message).contains(noContactPersons);

    // Add contactperson data.
    cy.get(publication.contactPersons.add).click();
    cy.get(auk.modal.container).should('exist');
    cy.get(publication.contactPersonAdd.firstName).clear()
      .type(contactperson.fin);
    cy.get(publication.contactPersonAdd.lastName).clear()
      .type(contactperson.lan);
    cy.get(publication.contactPersonAdd.email).clear()
      .type(contactperson.eml);

    // Add organization, test rollback after cancel
    cy.get(publication.contactPersonAdd.addOrganization).click();
    cy.get(publication.organizationAdd.name).click()
      .type(contactperson.org);
    cy.get(publication.organizationAdd.cancel).click();
    cy.get(publication.contactPersonAdd.selectOrganization).click();
    cy.get(dependency.emberPowerSelect.option).contains(contactperson.org)
      .should('not.exist');
    cy.get(publication.contactPersonAdd.addOrganization).click();
    cy.get(publication.organizationAdd.name).click()
      .type(contactperson.org);
    cy.route('POST', '/organizations').as('postOrganizations');
    cy.get(publication.organizationAdd.submit).click();
    cy.wait('@postOrganizations');

    // Click submit.
    cy.route('POST', '/persons').as('postPerson');
    cy.route('POST', '/contact-persons').as('postContactPerson');
    cy.get(publication.contactPersonAdd.submit).click();
    cy.wait('@postPerson');
    cy.wait('@postContactPerson');
    cy.get(publication.contactPersons.rows).should('have.length', 1);

    cy.get(publication.contactPersons.row.fullName).contains(contactperson.fin)
      .contains(contactperson.lan);
    cy.get(publication.contactPersons.row.organizationName).contains(contactperson.org);
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

  it('publications:dossier:check publication number uniqueness', () => {
    const suffix = 'BIS';
    cy.route('POST', '/publication-flows').as('createNewPublicationFlow');

    // try to create publication with existing number and check warnings
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(pubNumber);
    cy.get(publication.newPublication.create).click();
    cy.get(publication.newPublication.alertError).should('exist');
    cy.get(publication.newPublication.numberError).should('exist');
    // add BIS and create
    cy.get(publication.newPublication.suffix).click()
      .type(suffix);
    cy.get(publication.newPublication.create).click();
    cy.get(publication.newPublication.numberError).should('not.exist');
    cy.get(publication.newPublication.shortTitle).click()
      .type('test publication number uniqueness');
    cy.get(publication.newPublication.create).click();
    cy.wait('@createNewPublicationFlow');
    cy.get(publication.publicationNav.goBack).click();

    // check if existing number and suffix throw correct error
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(pubNumber);
    cy.get(publication.newPublication.suffix).click()
      .type(suffix);
    cy.get(publication.newPublication.create).click();
    cy.get(publication.newPublication.alertError).should('exist');
    cy.get(publication.newPublication.numberError).should('exist');
  });

  // TODO-PUBLICATION code snipper for searching in overview table
  // cy.get(publication.publicationTableRow.row.number).contains(`${pubNumber}`)
  //   .parents(publication.publicationTableRow.rows)
  //   .find(publication.publicationTableRow.row.goToPublication)
  //   .click();
  // cy.wait('@getNewPublicationDetail');
});
