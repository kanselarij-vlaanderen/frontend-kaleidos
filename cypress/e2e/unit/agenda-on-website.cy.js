/* global context, it, cy, Cypress, before, beforeEach, afterEach */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
// import utils from '../../selectors/utils.selectors';
// import mandateeNames from '../../selectors/mandatee-names.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('agenda notice test', () => {
  const agendaDate = Cypress.dayjs().add(13, 'weeks')
    .day(4);

  before(() => {
    cy.login('Admin');
    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.setAllItemsFormallyOk(1);
    cy.approveDesignAgenda();
    cy.logoutFlow();
  });

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should change to confidential via agendaitem view', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test change to confidential via agendaitem view`;
    const subcaseTitleShort = `Cypress test: change to confidential via agendaitem view - ${currentTimestamp()}`;

    // setup
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitleShort,
      agendaDate: agendaDate.format('DD-MM-YYYY'),
    });

    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShort)
      .parent()
      .parent()
      .as('subcase1');

    // check rollback on cancel
    cy.get('@subcase1').find(agenda.agendaDetailSidebarItem.inNewsletter);
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.confidential).parent()
      .click();
    cy.get(agenda.agendaDetailSidebarItem.confidential);
    cy.get(agenda.agendaDetailSidebarItem.inNewsletter).should('not.exist');
    cy.get(agenda.agendaitemTitlesEdit.actions.cancel).click();
    cy.get('@subcase1').find(agenda.agendaDetailSidebarItem.inNewsletter);

    // set to confidential via agendaitem view
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.confidential).parent()
      .click();
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems1');
    cy.intercept('PATCH', 'subcases/**').as('patchSubcases1');
    cy.intercept('PATCH', 'news-items/**').as('patchNewsItems1');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click()
      .wait('@patchAgendaitems1')
      .wait('@patchSubcases1')
      .wait('@patchNewsItems1');
    cy.get('@subcase1').find(agenda.agendaDetailSidebarItem.confidential);
    cy.get('@subcase1').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');

    // revert confidential
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.confidential).parent()
      .click();
    cy.intercept('PATCH', 'agendaitems/**').as('patchAgendaitems2');
    cy.intercept('PATCH', 'subcases/**').as('patchSubcases2');
    cy.intercept('PATCH', 'news-items/**').as('patchNewsItems2');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click()
      .wait('@patchAgendaitems2')
      .wait('@patchSubcases2')
      .wait('@patchNewsItems2');
    cy.get(agenda.agendaDetailSidebarItem.confidential).should('not.exist');
    cy.get('@subcase1').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');
  });

  it('should change to confidential via subcase', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test change to confidential via subcase`;
    const subcaseTitleShort = `Cypress test: change to confidential via subcase - ${currentTimestamp()}`;

    // setup
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitleShort,
      agendaDate: agendaDate.format('DD-MM-YYYY'),
    });

    // set to confidential via subcase
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItems');
    cy.changeSubcaseAccessLevel(true);
    cy.wait('@patchNewsItems');
    // check agendaitem view
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShort)
      .parent()
      .parent()
      .as('subcase2');
    cy.get('@subcase2').find(agenda.agendaDetailSidebarItem.confidential);
    cy.get('@subcase2').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');
  });

  it('should postpone via actions', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test postpone via actions`;
    const subcaseTitleShort = `Cypress test: postpone via actions - ${currentTimestamp()}`;

    // setup
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitleShort,
      agendaDate: agendaDate.format('DD-MM-YYYY'),
    });

    // postpone via actions
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShort)
      .parent()
      .parent()
      .as('subcase3');
    cy.get('@subcase3').find(agenda.agendaDetailSidebarItem.inNewsletter);

    cy.intercept('PATCH', '/decision-activities/**').as('patchActivity1');
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItems1');
    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.postpone).forceClick();
    cy.wait('@patchActivity1');
    cy.wait('@patchNewsItems1');

    cy.get('@subcase3').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');
  });

  it('should postpone via decision', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test postpone via decision`;
    const subcaseTitleShort = `Cypress test: postpone via decision - ${currentTimestamp()}`;

    // setup
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitleShort,
      agendaDate: agendaDate.format('DD-MM-YYYY'),
    });

    // postpone via decision
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShort)
      .parent()
      .parent()
      .as('subcase4');

    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Uitgesteld')
      .click();
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt}`);

    cy.get('@subcase4').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');
  });

  it('should retract via actions', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test retract via actions`;
    const subcaseTitleShort = `Cypress test: retract via actions - ${currentTimestamp()}`;

    // setup
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitleShort,
      agendaDate: agendaDate.format('DD-MM-YYYY'),
    });

    // retract via actions
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShort)
      .parent()
      .parent()
      .as('subcase5');

    cy.intercept('PATCH', '/decision-activities/**').as('patchActivity2');
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItems2');
    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.postpone).forceClick();
    cy.wait('@patchActivity2');
    cy.wait('@patchNewsItems2');

    cy.get('@subcase5').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');
  });

  it('should retract via decision', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test retract via decision`;
    const subcaseTitleShort = `Cypress test: retract via decision - ${currentTimestamp()}`;

    // setup
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitleShort,
      agendaDate: agendaDate.format('DD-MM-YYYY'),
    });

    // retract via decision
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);

    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShort)
      .parent()
      .parent()
      .as('subcase7');

    cy.get('@subcase7').find(agenda.agendaDetailSidebarItem.inNewsletter);

    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.decisionResultPill.edit)
      .click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Ingetrokken')
      .click();
    const randomInt2 = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt2}`);
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.wait(`@patchDecisionActivities_${randomInt2}`);

    cy.get('@subcase7').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');
  });

  it('confidential subcase should not be on website', () => {
    const caseTitle = `testId=${currentTimestamp()}: Cypress test retract via actions`;
    const subcaseTitleShort = `Cypress test: retract via actions - ${currentTimestamp()}`;

    // setup
    cy.createCase(caseTitle);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: 'Mededeling',
      newShortTitle: subcaseTitleShort,
      confidential: true,
      agendaDate: agendaDate.format('DD-MM-YYYY'),
    });

    // confidential subcase should not be on website
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort);

    cy.get(agenda.agendaDetailSidebarItem.shortTitle).contains(subcaseTitleShort)
      .parent()
      .parent()
      .as('subcase6');
    cy.get('@subcase6').find(agenda.agendaDetailSidebarItem.inNewsletter)
      .should('not.exist');
  });
});
