/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
// import dependency from '../../selectors/dependency.selectors';
import agenda from '../../selectors/agenda.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
import signature from '../../selectors/signature.selectors';

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

context.skip('signatures shortlist overview tests', () => {
  const caseTitle1 = `Cypress test: shortlist signatures route case 1- ${currentTimestamp()}`;
  const caseTitle2 = `Cypress test: shortlist signatures route case 2- ${currentTimestamp()}`;

  const type1 = 'Nota';
  const subcaseTitleShort1 = `Cypress test: subcase shortlist signatures route subcase 1 - ${currentTimestamp()}`;
  const subcaseTitleLong1 = 'Cypress test voor shortlist signatures route subcase 1';
  const subcaseType1 = 'Definitieve goedkeuring';
  const subcaseName1 = 'Goedkeuring na advies van de Raad van State';

  const type2 = 'Nota';
  const subcaseTitleShort2 = `Cypress test: subcase shortlist signatures route subcase 2 - ${currentTimestamp()}`;
  const subcaseTitleLong2 = 'Cypress test voor shortlist signatures route subcase 2';
  const subcaseType2 = 'Definitieve goedkeuring';
  const subcaseName2 = 'Goedkeuring na adviezen';

  const files1 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2023 0504 DOC.0001-1', fileType: 'BVR',
    }
  ];

  const files2 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2023 0504 DOC.0001-2', fileType: 'BVR',
    }
  ];

  const agendaDate = Cypress.dayjs().add(15, 'weeks')
    .day(5);

  const mandatee1 = 'Bart Somers';
  const mandatee2 = 'Ben Weyts';

  // TODO maintenance heavy, config file?
  const currentMinisters = [
    'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, Digitalisering en Facilitair Management, Minister-president van de Vlaamse Regering',
    'Hilde Crevits, Vlaams minister van Welzijn, Volksgezondheid en Gezin',
    'Bart Somers, Vlaams minister van Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen',
    'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
    'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme',
    'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed',
    'Lydia Peeters, Vlaams minister van Mobiliteit en Openbare Werken',
    'Benjamin Dalle, Vlaams minister van Brussel, Jeugd, Media en Armoedebestrijding',
    'Jo Brouns, Vlaams minister van Economie, Innovatie, Werk, Sociale Economie en Landbouw'
  ];

  const approverEmail = 'approver@test.com';
  const notificationEmail = 'notification@test.com';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('setup', () => {
    cy.createCase(caseTitle1);
    cy.addSubcase(type1, subcaseTitleShort1, subcaseTitleLong1, subcaseType1, subcaseName1);
    cy.openSubcase(0, subcaseTitleShort1);
    cy.addDocumentsToSubcase(files1);
    cy.createCase(caseTitle2);
    cy.addSubcase(type2, subcaseTitleShort2, subcaseTitleLong2, subcaseType2, subcaseName2);
    cy.openSubcase(0, subcaseTitleShort2);
    cy.addDocumentsToSubcase(files2);

    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.addAgendaitemToAgenda(subcaseTitleShort2);
    cy.setAllItemsFormallyOk(3);
    cy.approveDesignAgenda();

    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.addAgendaitemMandatee(3);
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.addAgendaitemMandatee(4);

    cy.setAllItemsFormallyOk(2);
    cy.approveAndCloseDesignAgenda();
    cy.releaseDecisions();
  });

  it('should check the signatures overview', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1');

    cy.get(route.signatures.row.mandatee).contains(mandatee1)
      .parent()
      .as('currentDoc');

    cy.get('@currentDoc').find(route.signatures.row.name)
      .invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.get(document.previewDetailsTab.name).children('div.auk-key-value-item__value')
      .contains(files1[0].newFileName);
    cy.go('back');

    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();
    cy.get(route.signatures.sidebar.close);
    // clicking it again should not close the sidebar (so close button should still be visible and clickable)
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();
    cy.get(route.signatures.sidebar.close).click();
    cy.get(route.signatures.sidebar.close).should('not.exist');
  });

  it('should check the signatures overview mandatee filter', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1');

    // no filters (all mandatees)
    cy.get(route.signatures.row.mandatee).contains(mandatee1);
    cy.get(route.signatures.row.mandatee).contains(mandatee2);

    // filter nonexistent
    cy.get(route.signatures.openMinisterFilter).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(appuniversum.checkbox).contains('Jan Jambon')
      .click();
    cy.intercept('GET', '/sign-flows*').as('getShortlist2');
    cy.get(route.signatures.applyFilter).click()
      .wait('@getShortlist2');
    cy.get(route.signatures.dataTable).contains('Geen resultaten gevonden');

    // filter one
    cy.get(route.signatures.openMinisterFilter).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(appuniversum.checkbox).contains(mandatee1)
      .click();
    cy.intercept('GET', '/sign-flows*').as('getShortlist3');
    cy.get(route.signatures.applyFilter).click()
      .wait('@getShortlist3');
    cy.get(route.signatures.row.mandatee).contains(mandatee1);
    cy.get(route.signatures.row.mandatee).should('not.contain', mandatee2);

    // filter both
    cy.get(route.signatures.openMinisterFilter).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(appuniversum.checkbox).contains(mandatee2)
      .click();
    cy.intercept('GET', '/sign-flows*').as('getShortlist4');
    cy.get(route.signatures.applyFilter).click()
      .wait('@getShortlist4');
    cy.get(route.signatures.row.mandatee).contains(mandatee1);
    cy.get(route.signatures.row.mandatee).contains(mandatee2);
  });

  it('should check the signatures overview sidebar', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1');

    cy.get(route.signatures.row.mandatee).contains(mandatee1)
      .parent()
      .as('currentDoc');

    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();

    // check info
    cy.get(route.signatures.sidebar.info).contains(files1[0].fileType);
    cy.get(route.signatures.sidebar.info).contains(files1[0].newFileName);
    cy.get(route.signatures.sidebar.info).contains(agendaDate.format('DD-MM-YYYY'));

    // check preview
    cy.get(route.signatures.sidebar.preview).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.go('back');
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();
    // check last agendaitem
    cy.get(route.signatures.sidebar.lastAgendaitem).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'agendapunten');
    cy.get(agenda.agendaSideNav.agendaName).contains('B')
      .parents('li')
      .invoke('attr', 'class')
      .should('include', 'auk-sidebar__item--active');
    cy.go('back');
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();

    // check default signers
    cy.get(signature.createSignFlow.signers.item).eq(0)
      .contains('Jan Jambon');
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .contains(mandatee1);
    // remove signer with button
    cy.get(signature.createSignFlow.signers.remove).eq(1)
      .click();
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .should('not.exist');
    // add signer
    cy.get(signature.createSignFlow.signers.edit).click();
    cy.get(auk.loader).should('not.exist');
    // TODO can't add selector to container, only to checkboxlist, which isn't specific enough?
    cy.get(mandatee.mandateeCheckboxList).find(appuniversum.checkbox)
      .contains(mandatee1)
      .scrollIntoView()
      .click();
    cy.get(signature.selectMinisters.apply).click();
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .contains(mandatee1);
    // remove signer with edit
    cy.get(signature.createSignFlow.signers.edit).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(mandatee.mandateeCheckboxList).find(appuniversum.checkbox)
      .contains(mandatee1)
      .scrollIntoView()
      .click();
    cy.get(signature.selectMinisters.apply).click();
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .should('not.exist');

    // check that there's only current ministers
    cy.get(signature.createSignFlow.signers.edit).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(mandatee.mandateeCheckboxList).find(appuniversum.checkbox)
      .should('have.length', 9);
    currentMinisters.forEach((minister) => {
      cy.get(appuniversum.checkbox).contains(minister);
    });
    cy.get(auk.modal.footer.cancel).click();

    // add approver
    cy.get(signature.createSignFlow.approvers.add).click();
    cy.get(signature.email.input).type(approverEmail);
    cy.get(signature.email.add).click();
    cy.get(signature.createSignFlow.approvers.item).contains(approverEmail);
    // remove approver
    cy.get(signature.createSignFlow.approvers.remove).click();
    cy.get(signature.createSignFlow.approvers.item).should('not.exist');

    // add notification adress
    cy.get(signature.createSignFlow.notificationAdresses.add).click();
    cy.get(signature.email.input).type(notificationEmail);
    cy.get(signature.email.add).click();
    cy.get(signature.createSignFlow.notificationAdresses.item).contains(notificationEmail);
    // remove notification adress
    cy.get(signature.createSignFlow.notificationAdresses.remove).click();
    cy.get(signature.createSignFlow.notificationAdresses.item).should('not.exist');

    // start signflow
    cy.get(route.signatures.sidebar.startSignflow).click();
    cy.wait(5000);
    // TODO where patchcalls?
  });
});

context('publications shortlist overview tests', () => {
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

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('setup', () => {
    cy.createCase(caseTitle1);
    cy.addSubcase(type1, subcaseTitleShort1, subcaseTitleLong1, subcaseType1, subcaseName1);
    cy.openSubcase(0, subcaseTitleShort1);
    cy.addDocumentsToSubcase(files1);
    cy.createCase(caseTitle2);
    cy.addSubcase(type2, subcaseTitleShort2, subcaseTitleLong2, subcaseType2, subcaseName2);
    cy.openSubcase(0, subcaseTitleShort2);
    cy.addDocumentsToSubcase(files2);

    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.addAgendaitemToAgenda(subcaseTitleShort2);
    cy.get(auk.loader).should('not.exist');
  });

  it('should check the shortlist overview', () => {
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
    // cy.intercept('POST', '/cases').as('createNewCase');
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.intercept('GET', '/publication-flows/shortlist').as('getShortlist');
    cy.get(publication.newPublication.create).click()
      // .wait('@createNewCase')
      .wait('@createNewPublicationFlow');
    // check if doc2 is no longer visible
    cy.wait('@getShortlist');
    cy.get(auk.loader).should('not.exist');
    // different table when signature data is enabled.
    // cy.get(publication.shortlist.row.documentName).should('not.contain', files2[0].newFileName);
    cy.get(publication.shortlist.table).contains('Geen resultaten gevonden');
  });
});
