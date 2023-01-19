/* global context, it, cy, beforeEach, afterEach, Cypress, expect */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function selectConfidentialityLevel(docName, confLevel) {
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .find(document.accessLevelPill.edit)
    .click();
  cy.get(document.accessLevelPill.selector)
    .click();
  cy.selectFromDropdown(confLevel);
  // TODO randomint
  // cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
  cy.get(document.accessLevelPill.save).click();
  // cy.wait('@patchPieces10');
}

function checkConfidentialityLevel(docName, confLevel) {
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .find(document.accessLevelPill.pill)
    .contains(confLevel);
}

function getTranslatedMonth(month) {
  switch (month) {
    case 0:
      return 'januari';
    case 1:
      return 'februari';
    case 2:
      return 'maart';
    case 3:
      return 'april';
    case 4:
      return 'mei';
    case 5:
      return 'juni';
    case 6:
      return 'juli';
    case 7:
      return 'augustus';
    case 8:
      return 'september';
    case 9:
      return 'oktober';
    case 10:
      return 'november';
    case 11:
      return 'december';
    default:
      return '';
  }
}

context('Decision postponing tests', () => {
  const files = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota',
    },
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
    },
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-3', fileType: 'Decreet',
    },
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-4', fileType: 'Decreet',
    },
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-5', fileType: 'Decreet',
    }
  ];

  const files2 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-6', fileType: 'Nota',
    }
  ];

  const files3 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-7', fileType: 'Nota',
    }
  ];

  const files4 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-8', fileType: 'Nota',
    }
  ];

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('setup: create extra docs', () => {
    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c/documenten');
    cy.get(route.agendaitemDocuments.add).click();
    cy.addNewDocumentsInUploadModal(files, 'agendaitems');
    selectConfidentialityLevel(files[0].newFileName, 'Publiek');
    selectConfidentialityLevel(files[1].newFileName, 'Intern Secretarie');
    selectConfidentialityLevel(files[2].newFileName, 'Vertrouwelijk');
    selectConfidentialityLevel(files[3].newFileName, 'Intern Regering');
    selectConfidentialityLevel(files[4].newFileName, 'Intern Overheid');
  });

  it('should postpone an agendaitem and change the status of the treatment', () => {
    const spy = cy.spy();
    // const agendaDate = Cypress.dayjs('2022-04-17');
    const SubcaseTitleShort = 'Cypress test: Decision postponing - postpone agendaitem & decision - 1652780867';

    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');
    // TODO-bug, cypress cannot press button right after page load, getters are async and not awaited
    cy.wait(2000);
    // postpone agendaitem on agenda B
    cy.intercept('PATCH', '/decision-activities/**').as('patchActivity1');
    cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.postpone).forceClick();
    cy.wait('@patchActivity1');
    cy.wait('@patchPieces1');
    cy.get(auk.modal.container).should('not.exist');
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.postponed).should('have.length', 1);

    // check confidentiality level changes
    cy.get(agenda.agendaitemNav.documentsTab).click();
    checkConfidentialityLevel(files[0].newFileName, 'Intern Regering');
    // TODO this one don't change
    checkConfidentialityLevel(files[4].newFileName, 'Intern Regering');
    cy.get(agenda.agendaitemNav.caseTab).click();

    // advance agendaitem
    cy.intercept('PATCH', '/decision-activities/**').as('patchActivity2');
    cy.intercept('PATCH', '/pieces/**', spy).as('patchPieces1');
    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.postponeRevert).forceClick();
    cy.wait('@patchActivity2');
    cy.wait(2000)
      .then(() => expect(spy).not.to.have.been.called);
    cy.get(auk.modal.container).should('not.exist');
    cy.get(agenda.agendaDetailSidebar.subitem).should('have.length', 2);
    cy.get(agenda.agendaDetailSidebarItem.postponed).should('have.length', 0);

    // change decision result
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.url().should('contain', '/beslissingen');
    cy.intercept('PATCH', 'decision-activities/**').as('patchDecisionActivity');
    cy.get(agenda.decisionResultPill.edit).click();
    cy.get(agenda.agendaitemDecisionEdit.resultContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger).scrollIntoView()
        .click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Uitgesteld')
      .scrollIntoView()
      .click();
    cy.get(agenda.agendaitemDecisionEdit.save).click()
      .wait('@patchDecisionActivity');

    // check if the sidebar item is now greyed out because the decision is "postponed"
    cy.openDetailOfAgendaitem(SubcaseTitleShort);
    cy.get(agenda.agendaDetailSidebar.subitem).find(agenda.agendaDetailSidebarItem.postponed)
      .should('exist');
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(cases.subcaseDescription.panel).find(cases.subcaseTimeline.item)
      .as('phases');
    cy.get('@phases').eq(0)
      .contains(/Ingediend voor agendering op/);
    cy.get('@phases').eq(1)
      .contains(/Geagendeerd op de agenda van/);
    cy.get('@phases').eq(2)
      .contains(/Uitgesteld op de agenda van/);
    cy.get(auk.loader).should('not.exist');
  });

  it('should postpone an agendaitem', () => {
    const agendaDate = Cypress.dayjs().add(17, 'weeks');
    const monthDutch = getTranslatedMonth(agendaDate.month());
    const agendaDateFormatted = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;

    // add new doc (6) on subcase
    cy.visit('/dossiers/E14FB5B5-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/62836F4EACB8056AF8DE245B/documenten');
    cy.get(route.subcaseDocuments.add).click();
    cy.addNewDocumentsInUploadModal(files2, '');
    cy.wait(5000);
    // check all docs visible
    cy.get(document.documentCard.name.value).contains(files[0].newFileName);
    cy.get(document.documentCard.name.value).contains(files[1].newFileName);
    cy.get(document.documentCard.name.value).contains(files[2].newFileName);
    cy.get(document.documentCard.name.value).contains(files[3].newFileName);
    cy.get(document.documentCard.name.value).contains(files[4].newFileName);
    cy.get(document.documentCard.name.value).contains(files2[0].newFileName);

    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');
    cy.approveAndCloseDesignAgenda();
    cy.releaseDecisions();

    cy.createAgenda('Ministerraad', agendaDate);

    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');

    // check if doc 6 not visible on 1st agenda
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.card).should('not.exist');
    cy.get(agenda.agendaitemNav.caseTab).click();

    cy.get(agenda.agendaitemPostponed.repropose)
      .children(appuniversum.button)
      .click();
    cy.intercept('POST', '/submission-activities').as('postSubmissionActivities');
    cy.intercept('POST', '/agenda-activities').as('postAgendaActivities');
    cy.intercept('POST', '/decision-activities').as('postDecisionActivities');
    cy.intercept('POST', '/agenda-item-treatments').as('postAgendaItemTreatments');
    cy.intercept('PATCH', '/submission-activities/**').as('patchSubmissonActivities');
    cy.get(agenda.agendaitemPostponed.proposableMeeting)
      .contains(agendaDateFormatted)
      .forceClick()
      .wait('@postSubmissionActivities')
      .wait('@postAgendaActivities')
      .wait('@postDecisionActivities')
      .wait('@postAgendaItemTreatments')
      .wait('@patchSubmissonActivities');
    cy.get(auk.loader).should('not.exist');

    // click link to latest meeting
    cy.get(agenda.agendaitemPostponed.latestMeeting).contains(agendaDateFormatted)
      .click();
    cy.get(agenda.agendaHeader.title).contains(agendaDateFormatted);
    cy.get(auk.loader).should('not.exist');

    // check if all docs visible on 2nd agenda
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.name.value).contains(files[0].newFileName);
    cy.get(document.documentCard.name.value).contains(files[1].newFileName);
    cy.get(document.documentCard.name.value).contains(files[2].newFileName);
    cy.get(document.documentCard.name.value).contains(files[3].newFileName);
    cy.get(document.documentCard.name.value).contains(files[4].newFileName);
    cy.get(document.documentCard.name.value).contains(files2[0].newFileName);
    cy.get(agenda.agendaitemNav.caseTab).click();

    // click link to subcase
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(auk.loader).should('not.exist');

    // check if timeline contains multiple phase blocks (1 block has max 3 phases)
    cy.get(cases.subcaseTimeline.item).eq(0)
      .contains('Ingediend voor');
    cy.get(cases.subcaseTimeline.item).eq(3)
      .contains('Ingediend voor');

    // check if meeting number contains multiple numbers
    cy.get(cases.subcaseDescription.meetingNumber).contains(/\d+, \d+/);

    // check for multiple agenda links
    cy.get(cases.subcaseDescription.agendaLink).should('have.length', 2);

    // check if decided on
    cy.get(cases.subcaseDescription.decidedOn).contains('Nog niet beslist');

    // check if planned start is last agenda
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(`Ingediend voor de agenda van ${agendaDateFormatted}`);

    // add new doc (7)
    cy.get(cases.subcaseDetailNav.documents).click();
    cy.get(route.subcaseDocuments.add).click();
    cy.intercept('PATCH', '/agendaitems/**').as('patchAgendaItems');
    cy.addNewDocumentsInUploadModal(files3, '');
    // check if doc 7 shows on subcase
    cy.wait('@patchAgendaItems');
    cy.get(utils.vlModal.container).should('not.exist');
    cy.wait(5000);
    cy.get(document.documentCard.name.value).contains(files3[0].newFileName);

    // check if doc 7 shows on 2nd agenda
    cy.get(cases.subcaseDetailNav.overview).click();
    cy.get(cases.subcaseDescription.agendaLink).contains(agendaDateFormatted)
      .click();
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.name.value).contains(files3[0].newFileName);

    // check that doc 7 doesn't show on 1st agenda
    cy.visitAgendaWithLink('/vergadering/62836F5EACB8056AF8DE245C/agenda/a1263780-d5c6-11ec-b7f8-f376c007230c/agendapunten/a148b3a0-d5c6-11ec-b7f8-f376c007230c');
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.name.value).should('not.exist');
    // add new doc (8) on 1st agenda
    cy.get(route.agendaitemDocuments.add).click();
    cy.get(auk.modal.footer.confirm).click();
    cy.addNewDocumentsInUploadModal(files4, 'agendaitems');

    // check that doc 8 doesn't show on subcase
    cy.get(agenda.agendaitemNav.caseTab).click();
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(cases.subcaseDetailNav.documents).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.name.value).should('not.contain', files4[0].newFileName);

    // check if doc 8 shows on 2nd agenda
    cy.get(cases.subcaseDetailNav.overview).click();
    cy.get(cases.subcaseDescription.agendaLink).contains(agendaDateFormatted)
      .click();
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(document.documentCard.name.value).should('not.contain', files4[0].newFileName);
  });
});
