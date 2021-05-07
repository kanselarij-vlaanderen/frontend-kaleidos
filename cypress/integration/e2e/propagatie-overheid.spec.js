/* global context, before, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import document from '../../selectors/document.selectors';

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
    cy.get(form.formSave).click();

    // TODO We are clicking the pill inside the document card of treatment report
    cy.get(agenda.accessLevelPill).click();
    cy.existsAndVisible('.ember-power-select-trigger').click();
    cy.existsAndVisible('.ember-power-select-option').contains('Intern Overheid')
      .click();
    cy.get(agenda.accessLevelSave).click();

    // TODO verify if this is needed, default treatments for agendaitem is approved anyway
    cy.contains('Wijzigen').click();
    cy.get('.auk-box').as('editDecision');
    cy.get('@editDecision').within(() => {
      cy.get(agenda.decisionPowerSelectContainer).should('exist')
        .should('be.visible')
        .within(() => {
          cy.get('.ember-power-select-trigger').scrollIntoView()
            .click();
        });
    });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Goedgekeurd').scrollIntoView()
          .click();
      });
    cy.contains('Opslaan').click();
    cy.releaseDecisions();
    cy.wait(60000);
    cy.logoutFlow();
  });

  // TODO TEST AS MINISTER, we need seperate tests to verify wat/when other profiles can see data
  it('Test as Minister', () => {
    cy.server();
    cy.login('Minister');
    cy.searchCase(caseTitle);
    cy.openSubcase(0);
    cy.url().should('contain', '/deeldossiers/');
    cy.url().should('contain', '/overzicht');
    cy.contains('Wijzigen').should('not.exist');
    cy.contains('Acties').should('not.exist');
    cy.contains('Indienen voor agendering').should('not.exist'); // TODO this subcase is already on agenda so the button does not exist regardless of profile
    cy.clickReverseTab('Documenten');
    cy.contains('Wijzigen').should('not.exist');
    cy.contains('Documenten toevoegen').should('not.exist');
    cy.contains('Reeds bezorgde documenten koppelen').should('not.exist');
  });
  it('Test as Overheid', () => {
    cy.server();
    cy.login('Overheid');
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitle1, false);
    cy.get(agenda.agendaitemDecisionTab).click();
    cy.get(document.documentCard).eq(0)
      .within(() => {
        cy.get('.auk-h4 > span').contains(file.fileName);
      });
    cy.get(agenda.agendaitemDocumentsTab).click();
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard).as('docCards')
        .should('have.length', 0);
    });
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
    cy.get(agenda.agendaitemDocumentsTab).click();
    cy.get('.auk-scroll-wrapper__body').within(() => {
      cy.get(document.documentCard).as('docCards')
        .should('have.length', 2);
    });

    cy.logoutFlow();
  });
});
