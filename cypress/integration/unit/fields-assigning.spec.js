/* global context, before, it, cy,beforeEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Assigning a field to agendaitem or subcase should update linked subcase/agendaitems', () => {
  const agendaDate = Cypress.dayjs().add(12, 'weeks')
    .day(4); // Next friday
  const caseName = 'Cypress test for adding domains and fields';
  const caseName2 = 'Cypress test for adding domains and fields additional case';
  // This variable is used multiple times to check if data is properly loaded
  const nameToCheck = 'Cultuur, Jeugd, Sport en Media';
  before(() => {
    cy.login('Admin');
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logoutFlow();
  });

  beforeEach(() => {
    cy.login('Admin');
  });

  it('should add domains and fields to a subcase before assigning to agenda, agendaitem should have the same domains and fields', () => {
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: assign fields - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een domein en beleidsvelden voor agendering vanuit procedurestap';
    const domain1 = {
      name: 'Cultuur, Jeugd, Sport en Media',
      selected: true,
      fields: [],
    };
    const domain2 = {
      name: 'Economie, Wetenschap en Innovatie',
      selected: false,
      fields: ['Wetenschappelijk onderzoek', 'Innovatie'],
    };
    const domains = [domain1, domain2];

    cy.createCase(caseName);
    cy.openCase(caseName);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, null, null);
    cy.openSubcase(0, SubcaseTitleShort);

    // check rollback after cancel
    cy.intercept('GET', '/concepts**').as('getConceptSchemes');
    cy.get(utils.governmentAreasPanel.edit).click();
    cy.wait('@getConceptSchemes');
    cy.get(utils.governmentAreaSelectorForm.container).contains('Cultuur, Jeugd, Sport en Media')
      .click();
    cy.get(utils.governmentAreaSelectorForm.container)
      .contains('Cultuur, Jeugd, Sport en Media')
      .contains('Media')
      .click();
    cy.get(auk.modal.footer.cancel).click();
    cy.get(utils.governmentAreasPanel.rows).should('not.exist');

    cy.addDomainsAndFields(domains);

    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });

    // Checking if name of first domain is present ensures data is loaded
    cy.get('@listItems').eq(0)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', nameToCheck);
    cy.get('@listItems').eq(0)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', '-');

    // Check if agendaitem has the same amount of domains
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });
  });

  it('should add fields to a subcase after assigning to agenda, agendaitem should have the same fields', () => {
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: assign fields - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een domein en beleidsvelden na agendering vanuit procedurestap';
    const domain3 = {
      name: 'Financiën en Begroting',
      selected: false,
      fields: ['Fiscaliteit', 'Boekhouding'],
    };
    const domains = [domain3];
    cy.openCase(caseName);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, null, null);

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(auk.loader).should('not.exist');

    // Dependency: We should already have 2 domains that we inherit from previous subcase, now we add 1 more

    cy.addDomainsAndFields(domains);

    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });

    // Check if agendaitem has the same amount of domains
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });
  });

  it('should add domains and fields to an agendaitem on designagenda, subcase should have the same domains and fields', () => {
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: assign fields - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van domeinen en beleidsvelden vanuit agendaitem op ontwerpagenda';
    const domain4 = {
      name: 'Kanselarij, Bestuur, Buitenlandse Zaken en Justitie',
      selected: true,
      fields: ['Digitalisering', 'Internationaal ondernemen'],
    };
    const domain5 = {
      name: 'Landbouw en Visserij',
      selected: true,
      fields: [],
    };
    const domains1 = [domain4];
    const domains2 = [domain5];
    cy.openCase(caseName);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, null, null);
    cy.openSubcase(0, SubcaseTitleShort);
    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });
    cy.openAgendaForDate(agendaDate);

    cy.addAgendaitemToAgenda(SubcaseTitleShort);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get('@listItems');

    // Dependency: We should already have 3 domains that we inherit from previous subcase, now we add 1 more

    cy.addDomainsAndFields(domains1);
    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 4, {
      timeout: 5000,
    });


    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    // Add 1 more
    cy.addDomainsAndFields(domains2);
    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5, {
      timeout: 5000,
    });

    // Check if subcase has the same amount of domains
    cy.openCase(caseName);
    cy.openSubcase(0);

    cy.get(utils.governmentAreasPanel.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5, {
      timeout: 5000,
    });
  });

  it('should edit domains and fields and show correct domains and fields when switching agendaitems before, during and after edits', () => {
    const type = 'Nota';
    const subcaseTitleShort = `Cypress test: assign fields - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een domein en beleidsvelden voor agendering vanuit procedurestap 2';
    const domain4 = {
      name: 'Kanselarij, Bestuur, Buitenlandse Zaken en Justitie',
      selected: true,
      fields: ['Digitalisering', 'Internationaal ondernemen'],
    };
    const domains = [domain4];

    cy.createCase(caseName2);
    cy.openCase(caseName2);
    cy.addSubcase(type, subcaseTitleShort, subcaseTitleLong, null, null);
    cy.openSubcase(0, subcaseTitleShort);
    cy.addDomainsAndFields(domains);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.clickReverseTab('Detail');

    cy.log('in non-edit view, check if domains are correct');
    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(auk.loader, {
      timeout: 40000,
    }).should('not.exist');
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(auk.loader, {
      timeout: 40000,
    }).should('not.exist');
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 5);
    // check if subcase from different case doesn't retain domains and fields
    cy.get('@agendaitems').eq(4)
      .click();
    cy.get(auk.loader, {
      timeout: 40000,
    }).should('not.exist');
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 1);

    cy.log('in non-edit view, check if domains of last selected agendaitem are correctly ordered');
    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(utils.governmentAreasPanel.row.label).as('domainLabel');
    cy.get('@domainLabel').eq(0)
      .should('contain', 'Cultuur, Jeugd, Sport en Media');
    cy.get('@domainLabel').eq(1)
      .should('contain', 'Economie, Wetenschap en Innovatie');
    cy.get('@domainLabel').eq(2)
      .should('contain', 'Financiën en Begroting');
    cy.get('@domainLabel').eq(3)
      .should('contain', 'Kanselarij, Bestuur, Buitenlandse Zaken en Justitie');
    cy.get('@domainLabel').eq(4)
      .should('contain', 'Landbouw en Visserij');

    cy.log('deleting a mandatee and saving, check the non-edit view again');
    cy.get('@agendaitems').eq(3)
      .click();
    // delete by running same domain and fields, should uncheck the same fields
    cy.addDomainsAndFields(domains);

    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    // 1 less field, other sibling subcases are not affected
    cy.get(utils.governmentAreasPanel.rows).should('have.length', 4);
  });
});
