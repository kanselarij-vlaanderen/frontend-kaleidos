/*global context, before, it, cy,beforeEach*/
/// <reference types="Cypress" />

import {formCancelButton, formFooterSaveSelector} from "../../selectors/formSelectors/formSelectors";
import {modalDialogCloseModalSelector, modalDialogSelector} from "../../selectors/models/modelSelectors";
import {modalDocumentVersionDeleteSelector} from "../../selectors/documents/documentSelectors";

context('Tests for KAS-917', () => {
  // const testStart = cy.currentMoment();

  context('Tests for cancelling CRUD operations on document and document-versions', () => {
    before(() => {
      cy.server();
      cy.resetDB();
    });

    beforeEach(() => {
      cy.server();
      cy.login('Admin');
    });

    it('Editing of a document or document-version but cancelling should show old data', () => {
      const caseTitle = 'Cypress test: cancel editing document versions - ' + cy.currentTimestamp();
      const type = 'Nota';
      const SubcaseTitleShort = 'Cypress test: cancel editing of documents on agendaitem - ' + cy.currentTimestamp();
      const subcaseTitleLong = 'Cypress test voor het annuleren van editeren van een document aan een agendaitem';
      const subcaseType = 'In voorbereiding';
      const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
      const fileName = 'test pdf';
      const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota'};
      const files = [file];
      cy.createCase(false, caseTitle);
      cy.openCase(caseTitle);
      cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
      cy.openSubcase(0);
      cy.addDocuments(files);
      const plusMonths = 1;
      const agendaDate = cy.currentMoment().add('month', plusMonths).set('date', 19).set('hour', 19).set('minute', 19);

      cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test annuleren van editeren documenten').then((meetingId) => {
        cy.openAgendaForDate(agendaDate, meetingId);
        cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
        cy.setFormalOkOnAllItems();
        cy.agendaItemExists(SubcaseTitleShort).click();

        cy.clickAgendaitemTab('Documenten');

        cy.get('.vlc-scroll-wrapper__body').within(() => {
          cy.get('.vlc-document-card').eq(0).within(() => {
            cy.get('.vl-title--h6 > span').contains(file.newFileName);
          });
        });

        cy.addNewDocumentVersionToAgendaItem(SubcaseTitleShort, file.newFileName, file);

        cy.get('.vlc-scroll-wrapper__body').within(() => {
          cy.get('.vlc-document-card').eq(0).within(() => {
            cy.get('.vl-title--h6 > span').contains(file.newFileName + ' BIS');
          });
        });
        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').each(() => {
          cy.get('.vlc-pill').contains('Intern Regering');
        });

        // Cancel/save of document-type and access-level in editing view
        cy.get('.vl-u-spacer-extended-left-s > .vl-link').contains('Wijzigen').click();
        cy.get('tbody > tr').as('documentRows');
        cy.get('@documentRows').eq(0).within(() => {
          cy.get('td').eq(1).within(() => {
            cy.get('.ember-power-select-trigger').click();
          });
        });
        cy.get('.ember-power-select-option').should('exist').then(() => {
          cy.contains('Decreet').click();
        });

        cy.get('@documentRows').eq(0).within(() => {
          cy.get('td').eq(2).within(() => {
            cy.get('.ember-power-select-trigger').click();
          });
        });
        cy.get('.ember-power-select-option').should('exist').then(() => {
          cy.contains('Publiek').click();
        });
        cy.contains('Annuleren').click();

        //Verify nothing changed after cancel
        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').each(() => {
          cy.get('.vlc-pill').contains('Intern Regering');
        });

        cy.get('.vl-u-spacer-extended-left-s > .vl-link').contains('Wijzigen').click();
        cy.get('tbody > tr').as('documentRows');
        cy.get('@documentRows').eq(0).within(() => {
          cy.get('td').eq(1).within(() => {
            cy.contains('Nota');
          });
        });
        cy.get('@documentRows').eq(0).within(() => {
          cy.get('td').eq(2).within(() => {
            cy.get('.ember-power-select-trigger').click();
          });
        });
        cy.get('.ember-power-select-option').should('exist').then(() => {
          cy.contains('Intern Overheid').click();
        });
        cy.contains('Opslaan').click();

        // Verify only 1 version is affected by change
        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').eq(0).within(() => {
          cy.get('.vlc-pill').contains('Intern Overheid');
        });
        cy.get('@versions').eq(1).within(() => {
          cy.get('.vlc-pill').contains('Intern Regering');
        });
        cy.get('.js-vl-accordion > button').click();

        // Cancel/save name in document card
        const extraName = (' - Nota');
        const savedName = fileName + extraName;
        cy.get('.vlc-document-card').within(() => {
          cy.get('.vl-title--h6').as('documentName');
          cy.get('@documentName').contains(fileName).click();
          cy.get('.vl-input-field--block').click().type(extraName);
          cy.get('.vl-vi-cross').click();
          // assert old value is back
          cy.get('@documentName').contains(fileName).click();
          cy.get('.vl-input-field--block').click().type(extraName);
          cy.get('.vl-vi-save').click();
          //TODO patch happens
          // assert new value is set
          cy.get('@documentName').contains(savedName);
        });

        // Verify only 1 version is affected by change
        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').eq(0).within(() => {
          cy.get('.vlc-pill').contains('Intern Overheid');
        });
        cy.get('@versions').eq(1).within(() => {
          cy.get('.vlc-pill').contains('Intern Regering');
        });
        cy.get('.js-vl-accordion > button').click();

        // Cancel/save access-level in document card
        cy.get('.vlc-document-card__content > .vlc-toolbar > .vlc-toolbar__right').as('accessLevelToolbar').within(() => {
          cy.get('.vlc-pill').contains('Intern Overheid').click();
          cy.get('.ember-power-select-trigger').click();
        });
        cy.get('.ember-power-select-option').should('exist').then(() => {
          cy.contains('Publiek').click();
        });
        cy.get('@accessLevelToolbar').within(() => {
          cy.get('.vl-vi-cross').click();
          cy.get('.vlc-pill').contains('Intern Overheid').click();
          cy.get('.ember-power-select-trigger').click();
        });
        cy.get('.ember-power-select-option').should('exist').then(() => {
          cy.contains('Publiek').click();
        });
        cy.get('@accessLevelToolbar').within(() => {
          cy.get('.vl-vi-save').click();
          //TODO patch happens
          cy.get('.vlc-pill').contains('Publiek').click();
        });

        // Verify only 1 version is affected by change
        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').eq(0).within(() => {
          cy.get('.vlc-pill').contains('Publiek');
        });
        cy.get('@versions').eq(1).within(() => {
          cy.get('.vlc-pill').contains('Intern Regering');
        });
        cy.get('.js-vl-accordion > button').click();
      });
    });

    it('Cancelling when adding new document-version should not skip a version the next time', () => {
      const caseTitle = 'Cypress test: document versions - ' + cy.currentTimestamp();
      const type = 'Nota';
      const SubcaseTitleShort = 'Cypress test: cancelling a new document version - ' + cy.currentTimestamp();
      const subcaseTitleLong = 'Cypress test voor het annuleren tijdens toevoegen van een nieuwe document versie';
      const subcaseType = 'In voorbereiding';
      const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
      const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
      const files = [file];
      cy.createCase(false, caseTitle);
      cy.openCase(caseTitle);
      cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
      cy.openSubcase(0);
      cy.addDocuments(files);
      const plusMonths = 1;
      const agendaDate = cy.currentMoment().add('month', plusMonths).set('date', 20).set('hour', 20).set('minute', 20);

      cy.createAgenda('Ministerraad', plusMonths, agendaDate, 'Test document-versies annuleren').then((meetingId) => {
        cy.openAgendaForDate(agendaDate, meetingId);
        cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
        cy.agendaItemExists(SubcaseTitleShort).click();
        cy.clickAgendaitemTab('Documenten');

        cy.get('.vlc-scroll-wrapper__body').within(() => {
          cy.get('.vlc-document-card').eq(0).within(() => {
            cy.get('.vl-title--h6 > span').contains(file.newFileName);
          });
        });

        uploadFileToCancel(file);
        cy.get(formCancelButton).click();

        cy.addNewDocumentVersionToAgendaItem(SubcaseTitleShort, file.newFileName, file);
        cy.get(modalDialogSelector).should('not.be.visible');
        cy.get('.vlc-scroll-wrapper__body').within(() => {
          cy.get('.vlc-document-card').eq(0).within(() => {
            cy.get('.vl-title--h6 > span').contains(file.newFileName + ' BIS');
          });
        });

        uploadFileToCancel(file);
        cy.get(modalDialogCloseModalSelector).click();

        cy.addNewDocumentVersionToAgendaItem(SubcaseTitleShort, file.newFileName, file);
        cy.get(modalDialogSelector).should('not.be.visible');
        cy.get('.vlc-scroll-wrapper__body').within(() => {
          cy.get('.vlc-document-card').eq(0).within(() => {
            cy.get('.vl-title--h6 > span').contains(file.newFileName + ' TER');
          });
        });

        uploadFileToCancel(file);
        cy.get(modalDocumentVersionDeleteSelector).click();
        cy.get(modalDialogSelector).within(() => {
          cy.get(formFooterSaveSelector).within(() => {
            cy.get('button').should('be.disabled');
          })
          cy.uploadFile(file.folder, file.fileName, file.fileExtension);
          cy.get('.vl-title--h6').contains(file.fileName);
          cy.get(formFooterSaveSelector).within(() => {
            cy.get('button').should('not.be.disabled').click();
          })
        });
        cy.get(modalDialogSelector).should('not.be.visible');
        cy.get('.vlc-scroll-wrapper__body').within(() => {
          cy.get('.vlc-document-card').eq(0).within(() => {
            cy.get('.vl-title--h6 > span').contains(file.newFileName + ' QUATER');
          });
        });

        // TODO pressing ESC key on the modal should be tested once implemented

        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').eq(0).within(() => {
          cy.get('.vl-title--h6').contains(file.newFileName + ' QUATER');
        });
        cy.get('@versions').eq(1).within(() => {
          cy.get('.vl-title--h6').contains(file.newFileName + ' TER');
        });
        cy.get('@versions').eq(2).within(() => {
          cy.get('.vl-title--h6').contains(file.newFileName + ' BIS');
        });
        cy.get('@versions').eq(3).within(() => {
          cy.get('.vl-title--h6').contains(file.newFileName);
        });
        cy.get('.js-vl-accordion > button').click();

        cy.openCase(caseTitle);
        cy.openSubcase(0);
        cy.clickReverseTab('Documenten');
        cy.get('.js-vl-accordion > button').click();
        cy.get('.vl-accordion__panel > .vlc-document-card-item').as('versions');
        cy.get('@versions').eq(0).within(() => {
          cy.get('.vl-title--h6').contains(file.newFileName + ' QUATER');
        });
        cy.get('@versions').eq(1).within(() => {
          cy.get('.vl-title--h6').contains(file.newFileName + ' TER');
        });
        cy.get('@versions').eq(2).within(() => {
          cy.get('.vl-title--h6 ').contains(file.newFileName + ' BIS');
        });
        cy.get('@versions').eq(3).within(() => {
          cy.get('.vl-title--h6').contains(file.newFileName);
        });
        cy.get('.js-vl-accordion > button').click();


      });
    });
  });

  function uploadFileToCancel(file) {
    cy.get('.vlc-document-card__content .vl-title--h6', {timeout: 12000})
      .contains(file.fileName, {timeout: 12000})
      .parents('.vlc-document-card').as('documentCard');

    cy.get('@documentCard').within(() => {
      cy.get('.vl-vi-nav-show-more-horizontal').click();
    });
    cy.get('.vl-link--block')
      .contains('Nieuwe versie uploaden', {timeout: 12000})
      .should('be.visible')
      .click();

    cy.get(modalDialogSelector).within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });
  }
});
