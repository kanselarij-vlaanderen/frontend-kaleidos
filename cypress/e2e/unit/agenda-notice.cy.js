/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import utils from '../../selectors/utils.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('agenda notice test', () => {
  const dateToCreateAgenda = Cypress.dayjs().add(11, 'weeks')
    .day(1);

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should create notice, add mandatees and fields and check if diplayed correctly', () => {
    const testId = `testId=${currentTimestamp()}`;
    const caseShortTitle = `Cypress add minister to notice - ${testId}`;
    const type = 'Mededeling';
    const subcaseShortTitle = `test for adding minister - ${testId}`;
    const subcaseLongTitle  = `long title for test for adding minister - ${testId}`;
    const labelName1 = 'Cultuur, Jeugd, Sport en Media';
    const fieldsName1 = 'Media';
    const labelName2 = 'Economie, Wetenschap en Innovatie';
    const fieldsName2 = 'Wetenschapscommunicatie';

    // create agenda and notice
    cy.createAgenda(null, dateToCreateAgenda, 'add minister to notice');
    cy.createCase(caseShortTitle);
    cy.addSubcase(type, subcaseShortTitle, subcaseLongTitle, null, null);
    cy.openSubcase(0, subcaseShortTitle);
    // add mandatees to notice
    cy.addSubcaseMandatee(mandateeNames.current.first);
    cy.addSubcaseMandatee(mandateeNames.current.second);
    // add fields
    cy.intercept('GET', '/concepts**').as('getConceptSchemes');
    cy.get(utils.governmentAreasPanel.edit).click();
    // await retrieval of government-fields in multiple pages
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.get(utils.governmentAreaSelectorForm.container)
      .contains(labelName1)
      .siblings(utils.governmentAreaSelectorForm.domainList)
      .contains(fieldsName1)
      .click();
    cy.get(utils.governmentAreaSelectorForm.container)
      .contains(labelName2)
      .siblings(utils.governmentAreaSelectorForm.domainList)
      .contains(fieldsName2)
      .click();
    cy.get(utils.editGovernmentFieldsModal.save).click();
    // check if mandatees were added to notice correctly and add notice to agenda
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });
    cy.proposeSubcaseForAgenda(dateToCreateAgenda);

    // check all data in non-edit view
    cy.openAgendaForDate(dateToCreateAgenda);
    cy.openDetailOfAgendaitem(subcaseShortTitle);
    cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseShortTitle);
    cy.get(agenda.agendaitemTitlesView.title).contains(subcaseLongTitle);
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandateeNames.current.first.fullName);
    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');
    // TODO-notice add check for fields?

    // add more mandatees and check if they are shown correctly
    cy.addAgendaitemMandatee(mandateeNames.current.third);
    cy.addAgendaitemMandatee(mandateeNames.current.fourth);
    cy.addAgendaitemMandatee(mandateeNames.current.fifth);
    cy.get('@listItems').eq(1)
      .should('contain', mandateeNames.current.second.fullName);
    cy.get('@listItems').eq(2)
      .should('contain', mandateeNames.current.third.fullName);
    cy.get('@listItems').eq(3)
      .should('contain', mandateeNames.current.fourth.fullName);
    cy.get('@listItems').eq(4)
      .should('contain', mandateeNames.current.fifth.fullName);
  });
});
