/* global context, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import dependency from '../../selectors/dependency.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('Propagation to other graphs', () => {
  const todayFormatted = Cypress.dayjs().format('DD-MM-YYYY');
  const agendaDate = Cypress.dayjs().add(1, 'weeks')
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
    cy.createCase(caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het propageren naar overheid',
      'Principiële goedkeuring',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda(null, agendaDate, 'Zaal oxford bij Cronos Leuven');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1);
    cy.addDocumentsToAgendaitem(subcaseTitle1, files);

    cy.setFormalOkOnItemWithIndex(0);
    cy.setFormalOkOnItemWithIndex(1);
    cy.approveAndCloseDesignAgenda();

    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.addDocumentToTreatment(file);
    cy.get(utils.vlModalFooter.save).click();

    // Change the rights of the treatment report
    cy.get(document.documentCard.card).within(() => {
      cy.get(document.accessLevelPill.edit).click();
      cy.get(dependency.emberPowerSelect.trigger).click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Intern Overheid')
      .click();
    cy.get(document.accessLevelPill.save).click();

    // check of treatment status is approved
    cy.get(agenda.decisionResultPill.pill).contains('Goedgekeurd');

    // Enable this to test editing on approved agendaitems (formal ok status changes KAS-1139)
    cy.intercept('PATCH', '/agendaitems/*').as('patchAgendaitem');
    cy.openDetailOfAgendaitem(subcaseTitle1);
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).type(' KAS-1139');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click();
    cy.wait('@patchAgendaitem');

    // check status pills (use within because find doesn't work, probably can't chain of appuniversum wormhole)
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).should('not.exist');
    });

    cy.releaseDecisions();
    cy.wait(80000);
    // check status pills (use within because find doesn't work, probably can't chain of appuniversum wormhole)
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).contains(`Beslissingen zijn vrijgegeven op ${todayFormatted}`);
    });

    cy.logoutFlow();
  });

  it('Test as Minister', () => {
    cy.login('Minister');
    cy.searchCase(caseTitle);
    cy.openSubcase(0);
    cy.url().should('contain', '/deeldossiers/');
    cy.get(cases.subcaseDescription.edit).should('not.exist');
    cy.get(cases.subcaseTitlesView.edit).should('not.exist');
    cy.get(cases.subcaseHeader.actionsDropdown).should('not.exist');
    cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
    cy.clickReverseTab('Documenten');
    cy.get(route.subcaseDocuments.batchEdit).should('not.exist');
    cy.get(route.subcaseDocuments.add).should('not.exist');
    cy.get(document.linkedDocuments.add).should('not.exist');
  });

  it('Test as Overheidsorganisatie', () => {
    cy.login('Overheidsorganisatie');
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitle1, false);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.documentCard.name.value).eq(0)
      .contains(file.fileName);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.card).should('have.length', 0);
    cy.logoutFlow();
  });

  it('Test as Admin', () => {
    cy.login('Admin');
    cy.openAgendaForDate(agendaDate);
    cy.releaseDocuments();
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).eq(1)
        .contains(`Publicatie documenten gepland op ${todayFormatted}`);
    });
    cy.wait(80000);
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).eq(1)
        .contains(`Documenten zijn vrijgegeven op ${todayFormatted}`);
    });
    cy.logoutFlow();
  });

  it('Test as Overheidsorganisatie', () => {
    cy.login('Overheidsorganisatie');
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitle1, false);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.card).should('have.length', 2);
    cy.logoutFlow();
  });
});
