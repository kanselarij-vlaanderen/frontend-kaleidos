/* global context, it, cy, beforeEach, afterEach, Cypress */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import utils from '../../selectors/utils.selectors';

context('Publications tests', () => {
  const pubNumber = '100';
  const numberError = 'Publicatienummer is numeriek en verplicht.';
  const shortTitleError = 'Dit veld dient ingevuld te worden.';

  function checkIfNewPublicationFieldsAreEmpty(number, currentDate) {
    cy.get(publication.newPublication.number).should('not.contain', number);
    // "beslissingsdatum"
    cy.get(auk.datepicker.datepicker).eq(0)
      .should('be.empty');
    // "ontvangstdatum"
    cy.get(auk.datepicker.datepicker).eq(1)
      .should('have.value', currentDate);
    // "uiterste datum publicatie"
    cy.get(auk.datepicker.datepicker).eq(2)
      .should('be.empty');
    cy.get(publication.newPublication.shortTitle).should('be.empty');
    cy.get(publication.newPublication.longTitle).should('be.empty');
  }

  beforeEach(() => {
    cy.login('OVRB');
    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
  });

  afterEach(() => {
    cy.logout();
  });

  // Be careful when using fixed numbers in tests, with automatic numbering implemented, some of them were already used

  it('should render error when required fields are not filled in to create new publication', () => {
    const shortTitle = 'new publication: required fields';

    cy.get(publication.publicationsIndex.newPublication).click();
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    // No errors on initial view, just info
    cy.get(publication.newPublication.alertInfo).should('exist');
    // Saving is not allowed when first opening the modal
    cy.get(publication.newPublication.create).should('be.disabled');
    // Clear the next number to validate that empty number is not allowed
    cy.get(publication.newPublication.number).click()
      .clear();
    cy.get(publication.newPublication.create).should('be.disabled');
    // both number and shortTitle should show error when empty, only visible after entering/exiting the short title field
    cy.get(auk.formHelpText).contains(numberError);
    cy.get(publication.newPublication.shortTitle).click();
    cy.get(publication.newPublication.longTitle).click();
    cy.get(auk.formHelpText).contains(shortTitleError);
    // Create publication with number and title
    // TODO-publication with automatic number suggestion, this test could fail if testdata already contains a publication with number 100
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(pubNumber);
    cy.get(publication.newPublication.shortTitle)
      .click()
      .clear()
      .type(shortTitle);
    // valid number and valid short title allows create action
    cy.get(publication.newPublication.create).should('not.be.disabled')
      .click();
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
      decisionDate: Cypress.dayjs().add(1, 'weeks')
        .day(3),
      receptionDate: Cypress.dayjs().add(1, 'weeks')
        .day(3),
      publicationDueDate: Cypress.dayjs().add(1, 'weeks')
        .day(3),
      shortTitle: 'Some text',
      longTitle: 'Some text',
    };
    const currentDate = Cypress.dayjs().format('DD-MM-YYYY');

    // error validation (and reset after cancel)
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.number).click()
      .clear();
    cy.get(publication.newPublication.shortTitle).should('be.empty');
    cy.get(publication.newPublication.create).should('be.disabled');
    cy.get(auk.formHelpText).contains(numberError);
    cy.get(auk.modal.footer.cancel).click();
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.alertInfo).should('exist');
    cy.get(auk.formHelpText).should('not.exist');

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
      number: 2500,
      shortTitle: 'Korte titel cypress test',
      longTitle: 'Lange titel voor de cypress test.',
    };
    const shortTitleEdit = 'Korte titel cypress test gewijzigd';
    const longTitleEdit = 'Lange titel voor de cypress test gewijzigd.';
    cy.intercept('GET', '/publication-flows/**').as('getNewPublicationDetail');
    cy.createPublication(fields);

    // error validation and reset after cancel
    cy.get(publication.inscription.view.edit).click();
    cy.get(publication.inscription.edit.save).should('not.be.disabled');
    cy.get(publication.inscription.edit.shortTitle).click()
      .clear();
    cy.get(publication.inscription.edit.save).should('be.disabled');
    // TODO-bug error message only shows after clicking something else
    cy.get(publication.inscription.edit.longTitle).click();
    cy.get(auk.formHelpText).contains(shortTitleError);
    cy.get(publication.inscription.edit.cancel).click();
    cy.get(publication.inscription.view.edit).click();
    cy.get(publication.inscription.edit.shortTitle).should('have.value', fields.shortTitle);
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
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.inscription.edit.save).click();
    cy.wait('@patchPublicationFlow');
    cy.get(publication.inscription.view.shortTitle).contains(shortTitleEdit);
    cy.get(publication.inscription.view.longTitle).contains(longTitleEdit);

    // go back in overview
    cy.intercept('GET', '/publication-flows?**').as('goToPublicationOverview');
    cy.get(publication.publicationNav.goBack).click();
    cy.wait('@goToPublicationOverview');

    // check if title has changes
    cy.get(publication.publicationTableRow.row.shortTitle).contains(shortTitleEdit);
  });

  it('publications:dossier: Add and delete mandataris', () => {
    const noMandatees = 'Er zijn nog geen ministers toegevoegd.';
    const mandateeName = 'Jan Jambon';

    cy.intercept('GET', '/publication-flows**').as('getNewPublicationDetail');
    cy.get(publication.publicationTableRow.row.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    cy.get(auk.emptyState.message).contains(noMandatees);

    // add mandatee
    cy.intercept('GET', '/mandatees**').as('getMandatees');
    cy.get(publication.mandateesPanel.add).click();
    cy.wait('@getMandatees');
    cy.get(utils.mandateesSelector.add).should('be.disabled');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(mandateeName)
      .click();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
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

  // Beleidsvelden are no longer in publications, only in dossier
  // TODO reenable after cache warmup implements pre-loading the cache for conceptschemens
  it.skip('publications:dossier: Add and delete beleidsdomein', () => {
    const noGovernmentFields = 'Er zijn nog geen beleidsvelden toegevoegd';
    const labelName = 'Cultuur, Jeugd, Sport en Media';
    const fieldsName = 'Media';

    cy.intercept('GET', '/publication-flows**').as('getNewPublicationDetail');
    cy.get(publication.publicationTableRow.row.goToPublication).first()
      .click();
    cy.wait('@getNewPublicationDetail');

    // Assert empty.
    cy.get(auk.emptyState.message).contains(noGovernmentFields);

    // reset after cancel
    cy.intercept('GET', '/concepts**').as('getConceptSchemes');
    cy.get(utils.governmentAreasPanel.edit).click();
    cy.wait('@getConceptSchemes');
    cy.get(utils.governmentAreaSelectorForm.container).contains(labelName)
      .find(utils.governmentAreaSelectorForm.field)
      .contains(fieldsName)
      .click();
    cy.get(auk.modal.footer.cancel).click();
    cy.get(auk.emptyState.message).contains(noGovernmentFields);


    // link government field
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlows');
    cy.get(utils.governmentAreasPanel.edit).click();
    cy.get(utils.governmentAreaSelectorForm.container).contains(labelName)
      .find(utils.governmentAreaSelectorForm.field)
      .contains(fieldsName)
      .click();
    cy.get(utils.editGovernmentFieldsModal.save).click();
    cy.wait('@patchPublicationFlows');
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
    cy.wait('@patchPublicationFlows');
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
    cy.intercept('GET', '/publication-flows**').as('getNewPublicationDetail');
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
    cy.intercept('POST', '/organizations').as('postOrganizations');
    cy.get(publication.organizationAdd.submit).click();
    cy.wait('@postOrganizations');

    // Click submit.
    cy.intercept('POST', '/persons').as('postPerson');
    cy.intercept('POST', '/contact-persons').as('postContactPerson');
    cy.get(publication.contactPersonAdd.submit).click();
    cy.wait('@postPerson');
    cy.wait('@postContactPerson');
    cy.get(publication.contactPersons.rows).should('have.length', 1);

    cy.get(publication.contactPersons.row.fullName).contains(contactperson.fin)
      .contains(contactperson.lan);
    cy.get(publication.contactPersons.row.organizationName).contains(contactperson.org);
    cy.get(publication.contactPersons.row.email).contains(contactperson.eml);

    // Delete contact person
    cy.intercept('DELETE', '/contact-persons/**').as('deleteContactPerson');
    cy.intercept('DELETE', '/persons/**').as('deletePerson');
    cy.get(publication.contactPersons.row.delete).click();
    cy.wait('@deleteContactPerson');
    cy.wait('@deletePerson');

    // assert deleted content
    cy.get(publication.contactPersons.rows).should('not.exist');
    cy.get(auk.emptyState.message).contains(noContactPersons);
  });

  it('publications:dossier:check publication number uniqueness', () => {
    const existingPubNumber = 5555;
    const suffix = 'BIS';
    const duplicateError = 'Het gekozen publicatienummer is reeds in gebruik. Gelieve een ander nummer te kiezen of een suffix te gebruiken.';
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.intercept('POST', '/publication-subcases').as('createNewPublicationSubcase');

    // try to create publication with existing number and check warnings
    cy.get(publication.publicationsIndex.newPublication).click();
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(existingPubNumber);
    cy.get(auk.formHelpText).contains(duplicateError);
    cy.get(publication.newPublication.create).should('be.disabled');
    // add BIS and create
    cy.get(publication.newPublication.suffix).click()
      .type(suffix);
    cy.get(auk.formHelpText).should('not.exist');
    cy.get(publication.newPublication.shortTitle).click()
      .type('test publication number uniqueness');
    cy.get(publication.newPublication.create).click();
    cy.wait('@createNewPublicationFlow');
    cy.wait('@createNewPublicationSubcase');
    cy.get(publication.publicationNav.goBack).click();

    // check if existing number and suffix throw correct error
    cy.get(publication.publicationsIndex.newPublication).click();
    // fill in something in shortTitle to test the duplicate error only
    cy.get(publication.newPublication.shortTitle).click()
      .clear()
      .type(suffix);
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(existingPubNumber);
    cy.get(publication.newPublication.suffix).click()
      .type(suffix);
    // typed value is showing
    cy.get(publication.newPublication.number).should('have.value', existingPubNumber);
    // force click here to simulate clicking the button before validation has happened instead of waiting for it.
    cy.get(publication.newPublication.create).click({
      force: true,
    });
    // When trying to enter a number that already exists, we suggest a new number and a yellow toast is shown
    cy.get(auk.alertStack.container).find(auk.alert.message)
      .contains('nieuw nummer');
    // Validation happened, save is enabled because a new number was suggested
    cy.get(publication.newPublication.create).should('not.be.disabled');
    // new number is showing (negative asserting because new number is current highest pubnumber + 1)
    cy.get(publication.newPublication.number).should('not.have.value', existingPubNumber);
    cy.get(publication.newPublication.cancel).click();
    // check that only one publication has the number we wanted to duplicate
    // TODO-bug cypress is going faster then updates to store/cache? new publication is not in the list yet
    // cy.get(publication.publicationTableRow.row.publicationNumber).contains(`${existingPubNumber} ${suffix}`)
    //   .should('have.length', 1);
  });

  it('publications:caseInfo: check publication number uniqueness', () => {
    const fieldsUsed = {
      number: 1221,
      shortTitle: 'test',
    };
    const fields1 = {
      number: 1222,
      shortTitle: 'test',
    };
    const fields2 = {
      number: 1223,
      shortTitle: 'test',
    };

    cy.createPublication(fieldsUsed);
    cy.createPublication(fields1);
    cy.intercept('PATCH', '/identifications/**').as('patchIdentifications');
    cy.intercept('PATCH', '/structured-identifiers/**').as('patchStructuredIdentifiers');
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlows');
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.publicationNumber).click()
      .clear()
      .type(fieldsUsed.number);
    cy.get(auk.formHelpText).should('exist');
    cy.get(publication.publicationCaseInfo.editView.suffix).type('BIS');
    cy.get(auk.formHelpText).should('not.exist');
    cy.get(publication.publicationCaseInfo.editView.save).click()
      .wait('@patchIdentifications')
      .wait('@patchStructuredIdentifiers')
      .wait('@patchPublicationFlows');

    cy.createPublication(fields2);
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.publicationNumber).click()
      .clear()
      .type(fieldsUsed.number);
    cy.get(publication.publicationCaseInfo.editView.suffix).type('BIS');
    cy.get(auk.formHelpText).should('exist');
    cy.get(publication.publicationCaseInfo.editView.suffix).clear()
      .type('TER');
    cy.get(auk.formHelpText).should('not.exist');
    // changes not saved
    cy.get(publication.publicationCaseInfo.editView.suffix).clear()
      .type('BIS');
    cy.get(auk.formHelpText).should('exist');
    cy.get(publication.publicationHeader.number).contains(`${fieldsUsed.number} TER`);
  });

  it('publications:decisions: check date received', () => {
    const fields2 = {
      number: 1251,
      shortTitle: 'test beslissing met datum',
      decisionDate: Cypress.dayjs().add(1, 'weeks')
        .day(3),
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const laterDate = fields2.decisionDate.add(1, 'days');
    const earlierDate = laterDate.subtract(1, 'days');

    // with date
    cy.createPublication(fields2);
    cy.intercept('GET', '/pieces?filter**publication-flow**').as('getPieces');
    cy.get(publication.publicationNav.decisions).click()
      .wait('@getPieces');
    // Make sure the page transitioned
    cy.url().should('contain', '/besluiten');
    cy.get(publication.decisionsInfoPanel.view.decisionDate).contains(fields2.decisionDate.format('DD-MM-YYYY'));
    // add later date
    cy.get(publication.decisionsIndex.uploadReference).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.datepicker.datepicker).click();
    cy.setDateInFlatpickr(laterDate);
    cy.get(publication.referenceUpload.save).click();
    cy.get(publication.documentCardStep.card).contains(laterDate.format('DD-MM-YYYY'));

    // add earlier date
    cy.get(publication.decisionsIndex.uploadReference).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(auk.datepicker.datepicker).click();
    cy.setDateInFlatpickr(earlierDate);
    cy.get(publication.referenceUpload.save).click();
    cy.get(publication.documentCardStep.card).should('have.length', 2)
      .eq(0)
      .contains(earlierDate.format('DD-MM-YYYY'));
  });

  it('publications:caseInfo: check urgency, mode and decisiondate fields', () => {
    const defaultValue = '-';
    const publicationMode1 = 'Extenso';
    const publicationMode2 = 'Bij uittreksel';
    const decisionDate = Cypress.dayjs().add(1, 'weeks')
      .day(3);
    const formattedDecisionDate = decisionDate.format('DD-MM-YYYY');

    cy.visit('/publicaties/626FBC3BCB00108193DC4361/dossier');

    // check fields default value
    cy.get(publication.publicationCaseInfo.urgencyLevel).contains(defaultValue);
    cy.get(publication.publicationCaseInfo.publicationMode).contains(defaultValue);
    cy.get(publication.publicationCaseInfo.decisionDate).contains(defaultValue);

    // change values in edit
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.urgencyLevelCheckbox).parent()
      .click();
    cy.get(publication.publicationCaseInfo.editView.publicationMode).click();
    cy.selectFromDropdown(publicationMode1);
    cy.get(publication.publicationCaseInfo.editView.decisionDate).find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(decisionDate);
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.publicationCaseInfo.editView.save).click()
      .wait('@patchPublicationFlow');

    // check if fields updated
    cy.get(publication.publicationCaseInfo.urgencyLevel).find(auk.icon.warning);
    cy.get(publication.publicationCaseInfo.publicationMode).contains(publicationMode1);
    cy.get(publication.publicationCaseInfo.decisionDate).contains(formattedDecisionDate);

    cy.get(publication.publicationCaseInfo.edit).click();
    // publication mode can't be changed to default again, set to second value
    cy.get(publication.publicationCaseInfo.editView.publicationMode).click();
    cy.selectFromDropdown(publicationMode2);
    // change other values to default again
    cy.get(publication.urgencyLevelCheckbox).parent()
      .click();
    cy.get(publication.publicationCaseInfo.editView.decisionDate).find(auk.datepicker.datepicker)
      .click()
      .clear();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.publicationCaseInfo.editView.save).click()
      .wait('@patchPublicationFlow');

    // check if fields updated
    cy.get(publication.publicationCaseInfo.urgencyLevel).contains(defaultValue);
    cy.get(publication.publicationCaseInfo.publicationMode).contains(publicationMode2);
    cy.get(publication.publicationCaseInfo.decisionDate).contains(defaultValue);
  });
});
