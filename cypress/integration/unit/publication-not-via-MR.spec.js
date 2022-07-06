/* global context, it, cy, beforeEach, afterEach, Cypress */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import utils from '../../selectors/utils.selectors';
import route from '../../selectors/route.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

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
  const testId = `testId=${currentTimestamp()}`;
  const caseShortTitle1 = `Cypress link publication not via MR to MR linked - ${testId}`;
  const caseShortTitle2 = `Cypress link publication not via MR to MR unlinked - ${testId}`;
  const type = 'Mededeling';
  const subcaseShortTitle1 = `test for linking publication not via MR to MR linked - ${testId}`;
  const subcaseShortTitle2 = `test for linking publication not via MR to MR unlinked - ${testId}`;
  const domain1 = {
    name: 'Cultuur, Jeugd, Sport en Media',
    selected: true,
    fields: ['Media'],
  };
  const file1 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test for linking publication not via MR to MR - DOC1', fileType: 'Nota',
  };
  const file2 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test for linking publication not via MR to MR - DOC2', fileType: 'Nota',
  };
  const file3 = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test for linking publication not via MR to MR - DOC3', fileType: 'Nota',
  };

  const agendaDate1 = Cypress.dayjs().add(1, 'weeks')
    .day(21);
  const agendaDate2 = Cypress.dayjs().add(1, 'weeks')
    .day(22);

  const fields1 = {
    number: 9000,
    shortTitle: 'publication already linked to MR',
    decisionDate: Cypress.dayjs().add(1, 'weeks')
      .day(3),
  };
  const fields2 = {
    number: 9001,
    // this shorttitle will be subcaseShortTitle2, command changed to allow for this possibility
    decisionDate: Cypress.dayjs().add(1, 'weeks')
      .day(3),
  };
  const fields3 = {
    number: 9002,
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

  it('setup link publication not via MR to MR', () => {
    cy.login('Admin');
    cy.createCase(caseShortTitle1);
    cy.addSubcase(type, subcaseShortTitle1);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase([file1]);

    cy.createCase(caseShortTitle2);
    cy.addSubcase(type, subcaseShortTitle2);
    cy.openSubcase(0);
    cy.addSubcaseMandatee(1);
    cy.addDomainsAndFields([domain1]);
    cy.addDocumentsToSubcase([file2, file3]);

    cy.createAgenda('Ministerraad', agendaDate1, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate1);
    cy.addAgendaitemToAgenda(subcaseShortTitle1);

    cy.openAgendaitemDocumentTab(subcaseShortTitle1, true);
    cy.get(route.agendaitemDocuments.openPublication).click();
    cy.get(publication.batchDocumentsPublicationRow.new).click();
    cy.fillInNewPublicationFields(fields1);
    cy.get(publication.newPublication.create).click();

    cy.createAgenda('Ministerraad', agendaDate2, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate2);
    cy.addAgendaitemToAgenda(subcaseShortTitle2);

    cy.openAgendaitemDocumentTab(subcaseShortTitle2, true);
    cy.get(route.agendaitemDocuments.openPublication).click();
    cy.get(publication.batchDocumentsPublicationRow.name).contains(file2.newFileName)
      .parent()
      .find(publication.batchDocumentsPublicationRow.new)
      .click();
    cy.fillInNewPublicationFields(fields2);
    cy.intercept('POST', '/cases').as('createNewCase');
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.get(publication.newPublication.create).click()
      .wait('@createNewCase')
      .wait('@createNewPublicationFlow');

    cy.createPublication(fields3);
  });

  it('link publication not via MR to MR', () => {
    cy.login('Admin');
    cy.openAgendaForDate(agendaDate2);
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
    cy.intercept('DELETE', '/agenda-item-treatments/*').as('deleteTreatments');
    cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlows');
    cy.intercept('PATCH', '/pieces/*').as('patchPieces');
    cy.get(dependency.emberPowerSelect.option).contains(fields3.number)
      .scrollIntoView()
      .trigger('mouseover')
      .click()
      .wait('@deleteCases')
      .wait('@deleteTreatments')
      .wait('@patchPublicationFlows')
      .wait('@patchPieces');

    // go to publication
    cy.visit('/zoeken/publicaties');
    cy.get(route.search.input).clear()
      .type(fields3.number);
    cy.get(route.search.trigger).click();
    cy.get(route.searchPublications.row.number).contains(fields3.number)
      .click();
    // check if source changed to MR
    cy.get(publication.publicationHeader.number).contains('VIA MINISTERRAAD');
    // check if publication inherited mandatee
    // TODO-BUG mandatee not inherited?
    // cy.get(publication.mandateesPanel.rows).should('have.length', 1)
    //   .eq(0)
    //   .find(publication.mandateesPanel.row.fullName)
    //   .should('contain', nameToCheck);
    // check if publication inherited field
    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 1, {
      timeout: 5000,
    });
    cy.get('@listItems').contains(domain1.name);
    cy.get('@listItems').contains(domain1.fields[0]);
    // check if document linked
    cy.intercept('GET', '/pieces?filter**publication-flow**').as('getPieces');
    cy.get(publication.publicationNav.decisions).click()
      .wait('@getPieces');
    cy.get(publication.documentCardStep.card).as('documentOnMR')
      .should('have.length', 1, {
        timeout: 5000,
      });
    // TODO-BUG
    // cy.get('@documentOnMR').contains(file3.newFileName);
    // check if link to agendaitem works
    cy.get(publication.publicationNav.case).click();
    cy.get(publication.publicationCaseInfo.startDate).contains(agendaDate2.format('DD-MM-YYYY'));
    cy.get(publication.publicationCaseInfo.startDate).invoke('removeAttr', 'target')
      .scrollIntoView()
      .click();
    cy.url().should('contain', '/vergadering/');
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
  });
});
