/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import utils from '../../selectors/utils.selectors';

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
    const nameToCheck = 'Jambon';
    const labelName1 = 'Cultuur, Jeugd, Sport en Media';
    const fieldsName1 = 'Media';
    const labelName2 = 'Economie, Wetenschap en Innovatie';
    const fieldsName2 = 'Wetenschapscommunicatie';

    // create agenda and notice
    cy.createAgenda(null, dateToCreateAgenda, 'add minister to notice');
    cy.createCase(caseShortTitle);
    cy.addSubcase(type, subcaseShortTitle, subcaseLongTitle, null, null);
    cy.openSubcase(0);
    // add mandatees to notice
    cy.addSubcaseMandatee(1);
    cy.addSubcaseMandatee(2);
    // add fields
    cy.intercept('GET', '/concepts**').as('getConceptSchemes');
    cy.get(utils.governmentAreasPanel.edit).click();
    cy.wait('@getConceptSchemes', {
      timeout: 600000,
    }); // This call can take up to a minute
    cy.get(utils.governmentAreaSelectorForm.container).contains(labelName1)
      .find(utils.governmentAreaSelectorForm.field)
      .contains(fieldsName1)
      .click();
    cy.get(utils.governmentAreaSelectorForm.container).contains(labelName2)
      .find(utils.governmentAreaSelectorForm.field)
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
      .should('contain', nameToCheck);
    cy.get('@listItems').eq(0)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');
    // TODO-notice add check for fields?

    // add more mandatees and check if they are shown correctly
    cy.addAgendaitemMandatee(3);
    cy.addAgendaitemMandatee(4);
    cy.addAgendaitemMandatee(5);
    cy.get('@listItems').eq(1)
      .should('contain', 'Hilde Crevits');
    cy.get('@listItems').eq(2)
      .should('contain', 'Bart Somers');
    cy.get('@listItems').eq(3)
      .should('contain', 'Ben Weyts');
    cy.get('@listItems').eq(4)
      .should('contain', 'Zuhal Demir');
  });
});
