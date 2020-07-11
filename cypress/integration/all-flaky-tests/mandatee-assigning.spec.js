/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

import mandatee from '../../selectors/mandatees/mandateeSelectors';
import isecodes from "../../selectors/isecodes/isecodesSelectors";

context('Assigning a mandatee to agendaitem or subcase should update linked subcase/agendaitems, KAS-1291', () => {
  const agendaDate = Cypress.moment().add(1, 'weeks').day(4); // Next friday
  // const caseTitle = 'Cypress test: mandatee sync - 1594023300';  // The case is in the default data set with id 5F02DD8A7DE3FC0008000001

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logoutFlow();
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
    cy.visit('dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.addSubcaseMandatee(0, -1, -1); // -1 means select nothing
    cy.addSubcaseMandatee(1, 0, 0);

    cy.get(mandatee.mandateeLinkListItem).as('listItems');
    cy.get('@listItems').should('have.length', 2);

    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });

    cy.get(isecodes.isecodesList).should('exist')
    cy.get(isecodes.isecodesListItem).should('have.length.greaterThan', 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(mandatee.mandateeLinkListItem).as('listItems');
    cy.get('@listItems').should('have.length', 2);

    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });

  });

  it('should add mandatees to a subcase after assigning to agenda, agendaitem should have the same mandatees', () => {

    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: assign mandatee - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister na agendering vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);

    // Dependency: We should already have 2 mandatees that we inherit from previous subcase, now we add 1 more

    cy.addSubcaseMandatee(2, 0, 0);
    cy.get(mandatee.mandateeLinkListItem).as('listItems');
    cy.get('@listItems').should('have.length', 3);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });

    cy.get(isecodes.isecodesList).should('exist')
    cy.get(isecodes.isecodesListItem).should('have.length.greaterThan', 0);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(mandatee.mandateeLinkListItem).as('listItems');
    cy.get('@listItems').should('have.length', 3);

    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });

  });

 it('should add mandatees to an agendaitem on designagenda, subcase should have the same mandatees', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: assign mandatee - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister vanuit agendaitem op ontwerpagenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openAgendaForDate(agendaDate);

    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    // Dependency: We should already have 3 mandatees that we inherit from previous subcase, now we add 1 more

    cy.addSubcaseMandatee(3, 0, 0);
    cy.get(mandatee.mandateeLinkListItem).as('listItems');
    cy.get('@listItems').should('have.length', 4);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(3).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });

    cy.reload();
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    // Add 1 more
    cy.addSubcaseMandatee(5, -1, -1);
    cy.get(mandatee.mandateeLinkListItem).as('listItems');
    cy.get('@listItems').should('have.length', 5);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(3).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(4).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });

    // Check if subcase has the same amount of mandatees
    cy.visit('dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.openSubcase(0);

    cy.get(mandatee.mandateeLinkListItem).as('listItems');
    cy.get('@listItems').should('have.length', 5);
    cy.get('@listItems').eq(0).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });
    cy.get('@listItems').eq(1).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(2).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(3).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('exist');
    });
    cy.get('@listItems').eq(4).within(() => {
      cy.get(mandatee.mandateeLinkFieldsToggle).should('not.exist');
    });

    cy.get(isecodes.isecodesList).should('exist')
    cy.get(isecodes.isecodesListItem).should('have.length.greaterThan', 0);
  });

});

function currentTimestamp() {
  return Cypress.moment().unix();
}
