/*global context, before, it, cy, Cypress, beforeEach*/
/// <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import form from '../../selectors/form.selectors';
import actionModel from '../../selectors/action-modal.selectors';
import modal from '../../selectors/modal.selectors';
import documents from '../../selectors/document.selectors';
import utils from '../../selectors/utils.selectors';

context('Agenda tests', () => {

  before(() => {
    cy.resetCache();
    cy.server();
  });

  it('Propagate decisions and documents to overheid graph by releasing them', () => {

    cy.login('Admin');

    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const plusMonths = 1;
    const agendaDate = currentMoment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
    const subcaseTitle1 = caseTitle + ' test stap 1';
    const subcaseTitle2 = caseTitle + ' test stap 2';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf'};
    const files = [
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota'},
      {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet'}
    ];
    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het propageren naar overheid',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.agendaItemExists(subcaseTitle1).click();
    cy.wait(1000);
    cy.get(agenda.agendaItemDocumentsTab).click();
    cy.addDocumentsToAgendaItem(subcaseTitle1,files,true);

    cy.setFormalOkOnAllItems();
    cy.approveDesignAgenda();
    cy.closeAgenda();

    cy.agendaItemExists(subcaseTitle1).click();
    cy.get(agenda.agendaItemDecisionTab).click();
    cy.get(agenda.addDecision).click();
    cy.get(agenda.uploadDecisionFile).click();
    cy.contains('Documenten opladen').click();
    cy.get('.vl-modal-dialog').as('fileUploadDialog');

    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.get(form.formSave).click();
    cy.get(agenda.accessLevelPill).click();
    cy.existsAndVisible('.ember-power-select-trigger').click();
    cy.existsAndVisible('.ember-power-select-option').contains('Intern Overheid').click();
    cy.get(agenda.accessLevelSave).click();

    cy.contains('Wijzigen').click();
    cy.get('.vl-form__group').as('editDecision');
    cy.get('@editDecision').within(() => {
      cy.get('.vl-checkbox--switch__label').click();
    })

    cy.contains('Opslaan').click();

    cy.releaseDecisions();

    cy.wait(45000);
    cy.logout();
    cy.login('Overheid');
    cy.openAgendaForDate(agendaDate);
    cy.agendaItemExists(subcaseTitle1).click();
    cy.get(agenda.agendaItemDecisionTab).click();
    cy.get('.vlc-document-card').eq(0).within(() => {
      cy.get('.vl-title--h6 > span').contains(file.fileName);
    });
    cy.get(agenda.agendaItemDocumentsTab).click();
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 0);
    });

    cy.logout();
    cy.login('Admin');
    cy.openAgendaForDate(agendaDate);
    cy.releaseDocuments();
    cy.wait(45000);

    cy.logout();
    cy.login('Overheid');
    cy.openAgendaForDate(agendaDate);
    cy.agendaItemExists(subcaseTitle1).click();
    cy.wait(1000);
    cy.get(agenda.agendaItemDocumentsTab).click();
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').as('docCards').should('have.length', 2);
    });
  });

});

function currentTimestamp() {
  return Cypress.moment().unix();
}
function currentMoment() {
  return Cypress.moment();
}
