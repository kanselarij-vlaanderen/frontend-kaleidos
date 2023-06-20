/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';

const accessPublic = 'Publiek';
const accessGovernment = 'Intern Overheid';
const accessCabinet = 'Intern Regering';
const accessConfidential = 'Vertrouwelijk';
const accessInternal = 'Intern Secretarie';


function setCurrentVersionAccesLevel(docName, accesLevel, hasPreviousVersion = false) {
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .as('card');
  if (hasPreviousVersion) {
    cy.get('@card').find(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled');
  }
  cy.get('@card').within(() => {
    cy.get(document.accessLevelPill.edit).click();
    cy.get(dependency.emberPowerSelect.trigger).click();
  });
  cy.get(dependency.emberPowerSelect.option).contains(accesLevel)
    .click();
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('PATCH', '/pieces/*').as(`patchPieces${randomInt}`);
  cy.get(document.accessLevelPill.save).click()
    .wait(`@patchPieces${randomInt}`);
  if (hasPreviousVersion) {
    cy.wait(2000); // arbitrary wait for more piece patches to pieces
  }
  cy.get(auk.loader).should('not.exist');
}

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

context('Access level tests', () => {
  const agendaDate = Cypress.dayjs('2022-04-18');
  const subcaseTitle = 'Cypress test: Publications via MR - 1652967454';
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };
  // all 4 pieces have 'intern-regering' at the start

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should add a BIS/TER and check if underlying acces level changes to intern regering', () => {
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle, true);
    setCurrentVersionAccesLevel('bestaandePublicatie', accessPublic);
    // upload document
    cy.addNewPieceToAgendaitem(subcaseTitle, 'bestaandePublicatie', file);

    checkPreviousVersionAccesLevel('bestaandePublicatieBIS.pdf', 'bestaandePublicatie', accessCabinet);
  });

  it('should change the access level on a BIS/TER and check if underlying acces level changes correctly', () => {
    // setup
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle, true);

    // add BIS to publicatieMB
    cy.addNewPieceToAgendaitem(subcaseTitle, 'publicatieMB', file);
    // set accesLevels to publiek
    setCurrentVersionAccesLevel('publicatieMB', accessPublic, true);
    setPreviousVersionAccesLevel('publicatieMBBIS', 'publicatieMB', accessPublic);
    // change access level to overheid, check previous version got a stricter level
    setCurrentVersionAccesLevel('publicatieMB', accessGovernment, true);
    checkPreviousVersionAccesLevel('publicatieMBBIS.pdf', 'publicatieMB', accessCabinet);

    // add BIS and TER to publicatieDecreet
    cy.addNewPieceToAgendaitem(subcaseTitle, 'publicatieDecreet', file);
    cy.addNewPieceToAgendaitem(subcaseTitle, 'publicatieDecreetBIS', file);
    // set accesLevels to publiek
    setCurrentVersionAccesLevel('publicatieDecreetTER', accessPublic, true);
    setPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', accessPublic);
    setPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet', accessPublic);
    // change access level to regering, check previous versions got a stricter level
    setCurrentVersionAccesLevel('publicatieDecreetTER', accessCabinet, true);
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', accessCabinet);
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet.pdf', accessCabinet);

    // change access level on BatchDocumentsDetailsModal on single document
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.documentDetailsRow.accessLevel).eq(0)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(accessConfidential)
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    cy.intercept('GET', '/document-containers/**').as('getDocumentContainers1');
    cy.get(document.batchDocumentsDetails.save).click()
      .wait('@patchPieces1')
      .wait('@getDocumentContainers1');

    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', accessConfidential);
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet.pdf', accessConfidential);

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
    cy.get(dependency.emberPowerSelect.option).contains(accessInternal)
      .click();
    cy.get(document.documentDetailsRow.accessLevel).eq(1)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(accessInternal)
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces2');
    cy.intercept('GET', '/document-containers/**').as('getDocumentContainers2');
    cy.get(document.batchDocumentsDetails.save).click()
      .wait('@patchPieces2')
      .wait('@getDocumentContainers2');

    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreetBIS', accessInternal);
    checkPreviousVersionAccesLevel('publicatieDecreetTER', 'publicatieDecreet.pdf', accessInternal);
    checkPreviousVersionAccesLevel('publicatieMBBIS', 'publicatieMB', accessInternal);

    // change access level to a lower one and check that there are no changes to underlying level
    setCurrentVersionAccesLevel('publicatieMBBIS', accessGovernment, true);
    checkPreviousVersionAccesLevel('publicatieMBBIS', 'publicatieMB', accessInternal);
  });
});
