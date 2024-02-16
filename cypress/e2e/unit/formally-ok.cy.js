/* global context, it, cy,beforeEach, afterEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import utils from '../../selectors/utils.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';

context('Formally ok/nok tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should not show "formallyOk" status of agendaitems on approved agenda', () => {
    cy.visitAgendaWithLink('/vergadering/5EBAB9B1BDF1690009000001/agenda/1d4f8091-51cf-4d3c-b776-1c07cc263e59/agendapunten');
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 1);
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Formeel OK');
    cy.changeSelectedAgenda('Agenda A');
    // approved agendas never show the formally ok status of the agendaitem
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 1);
    cy.get(agenda.agendaOverviewItem.status).should('not.exist');
  });

  // TODO-agendaheader this test belongs with other agenda-header tests
  it.skip('should show warning when trying to approve agenda with "not yet formally ok" items', () => {
    cy.visitAgendaWithLink('/vergadering/5EBAB9B1BDF1690009000001/agenda/1d4f8091-51cf-4d3c-b776-1c07cc263e59/agendapunten');
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Formeel OK');
    // cy.setFormalOkOnItemWithIndex(0, true, 'Nog niet formeel OK');
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Nog niet formeel OK');
    cy.get(agenda.agendaVersionActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaVersionActions.actions.approveAgenda).forceClick();
    // "formeel niet ok" and "formeel nog niet ok" status are not approvable
    cy.get(appuniversum.alert.container).should('exist');
    cy.get(auk.modal.footer.cancel).click();
    // cy.setFormalOkOnItemWithIndex(0, true, 'Formeel OK');
    cy.get(agenda.agendaOverviewItem.status).should('contain', 'Formeel OK');
  });

  it.skip('should change formally ok after changing beleidsveld', () => {
    const type = 'Nota';
    const shortSubcaseTitle = 'Cypress test: formally ok change';
    const labelName1 = 'Cultuur, Jeugd, Sport en Media';

    // Make case

    cy.createCase('Cypress formally ok change');

    // Make subcase.
    cy.addSubcase(type, shortSubcaseTitle);

    // Make agendaitem
    cy.visitAgendaWithLink('/vergadering/5EBAB9B1BDF1690009000001/agenda/1d4f8091-51cf-4d3c-b776-1c07cc263e59/agendapunten');
    cy.addAgendaitemToAgenda(shortSubcaseTitle);
    // cy.setFormalOkOnItemWithIndex(1, true, 'Formeel OK');

    // Change government domains
    cy.openDetailOfAgendaitem(shortSubcaseTitle);
    cy.intercept('GET', '/concepts**').as('getConceptSchemes');
    cy.get(utils.governmentAreasPanel.edit).click();
    // await retrieval of government-fields in multiple pages
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.get(utils.governmentAreaSelectorForm.container)
      .contains(labelName1)
      .click();
    cy.get(utils.editGovernmentFieldsModal.save).click();

    // Verify formally ok is reset
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 1);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 1);

    cy.get(agenda.agendaTabs.tabs).contains('Overzicht')
      .click();
    // cy.setFormalOkOnItemWithIndex(1, true, 'Formeel OK');
    cy.openDetailOfAgendaitem(shortSubcaseTitle);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();

    // Change government domains
    cy.get(utils.governmentAreasPanel.edit).click();
    // await retrieval of government-fields in multiple pages
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.wait('@getConceptSchemes');
    cy.get(utils.governmentAreaSelectorForm.container)
      .contains(labelName1)
      .click();
    cy.get(utils.editGovernmentFieldsModal.save).click();

    cy.get(cases.subcaseDescription.agendaLink).click();
    // Verify formally ok is reset
    cy.get(agenda.agendaDetailSidebarItem.status.formallyOk).should('have.length', 1);
    cy.get(agenda.agendaDetailSidebarItem.status.notYetFormallyOk).should('have.length', 1);
  });
});
