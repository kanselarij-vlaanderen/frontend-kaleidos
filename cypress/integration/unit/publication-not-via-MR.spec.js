/* global context, it, cy, beforeEach, afterEach, Cypress */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function selectFromDropdown(item) {
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 5000,
  }).wait(500)
    .contains(item)
    .scrollIntoView()
    .trigger('mouseover')
    .click({
      force: true,
    });
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 15000,
  }).should('not.exist');
}


context('link publication not via MR to MR', () => {
  // const nameToCheck = 'Jambon';
  const agendaDetailLink = 'vergadering/62C5974E03A74CBB92D216A3/agenda/62C5974F03A74CBB92D216A4/agendapunten/62C5975303A74CBB92D216A7';
  // const subcaseShortTitle1 = 'Subcase for linking publication not via MR to MR linked - 1657116367';
  const subcaseShortTitle2 = 'Subcase for linking publication not via MR to MR unlinked - 1657116367';
  // const domain1 = {
  //   name: 'Cultuur, Jeugd, Sport en Media',
  //   selected: true,
  //   fields: ['Media'],
  // };
  // const file1 = {
  //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test for linking publication not via MR to MR - DOC1', fileType: 'Nota',
  // };
  // const file2 = {
  //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test for linking publication not via MR to MR - DOC2', fileType: 'BVR',
  // };
  // const file3 = {
  //   folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test for linking publication not via MR to MR - DOC3', fileType: 'Decreet',
  // };

  const agendaDate = Cypress.dayjs('2022-04-21').hour(10);

  const fields1 = {
    number: 3000,
    shortTitle: 'publication already linked to MR',
    decisionDate: Cypress.dayjs().add(1, 'weeks')
      .day(3),
  };
  const fields2 = {
    number: 3001,
    // this shorttitle will be subcaseShortTitle2, command changed to allow for this possibility
    decisionDate: Cypress.dayjs().add(1, 'weeks')
      .day(3),
  };
  const fields3 = {
    number: 3002,
    shortTitle: 'publication not via MR for linking to MR',
    decisionDate: Cypress.dayjs().add(1, 'weeks')
      .day(3),
  };

  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
    cy.visit('/publicaties');
    cy.wait('@getRegulationTypes');
  });

  afterEach(() => {
    cy.logout();
  });

  it('link publication not via MR to MR', () => {
    cy.login('Admin');
    cy.visitAgendaWithLink(agendaDetailLink);
    // cy.openAgendaForDate(agendaDate2);
    cy.openAgendaitemDocumentTab(subcaseShortTitle2, true);
    cy.get(route.agendaitemDocuments.openPublication).click();

    cy.get((publication.batchDocumentsPublicationRow.linkOption)).eq(0)
      .click();
    selectFromDropdown('Bestaand');
    cy.get((publication.publicationsFlowSelector)).eq(0)
      .click();
    // check if publication linked to other case can't be found
    cy.get(dependency.emberPowerSelect.searchInput).clear()
      .type(fields1.number);
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains('Geen resultaten gevonden');

    // check if publication linked to same case can be found
    cy.get(dependency.emberPowerSelect.searchInput).clear()
      .type(fields2.number);
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(fields2.number);

    // check if existing publication not via MR can be found and linked
    cy.get(dependency.emberPowerSelect.searchInput).clear()
      .type(fields3.number);
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.intercept('DELETE', '/cases/*').as('deleteCases');
    cy.intercept('DELETE', '/decision-activities/*').as('deleteDecisionActivity');
    cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlows');
    cy.intercept('PATCH', '/pieces/*').as('patchPieces');
    cy.get(dependency.emberPowerSelect.option).contains(fields3.number)
      .scrollIntoView()
      .trigger('mouseover')
      .click()
      .wait('@deleteCases')
      .wait('@deleteDecisionActivity')
      .wait('@patchPublicationFlows')
      .wait('@patchPieces');

    // go to publication
    cy.visit('/publicaties/overzicht/zoeken');
    cy.get(route.search.input).clear()
      .type(fields3.number);
    cy.get(route.search.trigger).click();
    cy.get(route.searchPublications.row.number).contains(fields3.number)
      .click();

    // check if source changed to MR
    cy.get(publication.publicationHeader.number).contains('VIA MINISTERRAAD');

    // Government areas are not copied when linking to an existing MR
    cy.get(utils.governmentAreasPanel.emptyState);

    // check if document linked
    cy.intercept('GET', '/pieces?filter**publication-flow**').as('getPieces');
    cy.get(publication.publicationNav.decisions).click()
      .wait('@getPieces');
    cy.get(publication.documentCardStep.card).as('documentOnMR')
      .should('have.length', 1, {
        timeout: 5000,
      });
    // TODO-BUG file name is being showed instead of piece name, might be intended
    // cy.get('@documentOnMR').contains(file3.newFileName);
    // check if link to agendaitem works
    cy.get(publication.publicationNav.case).click();
    cy.get(publication.publicationCaseInfo.startDate).contains(agendaDate.format('DD-MM-YYYY'));
    cy.get(publication.publicationCaseInfo.startDate).invoke('removeAttr', 'target')
      .scrollIntoView()
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
  });
});
