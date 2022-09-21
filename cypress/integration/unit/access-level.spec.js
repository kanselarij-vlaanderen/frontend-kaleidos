/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function setPreviousVersionAccesLevel(docName, previousVersionName, accesLevel, openSidebar = false) {
  // Open correct versionHistory
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .as('currentDoc');
  cy.get('@currentDoc').find(document.documentCard.versionHistory)
    .find(auk.accordion.header.button)
    .click();

  // go to viewer and change accesLevel
  cy.get(document.vlDocument.name).contains(previousVersionName)
    .invoke('removeAttr', 'target')
    .click();
  if (openSidebar) {
    cy.get(document.documentPreviewSidebar.open).click();
  }
  cy.get(document.previewDetailsTab.edit).click();
  cy.wait(1000);
  cy.get(document.previewDetailsTab.editing.accessLevel)
    // .find(dependency.emberPowerSelect.trigger)
    .click();
  cy.get(dependency.emberPowerSelect.option)
    .contains(accesLevel)
    .click();
  cy.intercept('PATCH', 'pieces/**').as('patchPieces');
  cy.intercept('PATCH', 'document-containers/**').as('patchDocuments');
  cy.get(document.previewDetailsTab.save).click()
    .wait('@patchPieces')
    .wait('@patchDocuments');

  cy.go('back');
  cy.get(auk.loader).should('not.exist');
}

function checkPreviousVersionAccesLevel(docName, previousVersionName, accesLevel) {
  // Open correct versionHistory
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .as('currentDoc');
  cy.get('@currentDoc').find(document.documentCard.versionHistory)
    .find(auk.accordion.header.button)
    .click();

  // check accesLevel in history view
  cy.get(document.vlDocument.name).contains(previousVersionName)
    .parents(document.vlDocument.piece)
    .find(document.accessLevelPill.pill)
    .contains(accesLevel);
  cy.get('@currentDoc').find(document.documentCard.versionHistory)
    .find(auk.accordion.header.button)
    .click();
}

context('Decision tests', () => {
  const agendaDate = Cypress.dayjs('2022-04-18');
  const subcaseTitle = 'Cypress test: Publications via MR - 1652967454';
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should add a BIS/TER and check if underlying acces level changes to intern regering', () => {
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle);
    cy.get(document.documentCard.name.value).contains('bestaandePublicatie')
      .parents(document.documentCard.card)
      .as('thirdCard');

    // set acceslevel to public
    cy.get('@thirdCard').find(document.accessLevelPill.edit)
      .eq(0)
      .click();
    cy.get('@thirdCard').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();

    // upload document
    cy.get('@thirdCard').find(document.documentCard.actions)
      .click();
    cy.get('@thirdCard').find(document.documentCard.uploadPiece)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', 'submission-activities').as('postSubmissionActivities');
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@postSubmissionActivities')
      .wait('@patchAgendaitems');
    cy.wait(2000);

    checkPreviousVersionAccesLevel('bestaandePublicatieBIS.pdf', 'bestaandePublicatie', 'Intern Regering');
  });

  it('should change the access level on a BIS/TER and check if underlying acces level changes correctly', () => {
    // setup
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle);

    // set aliases
    cy.get(document.documentCard.name.value).contains('publicatieDecreet')
      .parents(document.documentCard.card)
      .as('firstCard');
    cy.get(document.documentCard.name.value).contains('publicatieMB')
      .parents(document.documentCard.card)
      .as('secondCard');

    // add BIS and TER
    cy.get('@secondCard').find(document.documentCard.actions)
      .click();
    cy.get('@secondCard').find(document.documentCard.uploadPiece)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', 'submission-activities').as('postSubmissionActivities');
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@postSubmissionActivities')
      .wait('@patchAgendaitems');
    cy.wait(2000);
    // set accesLevels to publiek
    cy.get('@secondCard').find(document.accessLevelPill.edit)
      .eq(0)
      .click();
    cy.get('@secondCard').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();
    cy.get(document.accessLevelPill.save).click();
    setPreviousVersionAccesLevel('publicatieMBBIS', 'publicatieMB', 'Publiek', true);

    // add BIS and TER
    cy.get('@firstCard').find(document.documentCard.actions)
      .click();
    cy.get('@firstCard').find(document.documentCard.uploadPiece)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', 'submission-activities').as('postSubmissionActivities2');
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems2');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@postSubmissionActivities2')
      .wait('@patchAgendaitems2');
    cy.wait(2000);
    cy.get('@firstCard').find(document.documentCard.actions)
      .click();
    cy.get('@firstCard').find(document.documentCard.uploadPiece)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('POST', 'submission-activities').as('postSubmissionActivities3');
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems3');
    cy.get(utils.vlModalFooter.save).click()
      .wait('@postSubmissionActivities3')
      .wait('@patchAgendaitems3');
    cy.wait(2000);
    // set accesLevels to publiek
    cy.get('@secondCard').find(document.accessLevelPill.edit)
      .eq(0)
      .click();
    cy.get('@secondCard').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();
    cy.get(document.accessLevelPill.save).click();
    cy.get(auk.loader).should('not.exist');
    setPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', 'Publiek');
    setPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet', 'Publiek');

    // change access level on VlDocument
    cy.get('@secondCard').find(document.accessLevelPill.edit)
      .eq(0)
      .click();
    cy.get('@secondCard').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .click();
    cy.get(document.accessLevelPill.save).click();
    cy.get(auk.loader).should('not.exist');
    checkPreviousVersionAccesLevel('publicatieMBBIS.pdf', 'publicatieMB', 'Intern Regering');

    cy.get('@firstCard').find(document.accessLevelPill.edit)
      .eq(0)
      .click();
    cy.get('@firstCard').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Regering')
      .click();
    cy.get(document.accessLevelPill.save).click();
    cy.get(auk.loader).should('not.exist');
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', 'Intern Regering');
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet.pdf', 'Intern Regering');

    // change access level on BatchDocumentsDetailsModal on single document
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.documentDetailsRow.accessLevel).eq(0)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Vertrouwelijk')
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    cy.intercept('GET', '/document-containers/**').as('getDocumentContainers1');
    cy.get(document.batchDocumentsDetails.save).click()
      .wait('@patchPieces1')
      .wait('@getDocumentContainers1');

    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', 'Vertrouwelijk');
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet.pdf', 'Vertrouwelijk');

    // change access level on BatchDocumentEdit on multiple documents
    cy.get(route.agendaitemDocuments.batchEdit).click();
    // cy.get(document.documentDetailsRow.input).should('have.value', 'publicatieDecreetTER')
    //   .parents(document.documentDetailsRow.row)
    //   .as('row1');
    // cy.get(document.documentDetailsRow.input).should('have.value', 'publicatieMB')
    //   .parents(document.documentDetailsRow.row)
    //   .as('row2');
    cy.get(document.documentDetailsRow.accessLevel).eq(0)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Secretarie')
      .click();
    cy.get(document.documentDetailsRow.accessLevel).eq(1)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Secretarie')
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces2');
    cy.intercept('GET', '/document-containers/**').as('getDocumentContainers2');
    cy.get(document.batchDocumentsDetails.save).click()
      .wait('@patchPieces2')
      .wait('@getDocumentContainers2');

    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', 'Intern Secretarie');
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet.pdf', 'Intern Secretarie');
    checkPreviousVersionAccesLevel('publicatieMBBIS', 'publicatieMB', 'Intern Secretarie');

    // change access level to a lower one and check that there are no changes to underlying level
    cy.get('@secondCard').find(document.accessLevelPill.edit)
      .eq(0)
      .click();
    cy.get('@secondCard').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .click();
    cy.get(document.accessLevelPill.save).click();
    cy.get(auk.loader).should('not.exist');
    checkPreviousVersionAccesLevel('publicatieMBBIS', 'publicatieMB', 'Intern Secretarie');
  });
});
