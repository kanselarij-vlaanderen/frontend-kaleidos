/* global context, it, cy, before, beforeEach, afterEach, Cypress */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import agenda from '../../selectors/agenda.selectors';
import route from '../../selectors/route.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Publications via MR tests', () => {
  const publicationNumber = 1515;
  const newPublicationNumber = 1516;
  const agendaDate = Cypress.dayjs().add(13, 'weeks')
    .day(3);
  const testId = `${currentTimestamp()}`;
  const type = 'Nota';
  const subcaseTitleShort = `Cypress test: Publications via MR - ${testId}`;
  const fileName1 = 'nieuwePublicatie';
  const fileName2 = 'bestaandePublicatie';
  const file1 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName1, fileType: 'Nota',
  };
  const file2 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName2, fileType: 'BVR',
  };
  const files = [file1, file2];

  before(() => {
    cy.login('Admin');
    cy.visit('/dossiers/5F02E3F87DE3FC0008000002/deeldossiers');
    cy.addSubcase(type, subcaseTitleShort);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort, false);
    cy.logoutFlow();
  });

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open an agendaitem, link document to a new publication and check if everything works', () => {
    const formattedAgendaDate = agendaDate.format('DD-MM-YYYY');
    const columnKeyNames = ['source', 'decisionDate'];
    const startDate = agendaDate.format('DD-MM-YYYY');
    const openingDate = Cypress.dayjs().format('DD-MM-YYYY');
    const dueDate = Cypress.dayjs().add(3, 'weeks');
    const formattedDueDate = dueDate.format('DD-MM-YYYY');
    const numacNumber = 12345678;

    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitleShort);
    cy.get(route.agendaitemDocuments.openPublication).click();
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName1)
      .parent()
      .find(publication.batchDocumentsPublicationRow.new)
      .click();

    // create new publication
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(publicationNumber);
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    // more posts happen, but the patch is the final part of the create action
    cy.intercept('PATCH', '/pieces/**').as('patchPieceForPublication');
    cy.get(publication.newPublication.create).click();
    cy.wait('@createNewPublicationFlow');
    cy.wait('@patchPieceForPublication');
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName1)
      .parent()
      .find(publication.batchDocumentsPublicationRow.linkOption)
      .contains('Bestaand');

    // check if publication was made correctly
    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber)
      .parent()
      .as('row');
    cy.get(publication.publicationTableRow.row.shortTitle).contains(subcaseTitleShort);
    cy.checkColumnsIfUnchecked(columnKeyNames);
    cy.get('@row').find(publication.publicationTableRow.row.source)
      .contains('Via Ministerraad');
    cy.get('@row').find(publication.publicationTableRow.row.decisionDate)
      .contains(formattedAgendaDate);
    cy.get('@row').find(publication.publicationTableRow.row.goToPublication)
      .click();

    // check data
    cy.get(publication.publicationCaseInfo.publicationNumber).contains(publicationNumber);
    cy.get(publication.publicationCaseInfo.startDate).contains(startDate);
    cy.get(publication.publicationCaseInfo.openingDate).contains(openingDate);

    // check rollback after cancel edit
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.publicationNumber).click()
      .clear()
      .type(newPublicationNumber);
    cy.get(publication.publicationCaseInfo.editView.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${numacNumber}{enter}`);
    cy.get(publication.publicationCaseInfo.editView.dueDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(dueDate);
    cy.get(publication.publicationCaseInfo.editView.cancel).click();
    cy.get(publication.publicationCaseInfo.publicationNumber).contains(publicationNumber);
    cy.get(publication.publicationCaseInfo.numacNumber).contains('-');
    cy.get(publication.publicationCaseInfo.dueDate).contains('-');

    // check edit and save
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.publicationNumber).click()
      .clear()
      .type(newPublicationNumber);
    cy.get(publication.publicationCaseInfo.editView.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${numacNumber}{enter}`);
    cy.get(publication.publicationCaseInfo.editView.dueDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(dueDate);
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.intercept('PATCH', '/publication-subcases/**').as('patchPublicationSubcase');
    cy.get(publication.publicationCaseInfo.editView.save).click();
    cy.wait('@patchPublicationFlow');
    cy.wait('@patchPublicationSubcase');
    cy.get(publication.publicationCaseInfo.publicationNumber).contains(newPublicationNumber);
    cy.get(publication.publicationCaseInfo.numacNumber).contains(numacNumber);
    cy.get(publication.publicationCaseInfo.dueDate).contains(formattedDueDate);

    // check document access not changeable
    cy.get(publication.publicationNav.decisions).click();
    // data loading happens
    cy.get(publication.documentCardStep.card).as('documentOnMR')
      .should('have.length', 1);
    cy.get('@documentOnMR')
      .find(document.accessLevelPill.pill)
      .as('documentOnMRPill')
      .contains('Intern Regering')
      .click();
    cy.get('@documentOnMR').find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .click();
    cy.get('@documentOnMR').find(document.accessLevelPill.save)
      .click();
    cy.get('@documentOnMRPill').contains('Intern Regering');
    cy.get(publication.publicationNav.case).click();

    // check link
    cy.get(publication.publicationCaseInfo.startDate).invoke('removeAttr', 'target')
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten');
    cy.intercept('GET', '/pieces/*/publication-flow').as('getPiecesPubFlow');
    cy.intercept('GET', '/pieces/*/sign-marking**').as('getPiecesSignMarking');
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.wait('@getPiecesPubFlow');
    cy.wait('@getPiecesSignMarking');
    cy.get(document.documentCard.pubLink).contains(newPublicationNumber)
      .click();
    cy.url().should('contain', '/publicaties/');
    cy.url().should('contain', '/dossier');
  });

  it('should open an agendaitem and link document to an existing publication', () => {
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab('Cypress test: Publications via MR');
    cy.get(route.agendaitemDocuments.openPublication).click();
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName2)
      .parent()
      .as('row');
    cy.get('@row').find(publication.batchDocumentsPublicationRow.linkOption)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Bestaand')
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get('@row').find(publication.publicationsFlowSelector)
      .click();
    cy.intercept('GET', `/publication-flows**?filter**${newPublicationNumber}**`).as('getFilteredId');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces');
    cy.get(dependency.emberPowerSelect.searchInput).type(newPublicationNumber)
      .wait('@getFilteredId');
    cy.get(dependency.emberPowerSelect.option).contains(newPublicationNumber)
      .scrollIntoView()
      .trigger('mouseover')
      .click()
      .wait('@patchPieces');
  });
});
