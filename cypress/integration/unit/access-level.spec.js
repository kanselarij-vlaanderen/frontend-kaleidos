/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function setVldocAccesLevel(position, accesLevel) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.log('setVldocAccesLevel');
  // this next line is a loading check
  cy.get(document.vlDocument.showPieceViewer);
  cy.get(document.vlDocument.piece).eq(position)
    .as('document');
  cy.get('@document').find(document.accessLevelPill.edit)
    .click();
  cy.get('@document').find(dependency.emberPowerSelect.trigger)
    .click();
  cy.get(dependency.emberPowerSelect.option).contains(accesLevel)
    .click();
  cy.intercept('PATCH', '/pieces/*').as(`patchPieces${randomInt}`);
  cy.get(document.accessLevelPill.save).click()
    .wait(`@patchPieces${randomInt}`);
  // TODO-waits: better wait, 7000 mostly too long but sometimes isn't, waiting for loader to not exist not enough
  cy.wait(7000);
  cy.log('/setVldocAccesLevel');
}

function checkVldocAccesLevel(position, accesLevel) {
  cy.log('checkVldocAccesLevel');
  // this next line is a loading check
  cy.get(document.vlDocument.showPieceViewer);
  cy.get(document.vlDocument.piece).eq(position)
    .as('document');
  cy.get('@document').find(document.accessLevelPill.pill)
    .contains(accesLevel);
  cy.log('/checkVldocAccesLevel');
}

context('Decision tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it.only('should change the access level on a BIS/TER and check if underlying acces level changes correctly', () => {
    const agendaDate = Cypress.dayjs('2022-04-18');
    const subcaseTitle = 'Cypress test: Publications via MR - 1652967454';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const caseName = 'Cypress case: Dossier publications via MR - 1652967454';
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress subcase: linked documents - 1652967454';
    const subcaseTitleLong = 'Cypress test voor het wijzigen van toegangsrechten op linked documents';

    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('Cannot read properties of null')) {
        return false;
      }
    });
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle);

    // add BIS and TER
    cy.get(document.documentCard.name.value).contains('publicatieDecreet')
      .parents(document.documentCard.card)
      .as('firstCard');
    cy.get(document.documentCard.name.value).contains('publicatieMB')
      .parents(document.documentCard.card)
      .as('secondCard');
    // TODO-selector double selector
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
    // set BIS and TER levels to public
    cy.get('@firstCard').find(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .click();
    setVldocAccesLevel(0, 'Publiek');
    setVldocAccesLevel(1, 'Publiek');
    setVldocAccesLevel(2, 'Publiek');

    // change access level of BIS on DocumentCard
    cy.get('@firstCard').find(document.accessLevelPill.edit)
      .eq(0)
      .click();
    cy.get('@firstCard').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Publiek')
      .click();
    cy.intercept('PATCH', '/pieces/*').as('patchPieces1');
    cy.get(document.accessLevelPill.save).click()
      .wait('@patchPieces1');
    cy.wait(5000);
    checkVldocAccesLevel(0, 'Publiek');
    checkVldocAccesLevel(1, 'Intern Regering');
    checkVldocAccesLevel(2, 'Intern Regering');

    // change access level on VlDocument
    setVldocAccesLevel(1, 'Publiek');
    setVldocAccesLevel(2, 'Publiek');
    setVldocAccesLevel(0, 'Intern Overheid');
    checkVldocAccesLevel(0, 'Intern Overheid');
    checkVldocAccesLevel(1, 'Intern Regering');
    checkVldocAccesLevel(2, 'Intern Regering');

    // change access level on BatchDocumentsDetailsModal on single document
    setVldocAccesLevel(1, 'Publiek');
    setVldocAccesLevel(2, 'Publiek');
    cy.get(route.agendaitemDocuments.batchEdit).click();
    // cy.get(document.documentDetailsRow.input).should('have.value', 'publicatieDecreetTER')
    //   .parents(document.documentDetailsRow.row)
    //   .as('row1');
    cy.get(document.documentDetailsRow.accessLevel).eq(0)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Regering')
      .click();
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    cy.intercept('GET', '/document-containers/**').as('getDocumentContainers1');
    cy.get(document.batchDocumentsDetails.save).click()
      .wait('@patchPieces1')
      .wait('@getDocumentContainers1');

    cy.get('@firstCard').find(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .click();
    cy.wait(5000);
    checkVldocAccesLevel(0, 'Intern Regering');
    checkVldocAccesLevel(1, 'Intern Regering');
    checkVldocAccesLevel(2, 'Intern Regering');

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
    cy.get(dependency.emberPowerSelect.option).contains('Ministerraad')
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

    cy.get('@firstCard').find(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .click();
    cy.wait(5000);
    checkVldocAccesLevel(0, 'Ministerraad');
    checkVldocAccesLevel(1, 'Ministerraad');
    checkVldocAccesLevel(2, 'Ministerraad');
    cy.get('@firstCard').find(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .click();
    cy.get('@secondCard').find(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .click();
    cy.wait(5000);
    checkVldocAccesLevel(0, 'Intern Secretarie');
    checkVldocAccesLevel(1, 'Intern Secretarie');

    // change access level on LinkedDocumentLink
    cy.openCase(caseName);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, null, null);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort);
    cy.openAgendaitemDocumentTab(SubcaseTitleShort);
    cy.get(document.linkedDocumentLink.name).contains('publicatieDecreet')
      .parents(document.linkedDocumentLink.card)
      .as('firstLinkedCard');

    cy.get('@firstLinkedCard').find(document.linkedDocumentLink.versionHistory)
      .find(auk.accordion.header.button)
      .click();
    setVldocAccesLevel(0, 'Publiek');

    checkVldocAccesLevel(0, 'Publiek');
    checkVldocAccesLevel(1, 'Ministerraad');
    checkVldocAccesLevel(2, 'Ministerraad');
  });

  it('should change the access level on a BIS/TER and check if underlying acces level changes correctly', () => {
    const agendaDate = Cypress.dayjs('2022-04-18');
    const SubcaseTitleShort = 'Cypress subcase: linked documents - 1652967454';

    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('Cannot read properties of null')) {
        return false;
      }
    });

    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(SubcaseTitleShort);
    cy.get(document.linkedDocumentLink.name).contains('publicatieDecreet')
      .parents(document.linkedDocumentLink.card)
      .as('firstCard');

    cy.get('@firstCard').find(document.linkedDocumentLink.versionHistory)
      .find(auk.accordion.header.button)
      .click();
    setVldocAccesLevel(0, 'Publiek');

    checkVldocAccesLevel(0, 'Publiek');
    checkVldocAccesLevel(1, 'Ministerraad');
    checkVldocAccesLevel(2, 'Ministerraad');
  });
});
