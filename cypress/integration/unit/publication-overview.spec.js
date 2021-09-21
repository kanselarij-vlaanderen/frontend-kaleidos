/* global context, it, cy, beforeEach, afterEach */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
// import utils from '../../selectors/utils.selectors';

context('Publications overview tests', () => {
  function createPublicationChangeStatus(fields) {
    cy.createPublication(fields);
    cy.get(publication.sidebar.open).click();
    cy.get(publication.statusSelector).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(fields.newStatus)
      .click();
    if (fields.newStatus === 'Afgevoerd') {
      cy.get(publication.sidebar.confirmWithdraw).click();
    }
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
    cy.server();
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('setup for search', () => {
    // needs 15 seconds for reindex in testsuite
    cy.createPublication(searchFields);
    cy.get(publication.sidebar.open).click();
    cy.get(publication.sidebar.remark).type(searchFields.remark);
    cy.get(publication.sidebar.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${searchFields.numacNumber}{enter}`);
  });

  it('should test all the amount shown options in overview', () => {
    const fields = {
      number: 1404,
      shortTitle: 'test',
    };
    const elementsToCheck = [
      25,
      50,
      100,
      200
    ];

    cy.createPublication(fields);
    cy.get(publication.publicationNav.goBack).click();
    elementsToCheck.forEach((option) => {
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
      cy.get(`[${publication.publicationsIndex.config.option}${columnKeyName}]`).parent(auk.checkbox)
        .click();
      cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`).should('not.exist');
      cy.get(`[${publication.publicationsIndex.config.option}${columnKeyName}]`).parent(auk.checkbox)
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
    // TODO add dataset
    createPublicationChangeStatus(fields1);
    createPublicationChangeStatus(fields2);
    createPublicationChangeStatus(fields3);
    cy.route('GET', '/decisions?filter**').as('getDecisionsFilter');
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
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.shortTitle).contains('test met extra lange korte titel,')
      .should('not.contain', 'end')
      .trigger('mouseenter');
    cy.get(auk.abbreviatedText).should('be.visible')
      .should('contain', 'end');
  });

  it('should test the pagination', () => {
    cy.visit('/publicaties?aantal=1');
    cy.wait(1000);
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
      cy.route('GET', '/publication-flows/search**').as('searchPublicationFlows');
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
