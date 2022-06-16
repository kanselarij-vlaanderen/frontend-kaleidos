/* global context, it, cy, Cypress, afterEach */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import document from '../../selectors/document.selectors';
import dependency from '../../selectors/dependency.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

function selectFromDropdown(item) {
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 5000,
  }).wait(500)
    .contains(item)
    .scrollIntoView()
    .trigger('mouseover')
    .click({
      force: true,
    });
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 15000,
  }).should('not.exist');
}

function selectConfidentialityLevel(docName, confLevel) {
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .find(document.accessLevelPill.edit)
    .click();
  cy.get(document.accessLevelPill.selector)
    .click();
  selectFromDropdown(confLevel);
  cy.get(document.accessLevelPill.save).click();
}

function checkAccess(docName, hasAccess = true) {
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .as('currentDoc');
  cy.get(auk.loader).should('not.exist');
  cy.get('@currentDoc').find(document.documentCard.versionHistory)
    .click();
  cy.get(auk.loader).should('not.exist');
  cy.get('@currentDoc').find(document.vlDocument.piece)
    .find(document.accessLevelPill.pill);
  if (hasAccess) {
    cy.get(document.vlDocument.showPieceViewer);
  } else {
    cy.get(document.vlDocument.showPieceViewer).should('not.exist');
  }
}

context('Propagation of confidentiality setup', () => {
  const agendaDate = Cypress.dayjs().add(19, 'weeks')
    .day(3);
  const caseTitle = `test propagatie vertrouwelijkheid ${currentTimestamp()}`;
  const subcaseTitle1 = `test propagatie vertrouwelijkheid ${currentTimestamp()}`;
  const subcaseTitle2 = `test propagatie vertrouwelijkheid locked ${currentTimestamp()}`;
  const docName1 = 'test propagatie vertrouwelijkheid intern secretarie';
  const docName2 = 'test propagatie vertrouwelijkheid ministerraad';
  const docName3 = 'test propagatie vertrouwelijkheid intern regering';
  const docName4 = 'test propagatie vertrouwelijkheid intern overheid';
  const docName5 = 'test propagatie vertrouwelijkheid publiek';

  const docNameLocked1 = 'test propagatie vertrouwelijkheid locked intern secretarie';
  const docNameLocked2 = 'test propagatie vertrouwelijkheid locked ministerraad';
  const docNameLocked3 = 'test propagatie vertrouwelijkheid locked intern regering';
  const docNameLocked4 = 'test propagatie vertrouwelijkheid locked intern overheid';
  const docNameLocked5 = 'test propagatie vertrouwelijkheid locked publiek';

  afterEach(() => {
    cy.logoutFlow();
  });

  it('setup', () => {
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docName1, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docName2, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docName3, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docName4, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docName5, fileType: 'Nota',
      }
    ];

    const filesLocked = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docNameLocked1, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docNameLocked2, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docNameLocked3, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docNameLocked4, fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: docNameLocked5, fileType: 'Nota',
      }
    ];

    cy.login('Admin');

    cy.createCase(caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het propageren van vertrouwelijkheid',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(files);
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    selectConfidentialityLevel(docName1, 'Intern Secretarie');
    cy.wait('@patchPieces1');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces2');
    selectConfidentialityLevel(docName2, 'Ministerraad');
    cy.wait('@patchPieces2');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces3');
    selectConfidentialityLevel(docName3, 'Intern Regering');
    cy.wait('@patchPieces3');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces4');
    selectConfidentialityLevel(docName4, 'Intern Overheid');
    cy.wait('@patchPieces4');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces5');
    selectConfidentialityLevel(docName5, 'Publiek');
    cy.wait('@patchPieces5');

    cy.openCase(caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle2,
      'Cypress test voor het propageren van vertrouwelijkheid',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.openSubcase(0);
    cy.addDocumentsToSubcase(filesLocked);
    cy.intercept('PATCH', '/pieces/**').as('patchPieces6');
    selectConfidentialityLevel(docNameLocked1, 'Intern Secretarie');
    cy.wait('@patchPieces6');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces7');
    selectConfidentialityLevel(docNameLocked2, 'Ministerraad');
    cy.wait('@patchPieces7');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces8');
    selectConfidentialityLevel(docNameLocked3, 'Intern Regering');
    cy.wait('@patchPieces8');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces9');
    selectConfidentialityLevel(docNameLocked4, 'Intern Overheid');
    cy.wait('@patchPieces9');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces10');
    selectConfidentialityLevel(docNameLocked5, 'Publiek');
    cy.wait('@patchPieces10');
    cy.get(cases.subcaseDetailNav.overview).click();
    cy.changeSubcaseAccessLevel(true);

    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1);
    cy.addAgendaitemToAgenda(subcaseTitle2);
    cy.setAllItemsFormallyOk(3);
    cy.approveAndCloseDesignAgenda();
    cy.releaseDecisions();
    // wait for yggie
    cy.wait(60000);
  });

  it('login as minister and check access', () => {
    cy.login('Minister');
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle1);
    checkAccess(docName1, false);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });

  it('login as kabinet and check access', () => {
    cy.login('Kabinet');
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle1);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });

  it('login as kanselarij and check access', () => {
    cy.login('Kanselarij');
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle1);
    checkAccess(docName1);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
    cy.releaseDocuments();
    // wait for yggie
    cy.wait(60000);
  });

  it('login as overheid and check access', () => {
    cy.login('Overheid');
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDocumentTab(subcaseTitle1);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3, false);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3, false);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });
});
