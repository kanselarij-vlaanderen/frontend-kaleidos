/* global context, it, cy, beforeEach, afterEach */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';

context('Publications overview tests', () => {
  // TODO-COMMAND we probably want to change the status via a command in further testing
  function createPublicationChangeStatus(fields) {
    cy.createPublication(fields);
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.sidebar.open).click(); // TODO-COMMAND test if sidebar is already open
    cy.get(publication.statusSelector).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(fields.newStatus)
      .click();
    if (fields.newStatus === 'Afgevoerd') {
      cy.get(publication.sidebar.confirmWithdraw).click();
    }
    cy.wait('@patchPublicationFlow');
    cy.get(publication.publicationNav.goBack).click();
  }

  const searchFields = {
    number: 1401,
    shortTitle: 'Besluitvorming Vlaamse Regering',
    longTitle: 'Besluitvorming Vlaamse Regering betreffende beslissingen',
    remark: 'Sinds 2021',
    numacNumber: 1234567890,
  };

  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should setup a publication for later search tests', () => {
    // needs 15 seconds for reindex in testsuite
    cy.createPublication(searchFields);
    cy.get(publication.sidebar.open).click();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.intercept('POST', '/identifications').as('postNumacNumber');
    cy.get(publication.sidebar.remark).type(searchFields.remark);
    cy.wait('@patchPublicationFlow');
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${searchFields.numacNumber}{enter}`)
      .wait('@postNumacNumber');
  });

  // TODO-SETUP once we have default data, this test could be moved to click-table.spec
  it('should open a publication after clicking a row', () => {
    cy.get(publication.publicationsIndex.loading).should('not.exist');
    cy.get(publication.publicationsIndex.dataTable).find(publication.publicationTableRow.rows)
      .first()
      .click();
    cy.url().should('contain', 'publicaties')
      .should('contain', '/dossier');
  });

  it('should test all the result amount options shown options in overview', () => {
    // const fields = {
    //   number: 1404,
    //   shortTitle: 'test',
    // };
    const elementsToCheck = [
      25,
      50,
      100,
      200
    ];

    // cy.createPublication(fields);
    // cy.get(publication.publicationNav.goBack).click();
    elementsToCheck.forEach((option) => {
      // In this loop, the options list should go away after url change but it doesn't always, creating a second option list that covers elements
      cy.get(dependency.emberPowerSelect.option).should('not.exist');
      cy.get(publication.publicationsIndex.numberSelector).find(dependency.emberPowerSelect.trigger)
        .click();
      cy.get(dependency.emberPowerSelect.option).contains(option)
        .click();
      cy.get(publication.publicationsIndex.loading).should('not.exist');
      cy.url().should('include', `aantal=${option}`);
    });
  });

  it('should check and uncheck all settings', () => {
    const columnKeyNames = [
      'shortTitle',
      'comment',
      'decisionDate',
      'speedProcedure',
      'publicationNumber',
      'regulationType',
      'numacNumber',
      'openingDate',
      'publicationTargetDate',
      'translationDueDate',
      'publicationDueDate',
      'publicationDate',
      'publicationReceivedDate',
      'translationReceivedDate',
      'translations',
      'proofs',
      'lastEdited',
      'proofPrintCorrector',
      'status',
      'source'
    ];

    cy.get(publication.publicationsIndex.configIcon).click();
    columnKeyNames.forEach((columnKeyName) => {
      cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`);
      cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).parent(auk.checkbox)
        .click();
      cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`).should('not.exist');
      cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).parent(auk.checkbox)
        .click();
      cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`);
    });
  });

  it('should test the filters in overview', () => {
    const fields1 = {
      number: 1405,
      shortTitle: 'testfilters1',
      newStatus: 'Afgevoerd',
    };
    const fields2 = {
      number: 1406,
      shortTitle: 'testfilters2',
      newStatus: 'Gepauzeerd',
    };
    const fields3 = {
      number: 1407,
      shortTitle: 'testfilters3',
      newStatus: 'Gepubliceerd',
    };
    // TODO-setup add default dataset to use (1 publication for each possible status)
    createPublicationChangeStatus(fields1);
    createPublicationChangeStatus(fields2);
    createPublicationChangeStatus(fields3);
    cy.intercept('GET', '/decisions?filter**').as('getDecisionsFilter');
    // TODO-publication we want to enable this when there is MR data (preferably in default set)
    // cy.get(publication.publicationsIndex.filterContent).click();
    // cy.get(publication.publicationsFilter.minister).parent(auk.checkbox)
    //   .click();
    // cy.get(publication.publicationsFilter.save).click();
    // cy.wait('@getDecisionsFilter');
    // cy.get(publication.publicationTableRow.row.source).should('not.contain', 'via Ministerraad');

    cy.get(publication.publicationsIndex.filterContent).click();
    cy.get(publication.publicationsFilter.minister).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.notMinister).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.save).click();
    cy.get(auk.emptyState);
    // cy.get(publication.publicationTableRow.row.source).should('not.contain', 'Niet via Ministerraad');

    cy.get(publication.publicationsIndex.filterContent).click();
    cy.get(publication.publicationsFilter.notMinister).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.published).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.save).click();
    cy.wait('@getDecisionsFilter');
    cy.get(publication.publicationTableRow.row.status).should('not.contain', fields3.newStatus);

    cy.get(publication.publicationsIndex.filterContent).click();
    cy.get(publication.publicationsFilter.published).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.paused).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.save).click();
    cy.wait('@getDecisionsFilter');
    cy.get(publication.publicationTableRow.row.status).should('not.contain', fields2.newStatus);

    cy.get(publication.publicationsIndex.filterContent).click();
    cy.get(publication.publicationsFilter.paused).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.toPublish).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.save).click();
    cy.wait('@getDecisionsFilter');
    cy.get(publication.publicationTableRow.row.status).should('not.contain', 'Te publiceren');

    cy.get(publication.publicationsIndex.filterContent).click();
    cy.get(publication.publicationsFilter.toPublish).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.withdrawn).parent(auk.checkbox)
      .click();
    cy.get(publication.publicationsFilter.save).click();
    cy.wait('@getDecisionsFilter');
    cy.get(publication.publicationTableRow.row.status).should('not.contain', fields1.newStatus);
  });

  it('should test the short title tooltip', () => {
    const fields = {
      number: 1409,
      shortTitle: 'test met extra lange korte titel, lets gooooooooooooooooooooooooooo oooooooooooooooooooooooo ooooooooooooooooooooooooooooooo oooooooooooooooooooooooo oooooooooooooooooooo end',
    };
    cy.createPublication(fields);
    // test in detail view
    cy.get(publication.publicationHeader.shortTitle).contains('test met extra lange korte titel,')
      .should('not.contain', 'end')
      .trigger('mouseenter');
    cy.get(auk.abbreviatedText).should('be.visible')
      .should('contain', 'end');
    // test in overview table
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.shortTitle).contains('test met extra lange korte titel,')
      .should('not.contain', 'end')
      .trigger('mouseenter');
    cy.get(auk.abbreviatedText).should('be.visible')
      .should('contain', 'end');
  });

  it('should test the pagination by clicking previous and next', () => {
    cy.visit('/publicaties?aantal=1');
    cy.wait(1000);
    // This test should work regardless of the amount of publications, but may take longer and longer
    // We could make the "aantal=X" a value based on the found "totalcount" but then we have to account for odds and evens
    cy.get(auk.pagination.count).invoke('text')
      .then((text) => {
        const array = text.split(' ');
        const totalCount = array[2];
        cy.get(auk.pagination.previous).should('be.disabled');
        for (let index = 1; index < totalCount; index++) {
          cy.get(auk.pagination.count).should('contain', `${index}-${index}`);
          cy.get(auk.pagination.next).click();
          cy.get(publication.publicationTableRow.rows).should('have.length', 1);
          cy.url().should('contain', `pagina=${index}`);
        }
        cy.get(auk.pagination.next).should('be.disabled');
        for (let index = totalCount - 1; index > 1; index--) {
          const currentCount = index + 1;
          cy.get(auk.pagination.count).should('contain', `${currentCount}-${currentCount}`);
          cy.url().should('contain', `pagina=${index}`);
          cy.get(auk.pagination.previous).click();
        }
        cy.get(auk.pagination.previous).click();
        cy.url().should('not.contain', 'pagina=');
        cy.get(auk.pagination.previous).should('be.disabled');
      });
  });

  it('should test the search function', () => {
    // this is data from previous test
    for (const [key, value] of Object.entries(searchFields)) {
      cy.intercept('GET', '/publication-flows/search**').as('searchPublicationFlows');
      cy.log(`searching for ${key}`);
      cy.get(publication.publicationCaseSearch.input).type(value);
      cy.wait('@searchPublicationFlows');
      cy.get(publication.publicationCaseSearch.result).contains(searchFields.shortTitle)
        .should('have.length', 1)
        .click();
      cy.get(publication.publicationHeader.shortTitle).should('contain', searchFields.shortTitle);
      cy.get(publication.publicationNav.goBack).click();
    }
  });
});
