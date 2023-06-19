/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

function createPublicationViaMR(subcaseTitle, fileName, publicationNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.openAgendaitemDocumentTab(subcaseTitle);
  cy.get(route.agendaitemDocuments.openPublication).click();
  cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName)
    .parent()
    .find(publication.batchDocumentsPublicationRow.new)
    .click();

  // create new publication
  cy.get(publication.newPublication.number).click()
    .clear()
    .type(publicationNumber);
  cy.intercept('POST', '/publication-flows').as(`createNewPublicationFlow${randomInt}`);
  // more posts happen, but the patch is the final part of the create action
  cy.intercept('PATCH', '/pieces/**').as(`patchPieceForPublication${randomInt}`);
  cy.get(publication.newPublication.create).click();
  cy.wait(`@createNewPublicationFlow${randomInt}`);
  cy.wait(`@patchPieceForPublication${randomInt}`);
}

context('Publications overview tests', () => {
  beforeEach(() => {
    cy.login('OVRB');
    cy.visit('/publicaties');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should setup a publication for later tests because default data has none yet', () => {
    const fields = {
      number: 1401,
      shortTitle: 'Besluit van een Regering',
      longTitle: 'Besluit van een Regering betreffende beslissingen',
      remark: 'Sinds 2021',
      numacNumber: 1234567890,
    };
    cy.createPublication(fields);
    cy.intercept('POST', '/identifications').as('postNumacNumber');
    cy.get(publication.remark.edit).click();
    cy.get(publication.remark.textarea).type(fields.remark);
    cy.get(publication.remark.save).click();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.publicationCaseInfo.editView.numacNumber).find(dependency.emberTagInput.input)
      .click()
      .type(`${fields.numacNumber}{enter}`);
    cy.get(publication.publicationCaseInfo.editView.save).click();
    cy.wait('@postNumacNumber');
    cy.wait('@patchPublicationFlow');
  });

  // TODO-SETUP once we have default data, this test could be moved to click-table.spec
  it('should open a publication after clicking a row', () => {
    cy.get(publication.publicationsIndex.loading).should('not.exist');
    cy.get(publication.publicationsIndex.dataTable).find(publication.publicationTableRow.rows)
      .first()
      .click();
    cy.url().should('contain', 'publicaties')
      .should('contain', '/dossier');
  });

  it('should test all the result amount options shown options in overview', () => {
    const elementsToCheck = [
      10,
      50,
      100,
      200
    ];
    elementsToCheck.forEach((option) => {
      // In this loop, the options list should go away after url change but it doesn't always, creating a second option list that covers elements
      cy.get(dependency.emberPowerSelect.option).should('not.exist');
      cy.get(auk.formGroup).find(dependency.emberPowerSelect.trigger)
        .click();
      cy.get(dependency.emberPowerSelect.option).contains(option)
        .click();
      cy.get(publication.publicationsIndex.loading).should('not.exist');
      cy.url().should('include', `aantal=${option}`);
    });
  });

  it('should check and uncheck all settings', () => {
    const columnKeyNames = [
      'isUrgent',
      'publicationNumber',
      'numacNumber',
      'shortTitle',
      'remark',
      'numberOfPages',
      'decisionDate',
      'openingDate',
      'translationRequestDate',
      'translationDueDate',
      'proofRequestDate',
      'proofReceivedDate',
      'proofPrintCorrector',
      'publicationTargetDate',
      'publicationDate',
      'publicationDueDate',
      'regulationType',
      'source',
      'lastEdited',
      'status'
    ];

    cy.get(publication.publicationsIndex.configIcon).click();
    columnKeyNames.forEach((columnKeyName) => {
      cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).invoke('prop', 'checked')
        .then((checked) => {
          if (checked) {
            cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`);
            cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).parent(appuniversum.checkbox)
              .click();
            cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`).should('not.exist');
            cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).parent(appuniversum.checkbox)
              .click();
          } else {
            cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`).should('not.exist');
            cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).parent(appuniversum.checkbox)
              .click();
            cy.get(`[${publication.publicationsIndex.columnHeader}${columnKeyName}]`);
            cy.get(`[${publication.tableDisplayConfig.option}${columnKeyName}]`).parent(appuniversum.checkbox)
              .click();
          }
        });
    });
  });

  it('should test the short title tooltip', () => {
    const fields = {
      number: 1409,
      shortTitle: 'test met extra lange korte titel, lets gooooooooooooooooooooooooooo oooooooooooooooooooooooo ooooooooooooooooooooooooooooooo oooooooooooooooooooooooo oooooooooooooooooooo end',
    };
    cy.createPublication(fields);
    // test in detail view
    cy.get(publication.publicationHeader.shortTitle).contains('test met extra lange korte titel,')
      .should('not.contain', 'end')
      .parent()
      .find(dependency.emberTooltip.target)
      .trigger('mouseenter');
    cy.get(dependency.emberTooltip.inner).should('be.visible')
      .should('contain', 'end');
    // test in overview table
    cy.get(publication.publicationNav.goBack).click();
    cy.get(publication.publicationTableRow.row.shortTitle).contains('test met extra lange korte titel,')
      .should('not.contain', 'end')
      .parent()
      .find(dependency.emberTooltip.target)
      .trigger('mouseenter');
    cy.get(dependency.emberTooltip.inner).should('be.visible')
      .should('contain', 'end');
  });

  it('should test the pagination by clicking previous and next', () => {
    cy.visit('/publicaties?aantal=1');
    cy.wait(1000);
    // This test should work regardless of the amount of publications, but may take longer and longer
    // We could make the "aantal=X" a value based on the found "totalcount" but then we have to account for odds and evens
    cy.get(auk.pagination.count).invoke('text')
      .then((text) => {
        const array = text.split(' ');
        const totalCount = array[2];
        cy.get(auk.pagination.previous).should('be.disabled');
        for (let index = 1; index < totalCount; index++) {
          cy.get(auk.pagination.count).should('contain', `${index}-${index}`);
          cy.get(auk.pagination.next).click();
          cy.get(publication.publicationTableRow.rows).should('have.length', 1);
          cy.url().should('contain', `pagina=${index}`);
        }
        cy.get(auk.pagination.next).should('be.disabled');
        for (let index = totalCount - 1; index > 1; index--) {
          const currentCount = index + 1;
          cy.get(auk.pagination.count).should('contain', `${currentCount}-${currentCount}`);
          cy.url().should('contain', `pagina=${index}`);
          cy.get(auk.pagination.previous).click();
        }
        cy.get(auk.pagination.previous).click();
        cy.url().should('not.contain', 'pagina=');
        cy.get(auk.pagination.previous).should('be.disabled');
      });
  });

  it('should test changing to all statussen', () => {
    const defaultStatus = 'Opgestart';
    const statusList = [
      'Opgestart',
      'Naar vertaaldienst',
      'Vertaling in',
      'Drukproef aangevraagd',
      'Proef in',
      'Rappel proef',
      'Proef verbeterd',
      'Publicatie gevraagd',
      'Gepubliceerd',
      'Geannuleerd',
      'Gepauzeerd'
    ];
    const fields1 = {
      number: 1405,
      shortTitle: 'test status change in overview',
    };

    cy.createPublication(fields1);
    statusList.forEach((status) => {
      if (status !== defaultStatus) {
        cy.changePublicationStatus(status);
      }
      cy.get(publication.statusPill.contentLabel).contains(status);
      cy.get(publication.publicationNav.goBack).click();
      cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields1.number)
        .parent()
        .as('row');
      cy.get('@row')
        .find(publication.publicationTableRow.row.status)
        .contains(status);
      cy.get('@row')
        .find(publication.publicationTableRow.row.goToPublication)
        .click();
    });
  });

  it('should test if changing to all statussen keeps correct information on all routes', () => {
    const emptyStateMessage = 'Geen resultaten gevonden';
    const defaultStatus = 'Opgestart';
    const statusList = [
      'Opgestart',
      'Naar vertaaldienst',
      'Vertaling in',
      'Drukproef aangevraagd',
      'Proef in',
      'Rappel proef',
      'Proef verbeterd',
      'Publicatie gevraagd',
      'Gepubliceerd',
      'Geannuleerd',
      'Gepauzeerd'
    ];
    const fields1 = {
      number: 1420,
      shortTitle: 'test route information on status change',
      targetEndDate: Cypress.dayjs().add(-1, 'days'),
    };
    cy.createPublication(fields1);
    // set targetEndDate
    cy.get(publication.publicationNav.publications).click();
    cy.get(publication.publicationsInfoPanel.edit).click();
    cy.get(publication.publicationsInfoPanel.editView.targetEndDate).find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(fields1.targetEndDate);
    cy.get(publication.publicationsInfoPanel.editView.save).click();

    statusList.forEach((status) => {
      if (status !== defaultStatus) {
        cy.changePublicationStatus(status);
      }
      cy.get(publication.statusPill.contentLabel).contains(status);
      cy.get(publication.publicationNav.goBack).click();
      cy.get(publication.publicationsIndex.tabs.translations).click();
      if (status === 'Naar vertaaldienst') {
        cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields1.number);
      } else {
        cy.get(publication.publicationTableRow.row.publicationNumber).should('not.contain', fields1.number);
      }
      cy.get(publication.publicationsIndex.tabs.proof).click();
      if (status === 'Drukproef aangevraagd' || status === 'Rappel proef') {
        cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields1.number);
      } else {
        cy.get(publication.publicationTableRow.row.publicationNumber).should('not.contain', fields1.number);
      }
      cy.get(publication.publicationsIndex.tabs.proofread).click();
      if (status === 'Proef in') {
        cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields1.number);
      } else {
        cy.get(auk.emptyState.message).contains(emptyStateMessage);
      }
      cy.get(publication.publicationsIndex.tabs.late).click();
      if (status === 'Gepubliceerd' || status ===  'Geannuleerd') {
        cy.get(auk.emptyState.message).contains(emptyStateMessage);
      } else {
        cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields1.number);
      }

      cy.get(publication.publicationsIndex.tabs.all).click();
      cy.get(publication.publicationTableRow.row.publicationNumber).contains(fields1.number)
        .parent()
        .as('row');
      cy.get('@row')
        .find(publication.publicationTableRow.row.goToPublication)
        .click();
    });
  });

  it('should test the shortlist route', () => {
    cy.logout();
    cy.login('Admin');

    const caseTitle1 = `Cypress test: shortlist publications route case 1- ${currentTimestamp()}`;
    const caseTitle2 = `Cypress test: shortlist publications route case 2- ${currentTimestamp()}`;

    const type1 = 'Nota';
    const subcaseTitleShort1 = `Cypress test: subcase shortlist publications route subcase 1 - ${currentTimestamp()}`;
    const subcaseTitleLong1 = 'Cypress test voor shortlist publications route subcase 1';
    const subcaseType1 = 'Definitieve goedkeuring';
    const subcaseName1 = 'Goedkeuring na advies van de Raad van State';

    const type2 = 'Nota';
    const subcaseTitleShort2 = `Cypress test: subcase shortlist publications route subcase 2 - ${currentTimestamp()}`;
    const subcaseTitleLong2 = 'Cypress test voor shortlist publications route subcase 2';
    const subcaseType2 = 'Bekrachtiging Vlaamse Regering';
    const subcaseName2 = 'Goedkeuring na adviezen';

    const files1 = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'BVR',
      }
    ];

    const files2 = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
      }
    ];

    const publicationNumber1 = 1123;
    const publicationNumber2 = 1124;

    const fields = {
      number: publicationNumber2,
      shortTitle: 'Some text',
      longTitle: 'Some text',
    };

    const agendaDate = Cypress.dayjs().add(16, 'weeks')
      .day(6);

    // setup
    cy.createCase(caseTitle1);
    cy.addSubcase(type1, subcaseTitleShort1, subcaseTitleLong1, subcaseType1, subcaseName1);
    cy.createCase(caseTitle2);
    cy.addSubcase(type2, subcaseTitleShort2, subcaseTitleLong2, subcaseType2, subcaseName2);

    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.addAgendaitemToAgenda(subcaseTitleShort2);
    cy.addDocumentsToAgendaitem(subcaseTitleShort1, files1);
    cy.addDocumentsToAgendaitem(subcaseTitleShort2, files2);

    // check if both docs show correctly
    cy.get(utils.mHeader.publications).click();
    cy.get(publication.publicationsIndex.tabs.shortlist).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(publication.shortlist.row.documentName).contains(files1[0].newFileName)
      .parents('tr')
      .as('doc1');
    cy.get(publication.shortlist.row.documentName).contains(files2[0].newFileName)
      .parents('tr')
      .as('doc2');
    cy.get('@doc1').find(publication.shortlist.row.documentType)
      .contains(files1[0].fileType);
    cy.get('@doc2').find(publication.shortlist.row.documentType)
      .contains(files2[0].fileType);

    cy.openAgendaForDate(agendaDate);
    createPublicationViaMR(subcaseTitleShort1, files1[0].newFileName, publicationNumber1);

    // check if doc1 is no longer visible and create publication for doc2
    cy.get(auk.loader).should('not.exist');
    cy.get(auk.modal.header.close).click();
    cy.get(utils.mHeader.publications).click();
    cy.get(publication.publicationsIndex.tabs.shortlist).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(publication.shortlist.row.documentName).should('not.contain', files1[0].newFileName);
    cy.get('@doc2').find(publication.shortlist.row.openNewPublication)
      .click();
    cy.fillInNewPublicationFields(fields);
    cy.intercept('POST', '/cases').as('createNewCase');
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.intercept('GET', '/publication-flows/shortlist').as('getShortlist');
    cy.get(publication.newPublication.create).click()
      .wait('@createNewCase')
      .wait('@createNewPublicationFlow');
    // check if doc1 is no longer visible
    cy.wait('@getShortlist');
    cy.get(auk.loader).should('not.exist');
    cy.get(publication.shortlist.table).contains('Geen resultaten gevonden');
  });
});
