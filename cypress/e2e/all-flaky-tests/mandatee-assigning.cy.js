/* global context, before, it, cy,beforeEach, Cypress */
// / <reference types="Cypress" />

import mandatee from '../../selectors/mandatee.selectors';
import agenda from '../../selectors/agenda.selectors';
import utils from '../../selectors/utils.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

function checkMandateesInList(mandatees, dateRange) {
  mandatees.forEach((mandatee) => {
    cy.get(dependency.emberPowerSelect.option).contains(mandatee)
      .contains(dateRange);
  });
}

context('Assigning a mandatee to agendaitem or subcase should update linked subcase/agendaitems, KAS-1291', () => {
  const agendaDate = Cypress.dayjs().add(1, 'weeks')
    .day(4); // Next friday
  // This variable is used multiple times to check if data is properly loaded
  const nameToCheck = 'Jambon';
  // const caseTitle = 'Cypress test: mandatee sync - 1594023300';  // The case is in the default data set with id 5F02DD8A7DE3FC0008000001
  const isCI = Cypress.env('CI');

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
    const subcaseType = 'Principiële goedkeuring';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/E14FB4BA-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0, SubcaseTitleShort);

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

    cy.changeDecisionResult('Goedgekeurd');
  });

  it('should add mandatees to a subcase after assigning to agenda, agendaitem should have the same mandatees', () => {
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: assign mandatee - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister na agendering vanuit procedurestap';
    const subcaseType = 'Principiële goedkeuring';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/E14FB4BA-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0, SubcaseTitleShort);
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

    cy.changeDecisionResult('Goedgekeurd');
  });

  it('should add mandatees to an agendaitem on designagenda, subcase should have the same mandatees', () => {
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: assign mandatee - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het toewijzen van een minister vanuit agendaitem op ontwerpagenda';
    const subcaseType = 'Principiële goedkeuring';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/E14FB4BA-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openAgendaForDate(agendaDate);

    cy.addAgendaitemToAgenda(SubcaseTitleShort);
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

    cy.changeDecisionResult('Goedgekeurd');

    // Check if subcase has the same amount of mandatees
    cy.intercept('GET', '/subcases?filter**').as('getSubcase');
    cy.visit('/dossiers/E14FB4BA-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
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
      .should('contain', 'Gwendolyn Rutten');
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

  it('should create news-item for the agendaitems to check the sorting', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('POST', '/news-items').as(`postNewsItem${randomInt}`);
    cy.intercept('PATCH', '/news-items/*').as(`patchNewsItem${randomInt}`);
    cy.openAgendaForDate(agendaDate);
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.clickReverseTab('Detail');
    cy.get(agenda.agendaDetailSidebar.subitem).as('agendaitems');
    cy.get('@agendaitems').eq(1)
      .click();
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(agenda.agendaitemNav.newsletterTab)
      .should('be.visible')
      .click();
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.wait(`@postNewsItem${randomInt}`);
    cy.get(newsletter.editItem.cancel).click();
    cy.get('@agendaitems').eq(2)
      .click();
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.wait(`@postNewsItem${randomInt}`);
    cy.get(newsletter.editItem.cancel).click();
    cy.get('@agendaitems').eq(3)
      .click();
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
    cy.get(newsletter.newsItem.create).should('be.visible')
      .click();
    cy.wait(`@postNewsItem${randomInt}`);
    cy.get(newsletter.editItem.cancel).click();

    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    // Toggle all newsletters to show
    cy.get(newsletter.tableRow.newsletterRow).eq(0)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait(`@patchNewsItem${randomInt}`);
    cy.get(newsletter.tableRow.newsletterRow).eq(1)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait(`@patchNewsItem${randomInt}`);
    cy.get(newsletter.tableRow.newsletterRow).eq(2)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait(`@patchNewsItem${randomInt}`);

    cy.intercept('GET', '/mandatees?filter**').as('getMandatees1');
    cy.intercept('GET', '/mandatees?filter**').as('getMandatees2');
    cy.intercept('GET', '/mandatees?filter**').as('getMandatees3');
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterPrint.printItemProposal).as('proposals')
      .should('have.length', 3);
    cy.get('@proposals').eq(0)
      .contains('Op voorstel van minister-president Jan Jambon en viceminister-president Hilde Crevits');
    cy.get('@proposals').eq(1)
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits, viceminister-president Gwendolyn Rutten, viceminister-president Ben Weyts en Vlaams minister Zuhal Demir');
    cy.get('@proposals').eq(2)
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits en Vlaams minister Matthias Diependaele');
    cy.clickReverseTab('Klad');
    cy.wait('@getMandatees1', {
      timeout: 60000,
    });
    cy.wait('@getMandatees2', {
      timeout: 60000,
    });
    cy.wait('@getMandatees3', {
      timeout: 60000,
    });
    cy.wait(2000);
    cy.get(newsletter.newsletterPrint.printItemProposal).as('proposals');
    cy.get('@proposals').eq(0)
      .contains('Op voorstel van minister-president Jan Jambon en viceminister-president Hilde Crevits');
    cy.get('@proposals').eq(1)
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits en Vlaams minister Matthias Diependaele');
    cy.get('@proposals').eq(2)
      .contains('Op voorstel van minister-president Jan Jambon, viceminister-president Hilde Crevits, viceminister-president Gwendolyn Rutten, viceminister-president Ben Weyts en Vlaams minister Zuhal Demir');
  });

  it('check list of mandatees in 2020 agenda', () => {
    // const agendaDate2020 = Cypress.dayjs('2020-04-07');
    // const subcaseShortTitle = 'Cypress test: 20+ documents agendaitem with subcase - 1589286110';
    const agendaitemLink = 'vergadering/5EBA94D7751CF70008000001/agenda/5EBA94D8751CF70008000002/agendapunten/5EBA9512751CF70008000008';
    const mandateeNames2020 = [
      'Jan Jambon, Minister-president van de Vlaamse Regering',
      'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, ICT en Facilitair Management',
      'Hilde Crevits, Vlaams minister van Economie, Innovatie, Werk, Sociale economie en Landbouw',
      'Bart Somers, Vlaams minister van Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen',
      'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
      'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme',
      'Wouter Beke, Vlaams minister van Welzijn, Volksgezondheid, Gezin en Armoedebestrijding',
      'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed',
      'Lydia Peeters, Vlaams minister van Mobiliteit en Openbare Werken',
      'Benjamin Dalle, Vlaams minister van Brussel, Jeugd en Media'
    ];
    // *NOTE: these dates show differently depending on timezone

    let dateRange;
    if (isCI) {
      const date01102019 = Cypress.dayjs('2019-10-01').format('DD-MM-YYYY');
      const date09052021 = Cypress.dayjs('2021-05-09').format('DD-MM-YYYY');
      dateRange = `${date01102019} tot ${date09052021}`;
    } else {
      const date02102019 = Cypress.dayjs('2019-10-02').format('DD-MM-YYYY');
      const date10052021 = Cypress.dayjs('2021-05-10').format('DD-MM-YYYY');
      dateRange = `${date02102019} tot ${date10052021}`;
    }

    cy.visitAgendaWithLink(agendaitemLink);
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.actions.add).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).should('have.length', 10);
    checkMandateesInList(mandateeNames2020, dateRange);
  });

  it('check list of mandatees in 2022 agenda before may', () => {
    // const agendaDate2022BeforeMay = Cypress.dayjs('2022-02-28');
    // const subcaseShortTitle = 'testId=1653051342: korte titel';
    const agendaitemLink = 'vergadering/62878EB2E1ADA5F6A459ABFD/agenda/62878EB3E1ADA5F6A459ABFE/agendapunten/62879264E1ADA5F6A459AC0D';
    const mandateeNames2022BeforeMay = [
      'Jan Jambon, Minister-president van de Vlaamse Regering',
      'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, Digitalisering en Facilitair Management',
      'Hilde Crevits, Vlaams minister van Economie, Innovatie, Werk, Sociale economie en Landbouw',
      'Bart Somers, Vlaams minister van Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen',
      'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
      'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme',
      'Wouter Beke, Vlaams minister van Welzijn, Volksgezondheid, Gezin en Armoedebestrijding',
      'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed',
      'Lydia Peeters, Vlaams minister van Mobiliteit en Openbare Werken',
      'Benjamin Dalle, Vlaams minister van Brussel, Jeugd en Media'
    ];
    // *NOTE: these dates show differently depending on timezone
    let dateRange;
    if (isCI) {
      const date09052021 = Cypress.dayjs('2021-05-09').format('DD-MM-YYYY');
      const date15052022 = Cypress.dayjs('2022-05-15').format('DD-MM-YYYY');
      dateRange = `${date09052021} tot ${date15052022}`;
    } else {
      const date10052021 = Cypress.dayjs('2021-05-10').format('DD-MM-YYYY');
      const date16052022 = Cypress.dayjs('2022-05-16').format('DD-MM-YYYY');
      dateRange = `${date10052021} tot ${date16052022}`;
    }

    cy.visitAgendaWithLink(agendaitemLink);
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.actions.add).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).should('have.length', 10);
    checkMandateesInList(mandateeNames2022BeforeMay, dateRange);
  });

  it('check if current list of mandatees contains heden', () => {
    const subcaseShortTitle = 'Cypress test: assign mandatee'; // partial match to subcases used earlier

    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseShortTitle);
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.actions.add).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should('not.exist', {
      timeout: 50000,
    });
    cy.get(dependency.emberPowerSelect.option).contains('heden');
  });

  it('check free search', () => {
    // const agendaDate2022BeforeMay = Cypress.dayjs('2022-02-28');
    // const subcaseShortTitle = 'testId=1653051342: korte titel';
    const agendaitemLink = 'vergadering/62878EB2E1ADA5F6A459ABFD/agenda/62878EB3E1ADA5F6A459ABFE/agendapunten/62879264E1ADA5F6A459AC0D';

    cy.visitAgendaWithLink(agendaitemLink);

    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.actions.add).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateesSelector.openSearch).parent()
      .click();
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.searchInput).clear()
      .type('Martens');
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should('not.exist', {
      timeout: 50000,
    });
    cy.get(dependency.emberPowerSelect.option).should('have.length', 4);
    cy.get(dependency.emberPowerSelect.option).contains('Luc Martens, Vlaams minister van Cultuur, Gezin en Welzijn');
    // *NOTE: these dates show differently depending on timezone
    let date13071999 = Cypress.dayjs('1999-07-13').format('DD-MM-YYYY');
    let date28091998 = Cypress.dayjs('1998-09-28').format('DD-MM-YYYY');
    let date01011998 = Cypress.dayjs('1998-01-01').format('DD-MM-YYYY');
    let date22091997 = Cypress.dayjs('1997-09-22').format('DD-MM-YYYY');
    let date20061995 = Cypress.dayjs('1995-06-20').format('DD-MM-YYYY');
    if (isCI) {
      date13071999 = Cypress.dayjs('1999-07-12').format('DD-MM-YYYY');
      date28091998 = Cypress.dayjs('1998-09-27').format('DD-MM-YYYY');
      date01011998 = Cypress.dayjs('1997-12-31').format('DD-MM-YYYY');
      date22091997 = Cypress.dayjs('1997-09-21').format('DD-MM-YYYY');
      date20061995 = Cypress.dayjs('1995-06-19').format('DD-MM-YYYY');
    }
    cy.get(dependency.emberPowerSelect.option).contains(`${date28091998} tot ${date13071999}`);
    cy.get(dependency.emberPowerSelect.option).contains(`${date01011998} tot ${date28091998}`);
    cy.get(dependency.emberPowerSelect.option).contains(`${date22091997} tot ${date01011998}`);
    cy.get(dependency.emberPowerSelect.option).contains(`${date20061995} tot ${date22091997}`)
      .parent()
      .click();
    cy.get(utils.mandateesSelector.add).click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases');
    cy.intercept('PATCH', '/agendaitems/*').as('patchAgendaitems');
    cy.intercept('PATCH', '/agendas/*').as('patchAgendas');
    cy.get(mandatee.mandateePanelEdit.actions.save).click()
      .wait('@patchSubcases')
      .wait('@patchAgendaitems')
      .wait('@patchAgendas');
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 1)
      .contains('Luc Martens');
  });
});
