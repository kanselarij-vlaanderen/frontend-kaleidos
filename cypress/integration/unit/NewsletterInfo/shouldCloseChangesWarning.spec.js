/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />

import alert from '../../../selectors/alert.selectors';
import agenda from '../../../selectors/agenda.selectors';

context('Show warning in newsletterinfo', () => {

  //TODO: Create agenda
  //TODO: Create procedurestap
  //TODO: Add procedurestap to agenda
  //TODO: Switch to kortbestek tab
  //TODO: Warning should be there

  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Should close warning in kortbestek view when nota is added but KB is not updated', () => {
    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const plusMonths = 1;
    const agendaDate = currentMoment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
    const subcaseTitle1 = caseTitle + ' test stap 1';

    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
    const files = [file];

    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);
    cy.openAgendaItemDocumentTab(subcaseTitle1,false);
    // cy.addDocuments(files);
    cy.route('GET', 'document-types?**').as('getDocumentTypes');
    cy.route('POST', 'document-versions').as('createNewDocumentVersion');
    cy.route('POST', 'documents').as('createNewDocument');
    cy.route('PATCH', '**').as('patchModel');

    cy.contains('Documenten toevoegen').click();
    cy.get('.vl-modal-dialog').as('fileUploadDialog');

    files.forEach((file, index) => {
      cy.get('@fileUploadDialog').within(() => {
        cy.uploadFile(file.folder, file.fileName, file.fileExtension);

        cy.get('.vl-uploaded-document', { timeout: 10000 }).should('have.length', index+1).eq(index).within(() => {
          if(file.newFileName) {
            cy.get('.vlc-input-field-block').eq(0).within(() => {
              cy.get('.vl-input-field').clear().type(file.newFileName);
            });
          }
        });
      });

      if(file.fileType) {
        cy.get('@fileUploadDialog').within(() => {
          cy.get('.vl-uploaded-document').eq(index).within(() => {
            cy.get('.vlc-input-field-block').eq(1).within(() => {
              cy.get('.ember-power-select-trigger').click();
              cy.wait('@getDocumentTypes', { timeout: 12000 });
            });
          });
        });
        cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
          cy.contains(file.fileType).click();
        });
      }
    });
    cy.get('@fileUploadDialog').within(() => {
      cy.get('.vl-button').contains('Documenten toevoegen').click();
    });
    cy.wait('@createNewDocumentVersion', { timeout: 12000 });
    cy.wait('@createNewDocument', { timeout: 12000 });
    cy.wait('@patchModel', { timeout: 12000  + 6000 * files.length });
    cy.route('/');
    cy.openAgendaForDate(agendaDate);
    cy.addNewDocumentVersionToAgendaItem(subcaseTitle1, file.newFileName , file);
    cy.get(agenda.agendaItemKortBestekTab)
      .should('be.visible')
      .click()
      .wait(2000); //Access-levels GET occured earlier, general wait instead
    cy.get(alert.changesAlertComponent).should('be.visible');
    cy.get(alert.changesAlertComponentCloseButton).click();
    cy.get(alert.changesAlertComponent).should('not.be.visible');
  })
});

function currentMoment() {
  return Cypress.moment();
}

function currentTimestamp() {
  return Cypress.moment().unix();
}
