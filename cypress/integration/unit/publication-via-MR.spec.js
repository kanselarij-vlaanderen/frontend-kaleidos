/* global context, it, cy, afterEach, Cypress */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import agenda from '../../selectors/agenda.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Publications via MR tests', () => {
  const publicationNumber = 1515;
  const publicationNumber2 = 1517;
  const publicationNumber3 = 1518;
  const newPublicationNumber = 1516;
  const agendaDate = Cypress.dayjs().add(13, 'weeks')
    .day(3);
  const formattedAgendaDate = agendaDate.format('DD-MM-YYYY');
  const columnKeyNames = ['source', 'decisionDate'];
  const startDate = agendaDate.format('DD-MM-YYYY');
  const openingDate = Cypress.dayjs().format('DD-MM-YYYY');
  const dueDate = Cypress.dayjs().add(3, 'weeks');
  const formattedDueDate = dueDate.format('DD-MM-YYYY');
  const numacNumber = 12345678;
  const testId = `${currentTimestamp()}`;
  const type = 'Nota';
  const caseTitleShort = 'Cypress test: Dossier publications via MR';
  const subcaseTitleShort = `Cypress test: Publications via MR - ${testId}`;
  const nameToCheck = 'Jambon';
  const fileName1 = 'nieuwePublicatie';
  const fileName2 = 'bestaandePublicatie';
  const fileName3 = 'publicatieMB';
  const fileName4 = 'publicatieDecreet';
  const file1 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName1, fileType: 'Nota',
  };
  const file2 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName2, fileType: 'BVR',
  };
  const file3 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName3, fileType: 'MB',
  };
  const file4 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName4, fileType: 'Decreet',
  };
  const files = [file1, file2, file3, file4];

  afterEach(() => {
    cy.logout();
  });

  it('should create a new agenda with item for testing purposes', () => {
    cy.login('Admin');
    cy.createCase(caseTitleShort);
    cy.addSubcase(type, subcaseTitleShort);
    cy.openSubcase(0);
    cy.addSubcaseMandatee(1);
    cy.addDocumentsToSubcase(files);
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort);
  });

  it('should open an agendaitem, link document to a new publication and check if it was created properly', () => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 1, {
      timeout: 5000,
    })
      .eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);

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
  });

  it('should open the new publication and check if data was inherited correctly', () => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber)
      .click();

    // check data
    cy.get(publication.publicationCaseInfo.publicationNumber).contains(publicationNumber);
    cy.get(publication.publicationCaseInfo.startDate).contains(startDate);
    cy.get(publication.publicationCaseInfo.openingDate).contains(openingDate);

    // check mandatee inheritance
    cy.get(publication.mandateesPanel.rows).should('have.length', 1, {
      timeout: 5000,
    })
      .eq(0)
      .find(publication.mandateesPanel.row.fullName)
      .should('contain', nameToCheck);
    // change mandatee
    cy.intercept('GET', '/mandatees**').as('getMandatees');
    cy.get(publication.mandateesPanel.add).click();
    cy.wait('@getMandatees');
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains('Hilde Crevits')
      .scrollIntoView()
      .click();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(utils.mandateesSelector.add).click();
    cy.wait('@patchPublicationFlow');
    cy.get(publication.mandateesPanel.rows).should('have.length', 2);
    // check if mandatee on MR still the same after change on publication
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 1)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);
  });

  it('should open the new publication and check the publication case info panel', () => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber)
      .click();

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
      .contains('Intern Regering');
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
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
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

  it('should check the inheritance of regulation types and the decisions tab info panel', () => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    const numberOfPages = 10;

    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab('Cypress test: Publications via MR');
    cy.get(route.agendaitemDocuments.openPublication).click();

    // make new publication for MB
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName3)
      .parent()
      .find(publication.batchDocumentsPublicationRow.new)
      .click();
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(publicationNumber2);
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    // more posts happen, but the patch is the final part of the create action
    cy.intercept('PATCH', '/pieces/**').as('patchPieceForPublication');
    cy.get(publication.newPublication.create).click();
    cy.wait('@createNewPublicationFlow');
    cy.wait('@patchPieceForPublication');
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName3)
      .parent()
      .find(publication.batchDocumentsPublicationRow.linkOption)
      .contains('Bestaand');

    // make new publication for Decreet
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName4)
      .parent()
      .find(publication.batchDocumentsPublicationRow.new)
      .click();
    cy.get(publication.newPublication.number).click()
      .clear()
      .type(publicationNumber3);
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    // more posts happen, but the patch is the final part of the create action
    cy.intercept('PATCH', '/pieces/**').as('patchPieceForPublication');
    cy.get(publication.newPublication.create).click();
    cy.wait('@createNewPublicationFlow');
    cy.wait('@patchPieceForPublication');
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName4)
      .parent()
      .find(publication.batchDocumentsPublicationRow.linkOption)
      .contains('Bestaand');

    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');

    // check if the regulation type is inherited correctly on all publications
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(newPublicationNumber)
      .click();
    cy.get(publication.publicationNav.decisions).click();
    cy.get(publication.decisionsInfoPanel.view.regulationType).contains('Besluit van de Vlaamse Regering');
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber2)
      .click();
    cy.get(publication.publicationNav.decisions).click();
    cy.get(publication.decisionsInfoPanel.view.regulationType).contains('Ministerieel besluit');
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber3)
      .click();
    cy.get(publication.publicationNav.decisions).click();
    cy.get(publication.decisionsInfoPanel.view.regulationType).contains('Decreet');

    // check the info panel edit rollback
    cy.get(publication.decisionsInfoPanel.openEdit).click();
    cy.get(publication.decisionsInfoPanel.edit.regulationType).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Besluit van de Vlaamse Regering')
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(publication.decisionsInfoPanel.edit.numberOfPages).find(auk.input)
      .click()
      .type(numberOfPages);
    cy.get(publication.decisionsInfoPanel.cancel).click();
    cy.get(publication.decisionsInfoPanel.view.regulationType).contains('Decreet');
    cy.get(publication.decisionsInfoPanel.view.numberOfPages).contains('-');
    // check the info panel edit save
    cy.get(publication.decisionsInfoPanel.openEdit).click();
    cy.get(publication.decisionsInfoPanel.edit.regulationType).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Besluit van de Vlaamse Regering')
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(publication.decisionsInfoPanel.edit.numberOfPages).find(auk.input)
      .click()
      .type(numberOfPages);
    cy.get(publication.decisionsInfoPanel.save).click();
    cy.get(publication.decisionsInfoPanel.view.regulationType).contains('Besluit van de Vlaamse Regering');
    cy.get(publication.decisionsInfoPanel.view.numberOfPages).contains(numberOfPages);

    // check link to agenda (currently possible to random version instead of last)
    cy.get(publication.decisionsInfoPanel.view.decisionLink).invoke('removeAttr', 'target')
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten');
  });
});
