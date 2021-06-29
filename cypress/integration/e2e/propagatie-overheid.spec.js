/* global context, before, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import dependency from '../../selectors/dependency.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

context('Propagation to other graphs', () => {
  before(() => {
    cy.resetCache();
    cy.server();
  });
  const agendaDate = Cypress.moment().add(1, 'weeks')
    .day(6); // Next friday
  const caseTitle = `testId=${currentTimestamp()}: Cypress test dossier 1`;
  const subcaseTitle1 = `${caseTitle} test stap 1`;
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf',
  };

  it('Propagate decisions and documents to overheid graph by releasing them', () => {
    cy.login('Admin');
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
      }
    ];
    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het propageren naar overheid',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.addDocumentsToAgendaitem(subcaseTitle1, files);

    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveDesignAgenda();
    cy.closeAgenda();

    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.addDocumentToTreatment(file);
    cy.get(utils.vlModalFooter.save).click();

    // TODO KAS-2693 We are clicking the pill inside the document card of treatment report
    cy.get(agenda.accessLevelPill.pill).click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .click();
    cy.get(agenda.accessLevelPill.save).click();

    // TODO KAS-2693 verify if this is needed, default treatments for agendaitem is approved anyway
    cy.get(agenda.agendaitemDecision.edit).click();
    cy.get(agenda.agendaitemDecisionEdit.resultContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger).scrollIntoView()
        .click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Goedgekeurd')
      .scrollIntoView()
      .click();
    cy.get(agenda.agendaitemDecisionEdit.save).click();
    cy.releaseDecisions();
    cy.wait(60000);
    cy.logoutFlow();
  });

  it('Test as Minister', () => {
    cy.server();
    cy.login('Minister');
    cy.searchCase(caseTitle);
    cy.openSubcase(0);
    cy.url().should('contain', '/deeldossiers/');
    cy.url().should('contain', '/overzicht');
    cy.get(cases.subcaseDescription.edit).should('not.exist');
    cy.get(cases.subcaseTitlesView.edit).should('not.exist');
    cy.get(cases.subcaseHeader.actionsDropdown).should('not.exist');
    cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
    cy.clickReverseTab('Documenten');
    cy.get(route.subcaseDocuments.batchEdit).should('not.exist');
    cy.get(route.subcaseDocuments.add).should('not.exist');
    cy.get(document.linkedDocuments.add).should('not.exist');
  });

  it('Test as Overheid', () => {
    cy.server();
    cy.login('Overheid');
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitle1, false);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    // TODO KAS-2693 make sure we wait for dataloading
    cy.get(document.documentCard.titleHeader).eq(0)
      .contains(file.fileName);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.card).should('have.length', 0);
    cy.logoutFlow();
  });

  it('Test as Admin', () => {
    cy.server();
    cy.login('Admin');
    cy.openAgendaForDate(agendaDate);
    cy.releaseDocuments();
    cy.wait(60000);

    cy.logoutFlow();
  });

  it('Test as Overheid', () => {
    cy.server();
    cy.login('Overheid');
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitle1, false);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.card).should('have.length', 2);

    cy.logoutFlow();
  });
});
