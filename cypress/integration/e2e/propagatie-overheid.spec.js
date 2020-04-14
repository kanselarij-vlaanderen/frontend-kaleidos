/*global context, before, it, cy, Cypress, beforeEach*/
/// <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import actionModel from '../../selectors/action-modal.selectors';
import modal from '../../selectors/modal.selectors';

context('Agenda tests', () => {

  // before(() => {
  //   cy.resetDB();
  // });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('STEP 1: Create new agenda', () => {


    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const plusMonths = 1;
    const agendaDate = currentMoment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
    const subcaseTitle1 = caseTitle + ' test stap 1';
    const subcaseTitle2 = caseTitle + ' test stap 2';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.openCase(caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle2,
      'Cypress test voor het testen van toegevoegde agendapunten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');

    // when toggling show changes  the agendaitem with a document added should show
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);

    cy.setFormalOkOnAllItems();
    cy.approveDesignAgenda();
    cy.agendaItemExists(subcaseTitle1).click();
    cy.get(agenda.agendaItemDecisionTab).click();
    cy.get(agenda.addDecision).click();
    cy.get(agenda.uploadDecisionFile).click();

    cy.contains('Documenten opladen').click();
    cy.get('.vl-modal-dialog').as('fileUploadDialog');

    files.forEach((file, index) => {
      cy.get('@fileUploadDialog').within(() => {
        cy.uploadFile(file.folder, file.fileName, file.fileExtension);
      });
    });
    cy.get(form.formSave).click();
    cy.get(agenda.accessLevelPill).click();
    cy.existsAndVisible('.ember-power-select-trigger')
      .click();
    cy.existsAndVisible('.ember-power-select-option').contains('Intern Overheid').click().then(() => {
      cy.get(agenda.accessLevelSave).click().then(() => {
        cy.get(actionModel.showActionOptions).click().then(() => {
          cy.existsAndVisible(agenda.lockAgenda).click().then(() => {
            cy.get(actionModel.showActionOptions).click().then(() => {
              cy.existsAndVisible(actionModel.releaseDecisions).click().then(() => {
                cy.existsAndVisible(modal.verifyModal.save).click();
              });
            })
          });
        });
      });
    })
  });

  it('STEP 1: Create new agenda', () => {
  })



});

function currentTimestamp() {
  return Cypress.moment().unix();
}
function currentMoment() {
  return Cypress.moment();
}
