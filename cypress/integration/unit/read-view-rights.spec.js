/* global context, it, cy, Cypress, before, beforeEach */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import document from '../../selectors/document.selectors';
import dependency from '../../selectors/dependency.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import publication from '../../selectors/publication.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

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

context('Testing editor or viewer rights', () => {
  const agendaDate = Cypress.dayjs().add(1, 'weeks')
    .day(5);
  const agendaDateClosed = Cypress.dayjs().add(1, 'weeks')
    .day(6);
  const agendaDateReleased = Cypress.dayjs().add(1, 'weeks')
    .day(7);
  const subcaseTitleShort1 = 'Cypress test: add subcaseNoDecisionDocs';
  const subcaseTitleShort2 = 'Cypress test: add subcase WithDecisionDocs';
  const subcaseTitleShort3 = 'Cypress test: add subcase for decision only no decision docs';
  const subcaseTitleShort4 = 'Cypress test: add subcase for decision only with decision docs';
  const kind = 'Ministerraad';
  const fileName = 'VR 2020 1212 DOC.0001-1';
  const file = {
    folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
  };
  const caseTitle = 'cypress test: submission activities';
  const caseTitle2 = 'cypress test: submission activities new title';
  const caseTitle3 = 'cypress test: release decisions and docs';
  const caseTitle4 = 'cypress test: release decisions and docs 2';
  const pubNumber = 9521;
  const text = 'cypress test: kort bestek';
  const theme = 'Armoedebestrijding';

  function setAccesLevel(docName, accesLevel) {
    cy.get(document.documentCard.name.value).contains(docName)
      .parents(document.documentCard.card)
      .find(document.accessLevelPill.edit)
      .click();
    cy.get(document.documentCard.name.value).contains(docName)
      .parents(document.documentCard.card)
      .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(accesLevel)
      .click();
    cy.get(document.accessLevelPill.save).click();
  }

  before(() => {
    // setup
    cy.login('Admin');

    // 4 cases with 1 subcase for our agendas
    cy.createCase(caseTitle);
    cy.addSubcase(null, subcaseTitleShort1);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase([
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-2', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-3', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-4', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-5', fileType: 'Nota',
      }
    ]);
    cy.createCase(caseTitle2);
    cy.addSubcase(null, subcaseTitleShort2);

    cy.createCase(caseTitle3);
    cy.addSubcase(null, subcaseTitleShort3);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase([
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-2', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-3', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-4', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-5', fileType: 'Nota',
      }
    ]);
    // TODO flakey setup?
    cy.createCase(caseTitle4);
    cy.addSubcase(null, subcaseTitleShort4);

    // first agenda with docs set to every acces level, a publication and a decision doc
    cy.createAgenda(kind, agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.addAgendaitemToAgenda(subcaseTitleShort2);

    cy.openAgendaitemDocumentTab(subcaseTitleShort1);
    cy.addNewPiece('VR 2020 1212 DOC.0001-1', file, 'agendaitems');
    setAccesLevel('VR 2020 1212 DOC.0001-1', 'Publiek');
    setAccesLevel('VR 2020 1212 DOC.0001-2', 'Intern Overheid');
    setAccesLevel('VR 2020 1212 DOC.0001-3', 'Intern Regering');
    setAccesLevel('VR 2020 1212 DOC.0001-4', 'Intern Secretarie');
    setAccesLevel('VR 2020 1212 DOC.0001-5', 'Vertrouwelijk');
    cy.get(route.agendaitemDocuments.openPublication).click();
    cy.get(publication.batchDocumentsPublicationRow.name).contains('VR 2020 1212 DOC.0001-1')
      .parent()
      .find(publication.batchDocumentsPublicationRow.new)
      .click();

    cy.get(publication.newPublication.number).click()
      .clear()
      .type(pubNumber);
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.intercept('PATCH', '/pieces/**').as('patchPieceForPublication');
    cy.get(publication.newPublication.create).click();
    cy.wait('@createNewPublicationFlow');
    cy.wait('@patchPieceForPublication');
    cy.get(auk.modal.header.close).click();

    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.agendaitemDecision.uploadFile).eq(0)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    cy.intercept('GET', 'pieces/*/previous-piece').as('getPreviousPiece');
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@createNewPiece');
    cy.wait('@patchDecisionActivities');
    cy.wait('@getPreviousPiece');
    cy.get(auk.loader).should('not.exist');

    cy.addNewPieceToDecision('test', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });

    cy.get(agenda.agendaitemNav.newsletterTab).click();
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    cy.get(newsletter.editItem.rdfaEditor).type(text);
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.toggleFinished).click();
    cy.intercept('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');

    cy.setAllItemsFormallyOk(3);
    cy.approveDesignAgenda();

    // second agenda just for agenda actions when closed
    cy.createAgenda(kind, agendaDateClosed);
    cy.openAgendaForDate(agendaDateClosed);
    cy.setAllItemsFormallyOk(0);
    cy.approveAndCloseDesignAgenda();

    // third agenda with released documents and decisions
    cy.createAgenda(kind, agendaDateReleased);
    cy.openAgendaForDate(agendaDateReleased);
    cy.addAgendaitemToAgenda(subcaseTitleShort3);
    cy.addAgendaitemToAgenda(subcaseTitleShort4);
    cy.openDetailOfAgendaitem(subcaseTitleShort4);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.agendaitemDecision.uploadFile).eq(0)
      .click();
    cy.uploadFile(file.folder, file.fileName, file.fileExtension, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    cy.intercept('POST', 'pieces').as('createNewPiece');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivities');
    cy.intercept('GET', 'pieces/*/previous-piece').as('getPreviousPiece');
    cy.get(utils.vlModalFooter.save).click();
    cy.wait('@createNewPiece');
    cy.wait('@patchDecisionActivities');
    cy.wait('@getPreviousPiece');
    cy.get(auk.loader).should('not.exist');

    cy.addNewPieceToDecision('test', {
      folder: 'files', fileName: 'test', fileExtension: 'pdf',
    });

    cy.get(agenda.agendaitemNav.newsletterTab).click();
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    cy.get(newsletter.editItem.rdfaEditor).type(text);
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.toggleFinished).click();
    cy.intercept('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');

    cy.setAllItemsFormallyOk(3);
    cy.approveAndCloseDesignAgenda();

    cy.releaseDecisions();
    cy.releaseDocuments();
  });

  context('editor rights checks', () => {
    beforeEach(() => {
      cy.login('Admin');
    });

    it('check create agenda', () => {
      cy.get(route.agendas.action.newMeeting);
    });

    it('check agenda route', () => {
      cy.openAgendaForDate(agendaDate);

      cy.get(agenda.agendaTabs.tabs).contains('Overzicht');
      cy.get(agenda.agendaTabs.tabs).contains('Detail');
      cy.get(agenda.agendaTabs.tabs).contains('Vergelijk');
      cy.get(agenda.agendaTabs.tabs).contains('Documenten');
      // TODO agenda actions
      cy.get(agenda.agendaVersionActions.showOptions);
      cy.get(agenda.agendaitemSearch.input);
      cy.get(agenda.agendaActions.showOptions).click();

      cy.get(agenda.agendaActions.navigateToDecisions);
      cy.get(agenda.agendaActions.navigateToNewsletter);
      cy.get(agenda.agendaActions.navigateToPrintablePressAgenda);
      cy.get(agenda.agendaActions.navigateToPrintableAgenda);
      cy.get(agenda.agendaActions.downloadDocuments);
      cy.get(agenda.agendaActions.toggleEditingMeeting);
      cy.get(agenda.agendaActions.approveAllAgendaitems);

      cy.openAgendaForDate(agendaDateClosed);
      cy.get(agenda.agendaActions.showOptions).click();
      cy.get(agenda.agendaActions.releaseDecisions);
      cy.get(agenda.agendaActions.releaseDocuments);
    });

    it('check agenda overview', () => {
      cy.openAgendaForDate(agendaDate);
      cy.get(agenda.agendaOverview.showChanges);
      cy.get(agenda.agendaOverview.formallyOkEdit);
    });

    it('check agenda detail overview', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemControls.actions);

      cy.get(agenda.agendaitemTitlesView.linkToSubcase);

      cy.get(agenda.agendaitemTitlesView.edit);
      cy.get(mandatee.mandateePanelView.actions.edit);
      cy.get(utils.governmentAreasPanel.edit);
    });

    it('check agenda detail documents', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openAgendaitemDocumentTab(subcaseTitleShort1);
      cy.get(auk.loader).should('not.exist');

      cy.get(route.agendaitemDocuments.batchEdit);
      cy.get(route.agendaitemDocuments.openPublication);

      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.pubLink);
      cy.get(document.documentCard.actions).eq(0)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory);
      // TODO acces level knop in history
    });

    it('check agenda detail decisions', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(auk.loader).should('not.exist');

      cy.get(agenda.decisionResultPill.pill);
      cy.get(agenda.decisionResultPill.edit);

      cy.get(agenda.agendaitemDecision.uploadFile);

      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.decisionTab).click();
      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);

      cy.get(document.documentCard.actions).click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);

      cy.get(document.documentCard.versionHistory);
    });

    it('check agenda detail newsletter', () => {
      cy.openAgendaForDate(agendaDate);

      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.newsletterTab).click();
      cy.get(newsletter.newsItem.create);

      cy.openDetailOfAgendaitem(subcaseTitleShort2);
      cy.get(agenda.agendaitemNav.newsletterTab).click();

      cy.get(newsletter.newsItem.fullscreenEdit);
      cy.get(newsletter.newsItem.edit);

      // TODO via adres naar kort bestek
      // cy.visit('vergadering/kort-bestek')
      // TODO ook beslissingen en persagenda
    });

    it('check agenda detail pressagenda', () => {
      cy.openAgendaForDate(agendaDate);
      cy.openDetailOfAgendaitem(subcaseTitleShort1);
      cy.get(agenda.agendaitemNav.pressagendaTab).click();
      cy.get(agenda.agendaitemPress.edit);
    });

    it('check agenda vergelijk', () => {
      // bestaande agendas, 2 agendas selecteren
      cy.visit('vergadering/627E638F896D8E189787BAF7/agenda/046d3960-d2c5-11ec-bc63-419d8e010fd1/vergelijken');
      cy.get(agenda.compareAgenda.agendaLeft).click();
      selectFromDropdown('Agenda A');
      cy.get(auk.loader).should('not.exist');

      cy.get(agenda.compareAgenda.agendaRight).click();
      selectFromDropdown('Ontwerpagenda B');
      cy.get(auk.loader).should('not.exist');

      cy.get(agenda.compareAgenda.agendaitemLeft);
      cy.get(agenda.compareAgenda.agendaitemRight);
    });

    it('check agenda documents', () => {
      // TODO setup (addDocuments always present, no agenda without docs necessary?)
      cy.visit('vergadering/627E638F896D8E189787BAF7/agenda/046d3960-d2c5-11ec-bc63-419d8e010fd1/documenten');
      cy.get(route.agendaDocuments.addDocuments);

      cy.get(document.accessLevelPill.pill);
      cy.get(document.accessLevelPill.edit);
      cy.get(document.documentCard.actions).eq(0)
        .click();
      cy.get(document.documentCard.uploadPiece);
      cy.get(document.documentCard.editPiece);
      cy.get(document.documentCard.delete);
      cy.get(document.documentCard.versionHistory).click();

      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.pill);
      cy.get(document.vlDocument.piece)
        .find(document.accessLevelPill.edit);
    });
  });

  context('viewer rights checks', () => {
    beforeEach(() => {
      cy.login('Minister');
    });

    it('check create agenda doesnt exist', () => {
      cy.get(route.agendasOverview.filter.container);
      cy.get(route.agendas.action.newMeeting).should('not.exist');
    });
  });
});
