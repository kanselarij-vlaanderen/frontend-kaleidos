/* global context, it, cy, beforeEach, afterEach, Cypress */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import agenda from '../../selectors/agenda.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

context('Publications via MR tests', () => {
  const publicationNumber1 = 1515;
  const publicationNumber2 = 1516;
  const publicationNumber3 = 1517;
  const publicationNumber4 = 1518;
  const agendaDate = Cypress.dayjs('2022-04-18').hour(10);
  const agendaitemDetailLink = '/vergadering/6286497109DEF9BE3C9DA980/agenda/6286497309DEF9BE3C9DA981/agendapunten/6286499609DEF9BE3C9DA987';
  const agendaitemDocLink = '/vergadering/6286497109DEF9BE3C9DA980/agenda/6286497309DEF9BE3C9DA981/agendapunten/6286499609DEF9BE3C9DA987/documenten';
  const formattedAgendaDate = agendaDate.format('DD-MM-YYYY');
  const columnKeyNames = ['source', 'decisionDate'];
  const startDate = agendaDate.format('DD-MM-YYYY');
  const openingDate = Cypress.dayjs().format('DD-MM-YYYY');
  const dueDate = Cypress.dayjs().add(3, 'weeks');
  const formattedDueDate = dueDate.format('DD-MM-YYYY');
  const numacNumber = 134792468;
  const subcaseTitleShort = 'Cypress test: Publications via MR - 1652967454';
  const nameToCheck = 'Jambon';
  const fileName1 = 'nieuwePublicatie'; // type nota
  const fileName2 = 'bestaandePublicatie'; // type BVR
  const fileName3 = 'publicatieMB'; // type MB
  const fileName4 = 'publicatieDecreet'; // type Decreet

  // setup for this spec
  // agenda with 1 proposed subcase/agendaitem with 4 documents
  // 1 nota, 1 BVR, 1 MB, 1 Decreet

  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should open an agendaitem, link document to a new publication and check if it was created properly', () => {
    cy.visitAgendaWithLink(agendaitemDetailLink);
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 1)
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
      .type(publicationNumber1);
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
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber1)
      .parent()
      .as('row');
    cy.get(publication.publicationTableRow.row.shortTitle).contains(subcaseTitleShort);
    cy.checkColumnsIfUnchecked(columnKeyNames);
    cy.get('@row').find(publication.publicationTableRow.row.source)
      .contains('Via Ministerraad');
    cy.get('@row').find(publication.publicationTableRow.row.decisionDate)
      .contains(formattedAgendaDate);

    // check if decisiondate is shown in publicationsInfoPanel and if links works correctly
    cy.get('@row').click();
    cy.get(publication.publicationCaseInfo.decisionDate).contains(formattedAgendaDate);
    cy.get(publication.publicationCaseInfo.startDate).invoke('removeAttr', 'target')
      .scrollIntoView()
      .click();
    cy.url().should('include', agendaitemDetailLink);
  });

  it('should open the new publication and check if data was inherited correctly', () => {
    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber1)
      .click();
    cy.url().should('include', '/publicatie')
      .should('include', '/dossier');

    // check data
    cy.get(publication.publicationCaseInfo.publicationNumber).contains(publicationNumber1);
    cy.get(publication.publicationCaseInfo.startDate).contains(startDate);
    cy.get(publication.publicationCaseInfo.openingDate).contains(openingDate);

    // check mandatee inheritance
    cy.get(publication.mandateesPanel.rows).should('have.length', 1)
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
    cy.visitAgendaWithLink(agendaitemDetailLink);
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 1)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);
  });

  it('should open the new publication and check the publication case info panel', () => {
    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber1)
      .click();
    cy.url().should('include', '/publicatie')
      .should('include', '/dossier');

    // check rollback after cancel edit
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.publicationNumber).click()
      .clear()
      .type(publicationNumber2);
    cy.get(publication.publicationCaseInfo.editView.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${numacNumber}{enter}`);
    cy.get(publication.publicationCaseInfo.editView.dueDate).find(auk.datepicker)
      .click();
    cy.setDateInFlatpickr(dueDate);
    cy.get(publication.publicationCaseInfo.editView.cancel).click();
    cy.get(publication.publicationCaseInfo.publicationNumber).contains(publicationNumber1);
    cy.get(publication.publicationCaseInfo.numacNumber).contains('-');
    cy.get(publication.publicationCaseInfo.dueDate).contains('-');

    // check edit and save
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.publicationNumber).click()
      .clear()
      .type(publicationNumber2);
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
    cy.get(publication.publicationCaseInfo.publicationNumber).contains(publicationNumber2);
    cy.get(publication.publicationCaseInfo.numacNumber).contains(numacNumber);
    cy.get(publication.publicationCaseInfo.dueDate).contains(formattedDueDate);

    // check document access not changeable
    cy.get(publication.publicationNav.decisions).click();
    // data loading happens
    cy.get(publication.documentCardStep.card).as('documentOnMR')
      .should('have.length', 1);
    cy.get(publication.publicationNav.case).click();

    // check link
    cy.get(publication.publicationCaseInfo.startDate).invoke('removeAttr', 'target')
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten');
    cy.intercept('GET', '/pieces/*/publication-flow').as('getPiecesPubFlow');
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.wait('@getPiecesPubFlow');
    cy.get(document.documentCard.pubLink).contains(publicationNumber2)
      .click();
    cy.url().should('contain', '/publicaties/');
    cy.url().should('contain', '/dossier');
  });

  it('should open an agendaitem and link document to an existing publication', () => {
    cy.visitAgendaWithLink(agendaitemDocLink);
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
    cy.intercept('GET', `/publication-flows**?filter**case**${publicationNumber2}**`).as('getFilteredIdCase');
    cy.intercept('GET', `/publication-flows**?filter**decision-activity**${publicationNumber2}**`).as('getFilteredIdDecisionActivity');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces');
    cy.get(dependency.emberPowerSelect.searchInput).type(publicationNumber2)
      .wait('@getFilteredIdCase')
      .wait('@getFilteredIdDecisionActivity');
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(publicationNumber2)
      .scrollIntoView()
      .trigger('mouseover')
      .click()
      .wait('@patchPieces');
  });

  it('should check the inheritance of regulation types and the decisions tab info panel', () => {
    const numberOfPages = 10;
    cy.visitAgendaWithLink(agendaitemDocLink);
    cy.get(route.agendaitemDocuments.openPublication).click();

    // make new publication for MB
    cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName3)
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
      .type(publicationNumber4);
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
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber2)
      .click();
    cy.url().should('include', '/publicatie')
      .should('include', '/dossier');
    cy.get(publication.publicationNav.decisions).click();
    cy.get(publication.decisionsInfoPanel.view.regulationType).contains('Besluit van de Vlaamse Regering');
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber3)
      .click();
    cy.url().should('include', '/publicatie')
      .should('include', '/dossier');
    cy.get(publication.publicationNav.decisions).click();
    cy.get(publication.decisionsInfoPanel.view.regulationType).contains('Ministerieel besluit');
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.publicationNumber).contains(publicationNumber4)
      .click();
    cy.url().should('include', '/publicatie')
      .should('include', '/dossier');
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
