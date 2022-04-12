/* global context, before, it, cy,beforeEach, Cypress */
// / <reference types="Cypress" />

import mandatee from '../../selectors/mandatee.selectors';
import agenda from '../../selectors/agenda.selectors';
import utils from '../../selectors/utils.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import auk from '../../selectors/auk.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Assigning a mandatee to agendaitem or subcase should update linked subcase/agendaitems, KAS-1291', () => {
  const agendaDate = Cypress.dayjs().add(1, 'weeks')
    .day(4); // Next friday
  // This variable is used multiple times to check if data is properly loaded
  const nameToCheck = 'Jambon';
  // const caseTitle = 'Cypress test: mandatee sync - 1594023300';  // The case is in the default data set with id 5F02DD8A7DE3FC0008000001

  before(() => {
    cy.login('Admin');
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logoutFlow();
  });

  beforeEach(() => {
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

    cy.addSubcaseMandatee(1);
    cy.addSubcaseMandatee(2);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });

    // Checking if name of first mandatee is present ensures data is loaded
    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);
    cy.proposeSubcaseForAgenda(agendaDate);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);
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

    cy.addSubcaseMandatee(3);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);

    // Check if agendaitem has the same amount of mandatees
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);
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

    cy.addSubcaseMandatee(4);
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 4, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);

    cy.openDetailOfAgendaitem(SubcaseTitleShort);

    // Add 1 more
    cy.addSubcaseMandatee(5);
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5, {
      timeout: 5000,
    });

    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);

    // Check if subcase has the same amount of mandatees
    cy.intercept('GET', '/subcases?filter**').as('getSubcase');
    cy.visit('/dossiers/5F02DD8A7DE3FC0008000001/deeldossiers');
    cy.wait('@getSubcase');
    cy.openSubcase(0);

    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 5, {
      timeout: 5000,
    });
    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', nameToCheck);
  });

  it('should edit mandatees and show correct mandatees when switching agendaitems before, during and after edits', () => {
    cy.openAgendaForDate(agendaDate);
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.clickReverseTab('Detail');

    cy.log('in non-edit view, check if mandatees are correct');
    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(auk.loader, {
      timeout: 40000,
    }).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(auk.loader, {
      timeout: 40000,
    }).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 5);

    cy.log('in non-edit view, check if mandatees of last selected agendaitem are correctly ordered');
    cy.get(mandatee.mandateePanelView.row.name).as('mandateeNames');
    cy.get('@mandateeNames').eq(0)
      .should('contain', nameToCheck);
    cy.get('@mandateeNames').eq(1)
      .should('contain', 'Hilde Crevits');
    cy.get('@mandateeNames').eq(2)
      .should('contain', 'Bart Somers');
    cy.get('@mandateeNames').eq(3)
      .should('contain', 'Ben Weyts');
    cy.get('@mandateeNames').eq(4)
      .should('contain', 'Zuhal Demir');

    cy.log('when edit is open, check if mandatees are correct (in reverse order)');
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).should('have.length', 5);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).should('have.length', 3);
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).should('have.length', 2);

    cy.log('when edit is cancelled, check the non-edit view again');
    cy.get(mandatee.mandateePanelEdit.actions.cancel).click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 5);

    cy.log('changing the submitter and saving, check the non-edit view again (in reverse order)');
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelEdit.row.submitter).click();
      });
    cy.get(mandatee.mandateePanelEdit.actions.save).click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 5);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 3);
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 2);

    cy.log('adding a mandatee and saving, check the non-edit view again');
    cy.get('@agendaitems').eq(2)
      .click();
    cy.addAgendaitemMandatee(6);
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 4);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 5);

    cy.log('deleting a mandatee and saving, check the non-edit view again');
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows).eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelEdit.row.delete).click();
      });
    // await saves subcase/agendaitem/agenda, awaiting only the last save for now, then wait a few seconds for data loading
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', '/agendas/*').as(`patchAgenda${randomInt}`);
    cy.get(mandatee.mandateePanelEdit.actions.save).click();
    cy.wait(`@patchAgenda${randomInt}`);
    cy.wait(2000);

    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 2);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 3);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 5);
  });

  it('should create newsletter-info for the agendaitems to check the sorting', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('POST', '/newsletter-infos').as(`postNewsletterInfo${randomInt}`);
    cy.intercept('PATCH', '/newsletter-infos/*').as(`patchNewsletterInfo${randomInt}`);
    cy.openAgendaForDate(agendaDate);
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
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
    cy.get(utils.vlModalVerify.save).click();
    cy.wait(`@postNewsletterInfo${randomInt}`);
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait(`@postNewsletterInfo${randomInt}`);
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait(`@postNewsletterInfo${randomInt}`);

    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    // Toggle all newsletters to show
    cy.get(newsletter.tableRow.newsletterRow).eq(0)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait(`@patchNewsletterInfo${randomInt}`);
    cy.get(newsletter.tableRow.newsletterRow).eq(1)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait(`@patchNewsletterInfo${randomInt}`);
    cy.get(newsletter.tableRow.newsletterRow).eq(2)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait(`@patchNewsletterInfo${randomInt}`);

    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.printItemProposal).as('proposals');
    cy.get('@proposals').eq(0)
      .scrollIntoView()
      .contains('Op voorstel van minister-president Jan Jambon en viceminister-president Hilde Crevits')
      .should('be.visible');
    cy.get('@proposals').eq(1)
      .scrollIntoView()
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits, viceminister-president Bart Somers, viceminister-president Ben Weyts en Vlaams minister Zuhal Demir')
      .should('be.visible');
    cy.get('@proposals').eq(2)
      .scrollIntoView()
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits en Vlaams minister Wouter Beke')
      .should('be.visible');
    cy.clickReverseTab('Klad');
    cy.get(newsletter.itemContent.printItemProposal).as('proposals');
    cy.get('@proposals').eq(0)
      .scrollIntoView()
      .contains('Op voorstel van minister-president Jan Jambon en viceminister-president Hilde Crevits')
      .should('be.visible');
    cy.get('@proposals').eq(1)
      .scrollIntoView()
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits en Vlaams minister Wouter Beke')
      .should('be.visible');
    cy.get('@proposals').eq(2)
      .scrollIntoView()
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits, viceminister-president Bart Somers, viceminister-president Ben Weyts en Vlaams minister Zuhal Demir')
      .should('be.visible');
  });
});
