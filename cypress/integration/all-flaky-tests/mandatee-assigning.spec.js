/* global context, before, it, cy,beforeEach, Cypress */
// / <reference types="Cypress" />

import mandatee from '../../selectors/mandatee.selectors';
import agenda from '../../selectors/agenda.selectors';
import utils from '../../selectors/utils.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import modal from '../../selectors/modal.selectors';
import auComponents from '../../selectors/au-component.selectors';
import cases from '../../selectors/case.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Assigning a mandatee to agendaitem or subcase should update linked subcase/agendaitems, KAS-1291', () => {
  const agendaDate = Cypress.moment().add(1, 'weeks')
    .day(4); // Next friday
  // This variable is used multiple times to check if data is properly loaded
  const nameToCheck = 'Geert';
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
    const SubcaseTitleShort = `Cypress test: assign mandatee - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister voor agendering vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.addSubcaseMandatee(0, -1, -1); // -1 means select nothing
    cy.addSubcaseMandatee(1, 0, 0);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .within(() => {
        // Checking if name of first mandatee is present ensures data is loaded
        cy.get(mandatee.mandateePanelView.row.name).should('contain', nameToCheck); // TODO data dependency
        cy.get(mandatee.mandateePanelView.row.domains).should('contain', '-');
      });
    cy.get('@listItems').eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });

    cy.get(cases.isecodes.list).should('exist');
    cy.get(cases.isecodes.listItem).should('have.length.greaterThan', 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .within(() => {
        // Checking if name of first mandatee is present ensures data is loaded
        cy.get(mandatee.mandateePanelView.row.name).should('contain', nameToCheck); // TODO data dependency
        cy.get(mandatee.mandateePanelView.row.domains).should('contain', '-');
      });
    cy.get('@listItems').eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
  });

  it('should add mandatees to a subcase after assigning to agenda, agendaitem should have the same mandatees', () => {
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: assign mandatee - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister na agendering vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);

    // Dependency: We should already have 2 mandatees that we inherit from previous subcase, now we add 1 more

    cy.addSubcaseMandatee(2, 0, 0);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .within(() => {
        // Checking if name of first mandatee is present ensures data is loaded
        cy.get(mandatee.mandateePanelView.row.name).should('contain', nameToCheck); // TODO data dependency
        // TODO NOTE: even though we did not select fields for this mandatee, he shares ise-codes with another mandatee and now show fields
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });

    cy.get(cases.isecodes.list).should('exist');
    cy.get(cases.isecodes.listItem).should('have.length.greaterThan', 0);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .within(() => {
        // Checking if name of first mandatee is present ensures data is loaded
        cy.get(mandatee.mandateePanelView.row.name).should('contain', nameToCheck); // TODO data dependency
        // TODO NOTE: even though we did not select fields for this mandatee, he shares ise-codes with another mandatee and now show fields
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
  });

  it('should add mandatees to an agendaitem on designagenda, subcase should have the same mandatees', () => {
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: assign mandatee - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister vanuit agendaitem op ontwerpagenda';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openAgendaForDate(agendaDate);

    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    // Dependency: We should already have 3 mandatees that we inherit from previous subcase, now we add 1 more

    cy.addSubcaseMandatee(3, 0, 0);
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 4, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .within(() => {
        // Checking if name of first mandatee is present ensures data is loaded
        cy.get(mandatee.mandateePanelView.row.name).should('contain', nameToCheck); // TODO data dependency
        // TODO NOTE: even though we did not select fields for this mandatee, he shares ise-codes with another mandatee and now show fields
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(3)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });

    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    // Add 1 more
    cy.addSubcaseMandatee(5, -1, -1);
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .within(() => {
        // Checking if name of first mandatee is present ensures data is loaded
        cy.get(mandatee.mandateePanelView.row.name).should('contain', nameToCheck); // TODO data dependency
        // TODO NOTE: even though we did not select fields for this mandatee, he shares ise-codes with another mandatee and now show fields
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(3)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(4)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('contain', '-');
      });
    // Check if subcase has the same amount of mandatees
    cy.visit('/dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.openSubcase(0);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5, {
      timeout: 5000,
    });
    cy.get('@listItems').eq(0)
      .within(() => {
        // Checking if name of first mandatee is present ensures data is loaded
        cy.get(mandatee.mandateePanelView.row.name).should('contain', nameToCheck); // TODO data dependency
        // TODO NOTE: even though we did not select fields for this mandatee, he shares ise-codes with another mandatee and now show fields
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(3)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('not.contain', '-');
      });
    cy.get('@listItems').eq(4)
      .within(() => {
        cy.get(mandatee.mandateePanelView.row.domains).should('contain', '-');
      });

    cy.get(cases.isecodes.list).should('exist');
    cy.get(cases.isecodes.listItem).should('have.length.greaterThan', 0);
  });

  it('should edit mandatees and show correct mandatees when switching agendaitems before, during and after edits', () => {
    cy.openAgendaForDate(agendaDate);
    cy.clickReverseTab('Detail');

    cy.log('in non-edit view, check if mandatees are correct');
    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    // TODO Why is 20 seconds not enough to load this page ?
    cy.get(auComponents.auLoading, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(auComponents.auLoading, {
      timeout: 40000,
    }).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(auComponents.auLoading, {
      timeout: 40000,
    }).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5);

    cy.log('in non-edit view, check if mandatees of last selected agendaitem are correctly ordered');
    cy.get(mandatee.mandateePanelView.row.name).as('mandateeNames');
    cy.get('@mandateeNames').eq(0)
      .should('contain', nameToCheck);
    cy.get('@mandateeNames').eq(1)
      .should('contain', 'Hilde');
    cy.get('@mandateeNames').eq(2)
      .should('contain', 'Liesbeth');
    cy.get('@mandateeNames').eq(3)
      .should('contain', 'Ben Weyts');
    cy.get('@mandateeNames').eq(4)
      .should('contain', 'Phillipe');

    cy.log('when edit is open, check if mandatees are correct (in reverse order)');
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).as('editItems');
    cy.get('@editItems').should('have.length', 5);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).as('editItems');
    cy.get('@editItems').should('have.length', 3);
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).as('editItems');
    cy.get('@editItems').should('have.length', 2);

    cy.log('when edit is cancelled, check the non-edit view again');
    cy.get(mandatee.mandateePanelEdit.actions.cancel).click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5);

    cy.log('changing the submitter and saving, check the non-edit view again (in reverse order)');
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).as('editItems');
    cy.get('@editItems').eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelEdit.row.submitter).click();
      });
    cy.get(mandatee.mandateePanelEdit.actions.save).click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3);
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2);

    cy.log('adding a mandatee and saving, check the non-edit view again');
    cy.get('@agendaitems').eq(2)
      .click();
    cy.addAgendaitemMandatee(6, -1, -1);
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 4);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5);

    cy.log('deleting a mandatee and saving, check the non-edit view again');
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).as('editItems');
    cy.get('@editItems').eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelEdit.row.delete).click();
      });
    // await saves subcase/agendaitem/agenda, awaiting only the last save for now, then wait a few seconds for data loading
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.route('PATCH', '/agendas/*').as(`patchAgenda${randomInt}`);
    cy.get(mandatee.mandateePanelEdit.actions.save).click();
    cy.wait(`@patchAgenda${randomInt}`);
    cy.wait(2000);

    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5);
  });

  it('should create newsletter-info for the agendaitems to check the sorting', () => {
    cy.openAgendaForDate(agendaDate);
    cy.clickReverseTab('Detail');
    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(agenda.agendaitemNav.newsletterTab)
      .should('be.visible')
      .click();

    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.wait(2000);
    cy.get(modal.verify.save).click();
    cy.wait(3000);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.wait(2000);
    cy.get(modal.verify.save).click();
    cy.wait(3000);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.wait(2000);
    cy.get(modal.verify.save).click();
    cy.wait(3000);

    cy.get(agenda.agendaHeader.showActionOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    // TODO .as not needed, user row.eq(index)
    cy.get(newsletter.tableRow.newsletterRow).as('newsletterRows');
    cy.get('@newsletterRows').eq(0)
      .within(() => {
        cy.get(utils.vlCheckbox.label).click();
        cy.wait(1000);
      });
    cy.get('@newsletterRows').eq(1)
      .within(() => {
        cy.get(utils.vlCheckbox.label).click();
        cy.wait(1000);
      });
    cy.get('@newsletterRows').eq(2)
      .within(() => {
        cy.get(utils.vlCheckbox.label).click();
        cy.wait(1000);
      });

    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.printItemProposal).as('proposals');
    cy.get('@proposals').eq(0)
      .contains('Op voorstel van Minister-president Geert Bourgeois en Vlaams minister Hilde Crevits');
    cy.get('@proposals').eq(1)
      .contains('Op voorstel van Minister-president Geert Bourgeois, Vlaams minister Hilde Crevits, Vlaams minister Liesbeth Homans, Vlaams minister Ben Weyts en Vlaams minister Phillipe Muyters');
    cy.get('@proposals').eq(2)
      .contains('Op voorstel van Minister-president Geert Bourgeois, Vlaams minister Hilde Crevits en Vlaams minister Sven Gatz');
  });
});
