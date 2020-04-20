/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

import { mandateeLinkFieldsToggleSelector, mandateeLinkListItemSelector } from "../../selectors/mandatees/mandateeSelectors";
import { isecodesListSelector, isecodesListItemSelector } from "../../selectors/isecodes/isecodesSelectors";


context('Assigning a mandatee to agendaitem or subcase should update linked subcase/agendaitems, KAS-1291', () => {
  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 1).set('hour', 20).set('minute', 20);
  const caseTitle = 'Cypress test: mandatee sync - ' + currentTimestamp();

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should add mandatees to a subcase before assigning to agenda, agendaitem should have the same mandatees', () => {

    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: assign mandatee - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister voor agendering vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.createCase(false, caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.addSubcaseMandatee(0, -1, -1); // -1 means select nothing
    cy.addSubcaseMandatee(1, 0, 0);

    cy.get(mandateeLinkListItemSelector).as('listItems');
    cy.get('@listItems').should('have.length', 2);

    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });

    cy.get(isecodesListSelector).should('exist')
    cy.get(isecodesListItemSelector).should('have.length.greaterThan', 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.agendaItemExists(SubcaseTitleShort).click();

    cy.get(mandateeLinkListItemSelector).as('listItems');
    cy.get('@listItems').should('have.length', 2);

    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });

  });

  it('should add mandatees to a subcase after assigning to agenda, agendaitem should have the same mandatees', () => {

    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: assign mandatee - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister na agendering vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.openCase(caseTitle);

    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);

    // Dependency: We should already have 2 mandatees that we inherit from previous subcase, now we add 1 more

    cy.addSubcaseMandatee(2, 0, 0);
    cy.get(mandateeLinkListItemSelector).as('listItems');
    cy.get('@listItems').should('have.length', 3);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });

    cy.get(isecodesListSelector).should('exist')
    cy.get(isecodesListItemSelector).should('have.length.greaterThan', 0);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.agendaItemExists(SubcaseTitleShort).click();

    cy.get(mandateeLinkListItemSelector).as('listItems');
    cy.get('@listItems').should('have.length', 3);

    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });

  });

  it('should add mandatees to an agendaitem on designagenda, subcase should have the same mandatees', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: assign mandatee - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister vanuit agendaitem op ontwerpagenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.openCase(caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openAgendaForDate(agendaDate);

    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.agendaItemExists(SubcaseTitleShort).click();
    cy.wait(1000);

    // Dependency: We should already have 3 mandatees that we inherit from previous subcase, now we add 1 more

    cy.addSubcaseMandatee(3, 0, 0);
    cy.get(mandateeLinkListItemSelector).as('listItems');
    cy.get('@listItems').should('have.length', 4);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(3).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });

    cy.reload();
    cy.agendaItemExists(SubcaseTitleShort).click();

    // Add 1 more
    cy.addSubcaseMandatee(5, -1, -1);
    cy.get(mandateeLinkListItemSelector).as('listItems');
    cy.get('@listItems').should('have.length', 5);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(3).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(4).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });

    // Check if subcase has the same amount of mandatees
    cy.openCase(caseTitle);
    cy.openSubcase(0);

    cy.get(mandateeLinkListItemSelector).as('listItems');
    cy.get('@listItems').should('have.length', 5);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(3).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('exist');
    });
    cy.get('@listItems').eq(4).within(() => {
      cy.get(mandateeLinkFieldsToggleSelector).should('not.exist');
    });

    cy.get(isecodesListSelector).should('exist')
    cy.get(isecodesListItemSelector).should('have.length.greaterThan', 0);
  });

});

function currentTimestamp() {
  return Cypress.moment().unix();
}
