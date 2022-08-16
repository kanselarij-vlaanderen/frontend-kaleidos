/* global context, it, cy, beforeEach, afterEach, Cypress*/

// / <reference types="Cypress" />
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';

beforeEach(() => {
  cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
  cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
  cy.visit('/publicaties');
  cy.wait('@getRegulationTypes');
});

afterEach(() => {
  cy.logout();
});

context('Publications new features tests', () => {
  it('should check addition of urgent to mail subject', () => {
    // open publication and set to urgent
    cy.visit('/publicaties/626FBC3BCB00108193DC4361/dossier');
    cy.get(publication.publicationCaseInfo.edit).click();
    cy.get(publication.urgencyLevelCheckbox).parent()
      .click();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.get(publication.publicationCaseInfo.editView.save).click()
      .wait('@patchPublicationFlow');

    // check if translation mail message contains urgent
    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.translationsIndex.requestTranslation).click();
    cy.get(publication.translationRequest.message).should('have.value', 'DRINGEND! Tegen - vertaling gewenst\t\n\nCollega,\n\nHierbij ter vertaling:\nVO-dossier: 2007\n\nTitel: Besluitvorming Vlaamse Regering hoed\t\n\nUiterste vertaaldatum: -\t\n\nAantal pagina’s: \t\nAantal woorden: \t\nAantal documenten: 0\t\n\n\nMet vriendelijke groet,\n\nVlaamse overheid\t\nDEPARTEMENT KANSELARIJ & BUITENLANDSE ZAKEN\t\nTeam Ondersteuning Vlaamse Regering\t\npublicatiesBS@vlaanderen.be\t\nKoolstraat 35, 1000 Brussel\t\n');
    cy.get(auk.modal.footer.cancel).click();

    // check if proof mail subject contains urgent
    cy.get(publication.publicationNav.publishpreview).click();
    cy.get(publication.proofsIndex.newRequest).click();
    cy.get(publication.proofRequest.subject).should('have.value', 'DRINGEND: Drukproefaanvraag VO-dossier: 2007 - Besluitvorming Vlaamse Regering hoed');
    cy.get(auk.modal.footer.cancel).click();

    // check if publication mail subject contains urgent
    cy.get(publication.publicationNav.publications).click();
    cy.get(publication.publicationActivities.request).click();
    cy.get(publication.publicationRequest.subject).should('have.value', 'DRINGEND: Publicatieaanvraag BS-werknr:  VO-dossier: 2007');
    cy.get(auk.modal.footer.cancel).click();

    // remove urgency // TODO-setup needed in new search test
    // cy.get(publication.publicationNav.case).click();
    // cy.get(publication.publicationCaseInfo.edit).click();
    // cy.get(publication.urgencyLevelCheckbox).parent()
    //   .click();
    // cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow2');
    // cy.get(publication.publicationCaseInfo.editView.save).click()
    //   .wait('@patchPublicationFlow2');
  });

  it('should check number of extracts default, docs removable, uploaded docs inherited when making new publication and registration updates correctly', () => {
    const previousStatus = 'Publicatie gevraagd';
    const endStatus = 'Gepubliceerd';
    const today = Cypress.dayjs().format('DD-MM-YYYY');
    const fields = {
      number: 2092,
      shortTitle: 'test nieuwe features',
    };
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.createPublication(fields);

    // check number of extracts default
    cy.get(publication.publicationNav.decisions).click();
    cy.get(publication.decisionsInfoPanel.view.numberOfExtracts).contains(1);
    cy.get(publication.decisionsInfoPanel.openEdit).click();
    cy.get(publication.decisionsInfoPanel.edit.numberOfExtracts).should('have.value', 1)
      .clear()
      .type(2);
    cy.get(publication.decisionsInfoPanel.save).click();
    cy.get(publication.decisionsInfoPanel.view.numberOfExtracts).contains(2);

    // check translation docs removable
    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.translationsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/translation-subcases/**').as('patchtranslationSubcase');
    cy.get(publication.translationUpload.save).click()
      .wait('@patchtranslationSubcase');
    cy.get(auk.loader).should('not.exist');
    cy.get(publication.translationReceivedPanel.panel).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.intercept('PATCH', '/translation-activities/**').as('patchtranslationActivities');
    cy.get(publication.documentsList.deletePiece).click()
      .wait('@patchtranslationActivities');
    cy.get(publication.documentsList.piece).should('not.exist');

    // check translation docs not removable once used in proof request
    cy.get(publication.translationsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/translation-subcases/**').as('patchtranslationSubcase');
    cy.get(publication.translationUpload.save).click()
      .wait('@patchtranslationSubcase');
    cy.get(publication.translationReceivedPanel.panel).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.get(publication.publicationNav.publishpreview).click();
    cy.get(publication.proofsIndex.newRequest).click();
    cy.get(publication.proofRequest.save).click();
    cy.get(publication.publicationNav.translations).click();
    cy.get(publication.translationReceivedPanel.panel).find(publication.documentsList.piece)
      .find(publication.documentsList.deletePiece)
      .should('not.exist');

    // check proofs docs removable
    cy.get(publication.publicationNav.publishpreview).click();
    cy.get(publication.proofsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/publication-subcases/**').as('patchPublicationSubcase');
    cy.get(publication.proofUpload.save).click()
      .wait('@patchPublicationSubcase');
    cy.get(auk.loader).should('not.exist');
    // TODO-waits no wait here causes error: "Attempted to handle event pushedData on <file:62bb06485718d2000e000032> while in state root.deleted.inFlight."
    cy.wait(2000);
    cy.get(publication.proofReceivedPanel.panel).find(publication.documentsList.piece)
      .should('have.length', 1);
    cy.intercept('PATCH', '/proofing-activities/**').as('patchproofingActivities');
    cy.get(publication.documentsList.deletePiece).click()
      .wait('@patchproofingActivities');
    cy.get(publication.proofsIndex.panelBody).find(publication.proofReceivedPanel.panel)
      .should('not.exist');

    // check proof request docs not inherited in publication request
    cy.get(publication.proofsIndex.upload).click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    cy.intercept('PATCH', '/publication-subcases/**').as('patchPublicationSubcase2');
    cy.get(publication.proofUpload.save).click()
      .wait('@patchPublicationSubcase2');
    cy.get(auk.loader).should('not.exist');
    //  TODO-waits no wait here causes publication request modal to close before cypress is able to click save
    cy.wait(2000);
    cy.get(publication.proofReceivedPanel.dropdown).click();
    cy.get(publication.proofReceivedPanel.publicationRequest).click();
    cy.get(publication.publicationRequest.body).find(publication.documentsList.piece)
      .should('have.length', 1)
      // TODO can't make filename unique, needs a way to ensure this is checking for the correct file to be inherited
      .contains(file.fileName);
    cy.intercept('PATCH', '/publication-subcases/**').as('patchPublicationSubcase2');
    cy.get(publication.publicationRequest.save).click()
      .wait('@patchPublicationSubcase2');
    cy.get(auk.loader).should('not.exist');
    cy.wait(2000);

    // check proofs docs not removable once used in publication request
    cy.get(publication.publicationNav.publishpreview).click();
    cy.get(publication.proofReceivedPanel.panel).find(publication.documentsList.piece)
      .find(publication.documentsList.deletePiece)
      .should('not.exist');

    // check publication registration updates correctly
    cy.get(publication.statusPill.contentLabel).contains(previousStatus);
    cy.get(publication.publicationNav.publications).click();
    cy.get(publication.publicationActivities.register).click();
    cy.intercept('PATCH', '/publication-flows/**').as('patchPublicationFlow');
    cy.intercept('Delete', '/publication-status-changes/**').as('deleteStatus');
    cy.get(publication.publicationRegistration.save).click()
      .wait('@patchPublicationFlow')
      .wait('@deleteStatus');
    cy.get(auk.loader).should('not.exist');
    cy.get(publication.publicationsInfoPanel.view.publicationDate).contains(today);
    cy.get(publication.statusPill.contentLabel).contains(endStatus);
  });
});
