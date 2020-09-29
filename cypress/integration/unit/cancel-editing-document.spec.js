/* global context, before, it, cy, Cypress, beforeEach */
// / <reference types="Cypress" />

import form from '../../selectors/form.selectors';
import modal from '../../selectors/modal.selectors';
import document from '../../selectors/document.selectors';
import agenda from '../../selectors/agenda.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

function uploadFileToCancel(file) {
  cy.get('.vlc-document-card__content .vl-title--h6', {
    timeout: 12000,
  })
    .contains(file.fileName, {
      timeout: 12000,
    })
    .parents('.vlc-document-card')
    .as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get('.ki-more').click();
  });
  cy.get('.vl-link--block')
    .contains('Nieuwe versie uploaden', {
      timeout: 12000,
    })
    .should('be.visible')
    .click();

  cy.get(modal.baseModal.dialogWindow).within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.get(document.modalPieceUploadedFilename).should('contain', file.fileName);
    cy.wait(1000);
  });
}

context('Tests for cancelling CRUD operations on document and pieces', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('Editing of a document or piece but cancelling should show old data', () => {
    const caseTitle = `Cypress test: cancel editing pieces - ${currentTimestamp()}`;
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: cancel editing of documents on agendaitem - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het annuleren van editeren van een document aan een agendaitem';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const fileName = 'test pdf';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
    };
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);
    const agendaDate = Cypress.moment().add(1, 'weeks')
      .day(1);

    cy.createAgenda('Ministerraad', agendaDate, 'Test annuleren van editeren documenten');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.clickAgendaitemTab(agenda.agendaitemDocumentsTab);

    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(file.newFileName);
        });
    });

    cy.addNewPieceToAgendaitem(SubcaseTitleShort, file.newFileName, file);

    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}BIS`);
        });
    });
    cy.get('.js-vl-accordion > button').click();
    cy.get('.vl-accordion__panel > .vlc-document-card-item').as('pieces');
    cy.get('@pieces').each(() => {
      cy.get('.vlc-pill').contains('Intern Regering');
    });

    // Cancel/save of document-type and access-level in editing view
    cy.get(agenda.subcaseDocumentsEdit).contains('Wijzigen')
      .click();
    cy.get('tbody > tr').as('documentRows');
    cy.get('@documentRows').eq(0)
      .within(() => {
        cy.get('td').eq(1)
          .within(() => {
            cy.get('.ember-power-select-trigger').click();
          });
      });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Decreet').click();
      });
    cy.get(agenda.documentType).should('exist')
      .should('be.visible')
      .contains('Decreet');

    cy.get('@documentRows').eq(0)
      .within(() => {
        cy.get('td').eq(2)
          .within(() => {
            cy.get('.ember-power-select-trigger').click();
          });
      });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Publiek').scrollIntoView()
          .click();
      });
    cy.get(agenda.documentAccessLevel).should('exist')
      .should('be.visible')
      .contains('Publiek');
    cy.contains('Annuleren').click();

    // Verify nothing changed after cancel
    cy.get('.js-vl-accordion > button').click();
    cy.get('.vl-accordion__panel > .vlc-document-card-item').as('pieces');
    cy.get('@pieces').each(() => {
      cy.get('.vlc-pill').contains('Intern Regering');
    });

    cy.get('.vl-u-spacer-extended-left-s > .vl-link').contains('Wijzigen')
      .click();
    cy.get('tbody > tr').as('documentRows');
    cy.get('@documentRows').eq(0)
      .within(() => {
        cy.get('td').eq(1)
          .within(() => {
            cy.contains('Nota');
          });
      });
    cy.get('@documentRows').eq(0)
      .within(() => {
        cy.get('td').eq(2)
          .within(() => {
            cy.get('.ember-power-select-trigger').click();
          });
      });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Intern Overheid').scrollIntoView()
          .click();
      });
    cy.contains('Opslaan').click();

    // Verify only 1 piece is affected by change
    cy.get('.js-vl-accordion > button').click();
    cy.get('.vl-accordion__panel > .vlc-document-card-item').as('pieces');
    cy.get('@pieces').eq(0)
      .within(() => {
        cy.get('.vlc-pill').contains('Intern Overheid');
      });
    cy.get('@pieces').eq(1)
      .within(() => {
        cy.get('.vlc-pill').contains('Intern Regering');
      });
    cy.get('.js-vl-accordion > button').click();

    // Cancel/save name in document card
    const extraName = (' - Nota');
    const savedName = `${fileName}BIS${extraName}`;
    cy.get('.vlc-document-card').within(() => {
      cy.get('.vl-title--h6').as('documentName');
      cy.get('@documentName').contains(fileName)
        .click();
      cy.get('.vl-input-field--block').click()
        .type(extraName);
      cy.get('.ki-cross').click();
      // assert old value is back
      cy.get('@documentName').contains(fileName)
        .click();
      cy.get('.vl-input-field--block').click()
        .type(extraName);
      cy.get('.ki-check').click();
      // TODO patch happens
    });
    cy.get('.vlc-document-card').within(() => {
      // assert new value is set
      cy.get('@documentName').contains(savedName);
    });

    // Verify only 1 piece is affected by change
    cy.get('.js-vl-accordion > button').click();
    cy.get('.vl-accordion__panel > .vlc-document-card-item').as('pieces');
    cy.get('@pieces').eq(0)
      .within(() => {
        cy.get('.vlc-pill').contains('Intern Overheid');
      });
    cy.get('@pieces').eq(1)
      .within(() => {
        cy.get('.vlc-pill').contains('Intern Regering');
      });
    cy.get('.js-vl-accordion > button').click();

    // Cancel/save access-level in document card
    cy.get('.vlc-document-card__content > .vlc-toolbar > .vlc-toolbar__right').as('accessLevelToolbar')
      .within(() => {
        cy.get('.vlc-pill').contains('Intern Overheid')
          .click();
        cy.get('.ember-power-select-trigger').click();
      });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Publiek').click();
      });
    cy.get('@accessLevelToolbar').within(() => {
      cy.get('.ki-cross').click();
      cy.get('.vlc-pill').contains('Intern Overheid')
        .click();
      cy.get('.ember-power-select-trigger').click();
    });
    cy.get('.ember-power-select-option').should('exist')
      .then(() => {
        cy.contains('Publiek').click();
      });
    cy.get('@accessLevelToolbar').within(() => {
      cy.get('.ki-check').click();
      // TODO patch happens
      cy.get('.vlc-pill').contains('Publiek')
        .click();
    });

    // Verify only 1 piece is affected by change
    cy.get('.js-vl-accordion > button').click();
    cy.get('.vl-accordion__panel > .vlc-document-card-item').as('pieces');
    cy.get('@pieces').eq(0)
      .within(() => {
        cy.get('.vlc-pill').contains('Publiek');
      });
    cy.get('@pieces').eq(1)
      .within(() => {
        cy.get('.vlc-pill').contains('Intern Regering');
      });
    cy.get('.js-vl-accordion > button').click();
  });

  it('Cancelling when adding new piece should not skip a piece the next time', () => {
    cy.route('DELETE', '/files/**').as('deleteFile');
    cy.route('POST', '/pieces').as('createNewPiece');
    const caseTitle = `Cypress test: pieces - ${currentTimestamp()}`;
    const type = 'Nota';
    const SubcaseTitleShort = `Cypress test: cancelling a new piece - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het annuleren tijdens toevoegen van een nieuwe document versie';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);
    const agendaDate = Cypress.moment().add(2, 'weeks')
      .day(1); // friday in two weeks

    cy.createAgenda('Ministerraad', agendaDate, 'Test document-versies annuleren');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.clickAgendaitemTab(agenda.agendaitemDocumentsTab);

    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(file.newFileName);
        });
    });

    uploadFileToCancel(file);
    cy.get(form.formCancelButton).click()
      .wait('@deleteFile');

    cy.addNewPieceToAgendaitem(SubcaseTitleShort, file.newFileName, file);
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}BIS`);
        });
    });

    uploadFileToCancel(file);
    cy.get(modal.baseModal.close).click()
      .wait('@deleteFile'); // TODO this causes fails sometimes because the piece is not deleted fully
    cy.addNewPieceToAgendaitem(SubcaseTitleShort, file.newFileName, file);
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}TER`);
        });
    });

    uploadFileToCancel(file);
    cy.get(document.modalPieceDelete).should('exist')
      .click()
      .wait('@deleteFile'); // TODO this causes fails sometimes because the piece is not deleted fully
    cy.get(modal.baseModal.dialogWindow).within(() => {
      cy.get(form.formSave).should('be.disabled');
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
      cy.wait(1000);
      cy.get(form.formSave).should('not.be.disabled')
        .click();
      cy.wait('@createNewPiece', {
        timeout: 12000,
      });
      cy.wait('@patchSubcase', {
        timeout: 12000,
      });
      cy.wait('@patchAgendaitem', {
        timeout: 12000,
      });
    });
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
    cy.get('.vlc-scroll-wrapper__body').within(() => {
      cy.get('.vlc-document-card').eq(0)
        .within(() => {
          cy.get('.vl-title--h6 > span').contains(`${file.newFileName}QUATER`);
        });
    });

    // TODO pressing ESC key on the modal should be tested once implemented

    cy.get('.js-vl-accordion > button').click();
    cy.get('.vl-accordion__panel > .vlc-document-card-item').as('pieces');
    cy.get('@pieces').eq(0)
      .within(() => {
        cy.get('.vl-title--h6').contains(`${file.newFileName}QUATER`);
      });
    cy.get('@pieces').eq(1)
      .within(() => {
        cy.get('.vl-title--h6').contains(`${file.newFileName}TER`);
      });
    cy.get('@pieces').eq(2)
      .within(() => {
        cy.get('.vl-title--h6').contains(`${file.newFileName}BIS`);
      });
    cy.get('@pieces').eq(3)
      .within(() => {
        cy.get('.vl-title--h6').contains(file.newFileName);
      });
    cy.get('.js-vl-accordion > button').click();

    cy.openCase(caseTitle);
    cy.openSubcase(0);
    cy.clickReverseTab('Documenten');
    cy.get('.js-vl-accordion > button').click();
    cy.get('.vl-accordion__panel > .vlc-document-card-item').as('pieces');
    cy.get('@pieces').eq(0)
      .within(() => {
        cy.get('.vl-title--h6').contains(`${file.newFileName}QUATER`);
      });
    cy.get('@pieces').eq(1)
      .within(() => {
        cy.get('.vl-title--h6').contains(`${file.newFileName}TER`);
      });
    cy.get('@pieces').eq(2)
      .within(() => {
        cy.get('.vl-title--h6 ').contains(`${file.newFileName}BIS`);
      });
    cy.get('@pieces').eq(3)
      .within(() => {
        cy.get('.vl-title--h6').contains(file.newFileName);
      });
    cy.get('.js-vl-accordion > button').click();
  });
});
