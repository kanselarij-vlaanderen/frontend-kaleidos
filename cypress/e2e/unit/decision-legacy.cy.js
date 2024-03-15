/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';

context('Decision tests pre digital agenda', () => {
  const accessGovernment = 'Intern Overheid';
  const accessCabinet = 'Intern Regering';
  const accessConfidential = 'Vertrouwelijk';
  const decisionNotSet = 'Nog geen beslissing ingesteld';
  const decisionAcknowledged = 'Akte genomen';
  const decisionApproved = 'Goedgekeurd';
  const decisionPostponed = 'Uitgesteld';
  const decisionRetracted = 'Ingetrokken';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test the document CRUD for a decision', () => {
    // const agendaDate = Cypress.dayjs('2022-04-16');
    // const SubcaseTitleShort = 'Cypress test: Decision documents - CRUD of documents on decision - 1652780748';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    cy.visitAgendaWithLink('/vergadering/62836EFDACB8056AF8DE2451/agenda/62836EFDACB8056AF8DE2452/agendapunten/62836F24ACB8056AF8DE2459/beslissingen');
    // Add document to treatment but delete and reupload in the upload modal before saving
    cy.addDocumentToTreatment(file, false);
    cy.intercept('DELETE', 'files/*').as('deleteFile');
    cy.get(document.vlUploadedDocument.deletePiece).click();
    cy.wait('@deleteFile');

    cy.get(document.vlUploadedDocument.filename).should('not.exist');

    cy.get(auk.auModal.container).within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);
    });

    cy.intercept('POST', 'reports').as('createNewReport');
    cy.intercept('POST', 'document-containers').as('createNewDocumentContainer');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    cy.intercept('DELETE', 'reports/*').as('deleteReport');
    cy.intercept('DELETE', 'document-containers/*').as('deleteDocumentContainer');
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@createNewReport');
    cy.wait('@createNewDocumentContainer');
    cy.wait('@patchDecisionActivities');

    cy.get(document.documentCard.card).as('docCards');
    cy.get('@docCards').should('have.length', 1);
    cy.get(appuniversum.loader).should('not.exist');

    // correct default access rights on non-confidential subcase should be "Intern Overheid"
    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    cy.addNewPieceToDecision('test', file);
    cy.get(document.documentCard.name.value).eq(0)
      .contains(/BIS/);

    // check version history accesslevel
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();

    // Delete the TER piece, the BIS should then become the report
    // TODO, TER is not deleted anymore?
    cy.addNewPieceToDecision('test', file);
    cy.get('@docCards').should('have.length', 1);
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/TER/);
        cy.get(document.documentCard.versionHistory)
          .find(auk.accordion.header.button)
          .should('not.be.disabled')
          .click();
        cy.get(document.vlDocument.piece).should('have.length', 2);
      });

    // check version history acceslevel
    cy.get(document.vlDocument.piece).as('pieces');
    cy.get('@pieces').eq(0)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);
    cy.get('@pieces').eq(1)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();

    // Delete the document-container + all pieces
    cy.get('@docCards').eq(0)
      .within(() => {
        cy.get(document.documentCard.name.value).contains(/TER/);
        cy.get(document.documentCard.actions)
          .should('not.be.disabled')
          .children(appuniversum.button)
          .click();
        cy.get(document.documentCard.delete).forceClick();
      });
    cy.get(auk.confirmationModal.footer.confirm).contains('Verwijderen')
      .click();
    cy.wait('@deleteFile');
    cy.wait('@deleteReport');
    cy.wait('@deleteDocumentContainer');

    cy.get(agenda.agendaitemDecision.uploadFile);
    cy.get(document.documentCard.card).should('have.length', 0);
  });

  it('should test the decision CRUD', () => {
    const agendaDate = Cypress.dayjs('2022-04-19').hour(10);
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };
    const decisionTypes = [
      decisionAcknowledged,
      decisionApproved,
      decisionPostponed,
      decisionRetracted
    ];

    const subcaseTitleShortNote = 'Cypress test: Decision - CRUD of decisions - Nota - 1652789865';
    const subcaseTitleShortMed = 'Cypress test: Decision - CRUD of decisions - Mededeling - 1652789865';

    cy.createAgenda(null, agendaDate, 'Decision spec legacy').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
    });
    cy.addAgendaitemToAgenda(subcaseTitleShortNote);
    cy.addAgendaitemToAgenda(subcaseTitleShortMed);

    // setup case with 2 subcases: nota, med

    // check the default desicion result
    cy.openDetailOfAgendaitem(subcaseTitleShortMed);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    // check the default of an announcement agendaitem
    cy.get(agenda.decisionResultPill.pill).contains(decisionAcknowledged);
    // check default of the approval agendaitem
    cy.intercept('get', '/decision-activities?filter**').as('loadDecisionActivity_1');
    cy.get(agenda.agendaDetailSidebar.subitem).eq(0)
      .click();
    cy.wait('@loadDecisionActivity_1');
    cy.get(agenda.decisionResultPill.pill).contains(decisionNotSet);
    // check the default of a note agendaitem
    cy.intercept('get', '/decision-activities?filter**').as('loadDecisionActivity_2');
    cy.get(agenda.agendaDetailSidebar.subitem).eq(1)
      .click();
    cy.wait('@loadDecisionActivity_2');
    cy.get(agenda.decisionResultPill.pill).contains(decisionNotSet);

    // CRUD of decisions
    // add report ("beslissingsfiche") to existing pre-generated decision-activity of note
    cy.addDocumentToTreatment(file);
    cy.get(agenda.decisionResultPill.pill).contains(decisionApproved);

    decisionTypes.forEach((type) => {
      cy.get(agenda.decisionResultPill.edit)
        .click();
      cy.get(dependency.emberPowerSelect.trigger).click();
      cy.get(dependency.emberPowerSelect.option).contains(type)
        .click();
      const randomInt = Math.floor(Math.random() * Math.floor(10000));
      cy.intercept('PATCH', 'decision-activities/**').as(`patchDecisionActivities_${randomInt}`);
      cy.get(agenda.agendaitemDecisionEdit.save).click();
      cy.wait(`@patchDecisionActivities_${randomInt}`);
      cy.get(agenda.decisionResultPill.pill).contains(type);
    });
  });

  it('should test if changing subcase to confidential sets correct access rights', () => {
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.visit('/dossiers/E14FB58C-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/6283927B7A5496079478E276');
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    // set subcase to confidential
    cy.visit('/dossiers/E14FB58C-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/6283927B7A5496079478E276');
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases1');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems1');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda1');
    cy.intercept('PATCH', '/reports/*').as('patchReport1');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases1')
      .wait('@patchagendaitems1')
      .wait('@patchAgenda1')
      .wait('@patchReport1');

    // check document confidentiality
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // revert subcase confidentiality
    cy.visit('/dossiers/E14FB58C-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/6283927B7A5496079478E276');
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases2');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems2');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda2');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases2')
      .wait('@patchagendaitems2')
      .wait('@patchAgenda2');

    // decision should stay confidential
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // switch decision to intern overheid
    cy.get(document.documentCard.card).within(() => {
      cy.get(document.accessLevelPill.edit).click();
      cy.get(dependency.emberPowerSelect.trigger).click();
    });
    cy.get(dependency.emberPowerSelect.option).contains(accessGovernment)
      .click();
    cy.intercept('PATCH', '/reports/*').as('patchReport');
    cy.get(document.accessLevelPill.save).click();
    cy.wait('@patchReport');

    // add BIS
    cy.addNewPieceToDecision('test', file);

    cy.get(document.accessLevelPill.pill).contains(accessGovernment);

    // check previous version has default acces level (Intern Regering)
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.name).contains(file.fileName)
      .parents(document.vlDocument.piece)
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet);

    // set subcase to confidential again
    cy.visit('/dossiers/E14FB58C-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/6283927B7A5496079478E276');
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases3');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems3');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda3');
    cy.intercept('PATCH', '/reports/*').as('patchReport3');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases3')
      .wait('@patchagendaitems3')
      .wait('@patchAgenda3')
      .wait('@patchReport3');

    // check decision acceslevel
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // check previous version has updated level (Vertrouwelijk)
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.name).contains(file.fileName)
      .parents(document.vlDocument.piece)
      .find(document.accessLevelPill.pill)
      .contains(accessConfidential);
  });

  it('should test if adding decision to confidential subcase sets correct default access rights', () => {
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    };

    cy.visit('dossiers/E14FB58C-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/628392827A5496079478E277');
    cy.get(cases.subcaseDescription.edit).click();
    cy.get(cases.subcaseDescriptionEdit.confidential)
      .parent()
      .click();
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases');
    cy.intercept('PATCH', '/agendaitems/*').as('patchagendaitems');
    cy.intercept('PATCH', '/agendas/*').as('patchAgenda');
    cy.get(cases.subcaseDescriptionEdit.actions.save).click()
      .wait('@patchSubcases')
      .wait('@patchagendaitems')
      .wait('@patchAgenda');
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.addDocumentToTreatment(file);
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // add BIS
    cy.addNewPieceToDecision('test', file);

    cy.get(document.accessLevelPill.pill).contains(accessConfidential);

    // check previous version has correct acces level (Vertrouwelijk)
    cy.get(document.documentCard.versionHistory)
      .find(auk.accordion.header.button)
      .should('not.be.disabled')
      .click();
    cy.get(document.vlDocument.name).contains(file.fileName)
      .parents(document.vlDocument.piece)
      .find(document.accessLevelPill.pill)
      .contains(accessConfidential);
  });
});
