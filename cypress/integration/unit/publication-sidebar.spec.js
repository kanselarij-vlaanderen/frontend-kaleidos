/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
// import utils from '../../selectors/utils.selectors';

context('Publications sidebar tests', () => {
  // function goToPublication(publicationShorttitle) {
  //   cy.route('GET', '/publication-flows/**').as('getNewPublicationDetail');
  //   cy.get(publication.publicationTableRow.row.shortTitle).contains(publicationShorttitle)
  //     .parents(publication.publicationTableRow.rows)
  //     .find(publication.publicationTableRow.row.goToPublication)
  //     .click();
  //   cy.wait('@getNewPublicationDetail');
  // }

  beforeEach(() => {
    cy.server();
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test all fields of the sidebar on status "te publiceren"', () => {
    const fields = {
      number: 1200,
      shortTitle: 'test',
    };
    const newPublicationNumber = 1250;
    const remark = 'test';
    const regulationType = 'Decreet';
    const publicationMode = 'Extenso';
    const proofPrintCorrector = 'Tester';
    const numacNumber = '12345';
    const openingDate = Cypress.moment().add(1, 'weeks')
      .day(1);
    const decisionDate = Cypress.moment().add(1, 'weeks')
      .day(2);
    const translationDueDate = Cypress.moment().add(1, 'weeks')
      .day(3);
    const translationDate = Cypress.moment().add(1, 'weeks')
      .day(4);
    const targetEndDate = Cypress.moment().add(1, 'weeks')
      .day(5);
    const publicationDueDate = Cypress.moment().add(1, 'weeks')
      .day(6);

    // check error validation publication number
    cy.createPublication(fields);
    cy.get(publication.sidebar.open).click();
    cy.route('PATCH', '/identifications/**').as('patchIdentifications');
    cy.route('PATCH', '/structured-identifiers/**').as('patchStructuredIdentifiers');
    cy.get(publication.sidebar.publicationNumber).click()
      .clear()
      .type(newPublicationNumber);
    cy.get(publication.sidebar.remark).click()
      .clear()
      .type(remark);
    cy.wait('@patchIdentifications');
    cy.wait('@patchStructuredIdentifiers');
    cy.get(publication.urgencyLevelCheckbox).parent(auk.checkbox)
      .click();
    cy.get(publication.sidebar.regulationType).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(regulationType)
      .click();
    // Note: publicationmode is not in the overview
    cy.get(publication.sidebar.publicationMode).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(publicationMode)
      .click();
    cy.get(publication.sidebar.proofPrintCorrector).click()
      .type(proofPrintCorrector);
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${numacNumber}{enter}`);
    cy.get(publication.sidebar.openingDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(openingDate);
    cy.get(publication.sidebar.decisionDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(decisionDate);
    cy.get(publication.sidebar.translationDueDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(translationDueDate);
    // Note: translationdate not in overview
    cy.get(publication.sidebar.translationDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(translationDate);
    cy.get(publication.sidebar.targetEndDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(targetEndDate);
    cy.get(publication.sidebar.publicationDueDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(publicationDueDate);
    // go back to overview and check if everything is updated correctly
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.number).contains(newPublicationNumber)
      .parent(publication.publicationTableRow.rows)
      .within(() => {
        cy.get(publication.publicationTableRow.row.shortTitle).should('contain', fields.shortTitle);
        cy.get(publication.publicationTableRow.row.remark.column).find(auk.icon)
          .trigger('mouseenter');
        cy.get(publication.publicationTableRow.row.remark.tooltip).should('contain', remark);
        cy.get(publication.publicationTableRow.row.remark.column).find(auk.icon)
          .trigger('mouseleave');
        cy.get(publication.publicationTableRow.row.regulationType).should('contain', regulationType);
        cy.get(publication.publicationTableRow.row.proofPrintCorrector).should('contain', proofPrintCorrector);
        cy.get(publication.publicationTableRow.row.numacNumber).should('contain', numacNumber);
        cy.get(publication.publicationTableRow.row.openingDate).should('contain', openingDate.format('DD-MM-YYYY'));
        cy.get(publication.publicationTableRow.row.decisionDate).should('contain', decisionDate.format('DD-MM-YYYY'));
        cy.get(publication.publicationTableRow.row.translationDueDate).should('contain', translationDueDate.format('DD-MM-YYYY'));
        cy.get(publication.publicationTableRow.row.targetEndDate).should('contain', targetEndDate.format('DD-MM-YYYY'));
        cy.get(publication.publicationTableRow.row.publicationDueDate).should('contain', publicationDueDate.format('DD-MM-YYYY'));
        cy.get(publication.publicationTableRow.row.urgencyLevel).find(auk.icon);
      });
  });

  it('should check all fields of the sidebar on status "te publiceren"', () => {
    const publicationNumber = 1250;
    const status = 'Te publiceren';
    cy.get(publication.publicationTableRow.row.number).contains(publicationNumber)
      .click();
    cy.get(publication.sidebar.open).click();
    cy.get(publication.sidebar.publicationNumber);
    cy.get(publication.urgencyLevelCheckbox).parent(auk.checkbox);
    cy.get(publication.statusSelector).find(dependency.emberPowerSelect.trigger)
      .contains(status);
    cy.get(publication.sidebar.regulationType).find(dependency.emberPowerSelect.trigger);
    cy.get(publication.sidebar.publicationMode).find(dependency.emberPowerSelect.trigger);
    cy.get(publication.sidebar.proofPrintCorrector);
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input);
    cy.get(publication.sidebar.openingDate).find(auk.datepicker);
    cy.get(publication.sidebar.decisionDate).find(auk.datepicker);
    cy.get(publication.sidebar.translationDueDate).find(auk.datepicker);
    cy.get(publication.sidebar.translationDate).find(auk.datepicker);
    cy.get(publication.sidebar.targetEndDate).find(auk.datepicker);
    cy.get(publication.sidebar.publicationDueDate).find(auk.datepicker);
    cy.get(publication.sidebar.publicationDate).should('not.exist');
    cy.get(publication.sidebar.remark);
  });

  it('should check all fields of the sidebar on status "afgevoerd"', () => {
    const publicationNumber = 1250;
    const newStatus = 'Afgevoerd';
    cy.get(publication.publicationTableRow.row.number).contains(publicationNumber)
      .click();
    cy.get(publication.sidebar.open).click();
    cy.get(publication.statusSelector).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(newStatus)
      .click();
    cy.get(publication.sidebar.confirmWithdraw).click();
    cy.get(publication.sidebar.publicationNumber);
    cy.get(publication.urgencyLevelCheckbox).should('not.exist');
    cy.get(publication.sidebar.statusChangeDate).contains(newStatus);
    cy.get(publication.sidebar.regulationType).should('not.exist');
    cy.get(publication.sidebar.publicationMode).should('not.exist');
    cy.get(publication.sidebar.proofPrintCorrector);
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input);
    cy.get(publication.sidebar.openingDate).find(auk.datepicker);
    cy.get(publication.sidebar.decisionDate).find(auk.datepicker);
    cy.get(publication.sidebar.translationDueDate).should('not.exist');
    cy.get(publication.sidebar.translationDate).find(auk.datepicker);
    cy.get(publication.sidebar.targetEndDate).should('not.exist');
    cy.get(publication.sidebar.publicationDueDate).should('not.exist');
    cy.get(publication.sidebar.publicationDate).should('not.exist');
    cy.get(publication.sidebar.remark);
  });

  it('should check all fields of the sidebar on status "gepauzeerd"', () => {
    const publicationNumber = 1250;
    const newStatus = 'Gepauzeerd';
    cy.get(publication.publicationTableRow.row.number).contains(publicationNumber)
      .click();
    cy.get(publication.sidebar.open).click();
    cy.get(publication.statusSelector).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(newStatus)
      .click();
    cy.get(publication.sidebar.publicationNumber);
    cy.get(publication.urgencyLevelCheckbox).should('not.exist');
    cy.get(publication.sidebar.statusChangeDate).contains(newStatus);
    cy.get(publication.sidebar.regulationType).find(dependency.emberPowerSelect.trigger);
    cy.get(publication.sidebar.publicationMode).find(dependency.emberPowerSelect.trigger);
    cy.get(publication.sidebar.proofPrintCorrector);
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input);
    cy.get(publication.sidebar.openingDate).find(auk.datepicker);
    cy.get(publication.sidebar.decisionDate).find(auk.datepicker);
    cy.get(publication.sidebar.translationDueDate).find(auk.datepicker);
    cy.get(publication.sidebar.translationDate).find(auk.datepicker);
    cy.get(publication.sidebar.targetEndDate).should('not.exist');
    cy.get(publication.sidebar.publicationDueDate).find(auk.datepicker);
    cy.get(publication.sidebar.publicationDate).should('not.exist');
    cy.get(publication.sidebar.remark);
  });

  it('should check all fields of the sidebar on status "gepubliceerd"', () => {
    const publicationNumber = 1250;
    const newStatus = 'Gepubliceerd';
    cy.get(publication.publicationTableRow.row.number).contains(publicationNumber)
      .click();
    cy.get(publication.sidebar.open).click();
    cy.get(publication.statusSelector).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(newStatus)
      .click();
    cy.get(publication.sidebar.publicationNumber);
    cy.get(publication.urgencyLevelCheckbox).should('not.exist');
    cy.get(publication.sidebar.regulationType).find(dependency.emberPowerSelect.trigger);
    cy.get(publication.sidebar.publicationMode).find(dependency.emberPowerSelect.trigger);
    cy.get(publication.sidebar.proofPrintCorrector);
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input);
    cy.get(publication.sidebar.openingDate).find(auk.datepicker);
    cy.get(publication.sidebar.decisionDate).find(auk.datepicker);
    cy.get(publication.sidebar.translationDueDate).should('not.exist');
    cy.get(publication.sidebar.translationDate).find(auk.datepicker);
    cy.get(publication.sidebar.targetEndDate).should('not.exist');
    cy.get(publication.sidebar.publicationDueDate).find(auk.datepicker);
    // cy.get(publication.sidebar.publicationDate).contains('Niet gekend');
    cy.get(publication.sidebar.remark);
  });

  it('should check publication number', () => {
    const fields1 = {
      number: 1216,
      shortTitle: 'test',
    };
    const fields2 = {
      number: 1217,
      shortTitle: 'test',
    };
    const usedPublicationNumber = 1250;

    cy.createPublication(fields1);
    cy.get(publication.sidebar.open).click();
    cy.get(publication.sidebar.publicationNumber).click()
      .clear()
      .type(usedPublicationNumber);
    cy.get(publication.sidebar.publicationNumberError).should('exist');
    cy.get(publication.sidebar.publicationNumberSuffix).type('BIS');
    cy.get(publication.sidebar.publicationNumberError).should('not.exist');
    cy.get(publication.publicationNav.goBack).click();

    cy.createPublication(fields2);
    cy.get(publication.sidebar.open).click();
    cy.get(publication.sidebar.publicationNumber).click()
      .clear()
      .type(usedPublicationNumber);
    cy.get(publication.sidebar.publicationNumberSuffix).type('BIS');
    cy.get(publication.sidebar.publicationNumberError).should('exist');
    cy.get(publication.sidebar.publicationNumberSuffix).clear()
      .type('TER');
    cy.get(publication.sidebar.publicationNumberError).should('not.exist');
    // changes not saved
    cy.get(publication.sidebar.publicationNumberSuffix).clear()
      .type('BIS');
    cy.get(publication.sidebar.publicationNumberError).should('exist');
    cy.get(publication.publicationHeader.number).contains(`${usedPublicationNumber} TER`);
  });
});
