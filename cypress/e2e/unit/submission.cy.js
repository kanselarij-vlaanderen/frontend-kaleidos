/* global context, it, cy, Cypress, afterEach */

// / <reference types="Cypress" />
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
// import agenda from '../../selectors/agenda.selectors';
// import publication from '../../selectors/publication.selectors';
// import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
import settings from '../../selectors/settings.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
// import signature from '../../selectors/signature.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';
import submissions from '../../selectors/submission.selectors';

import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

afterEach(() => {
  cy.logout();
});

// const agendaDate = Cypress.dayjs().add(4, 'weeks').day(1); // anything but day 4
const agendaDate = Cypress.dayjs('2024-09-13');

const linkedMandatee = {
  // the second active mandatee will be our linked mandatee
  mandatee: mandateeNames.current.second, // might not be needed, depends what we want to check
  fullName: mandateeNames.current.second.fullName,
  submitter: true,
};

context.skip('setup emails and mandatees', () => {
  it('add one minister to dossierbeheerder', () => {
    cy.login('Admin');
    // setup: add minister to dossierbeheerder
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    cy.get(settings.organization.technicalInfo.showSelectMandateeModal).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should(
      'not.exist'
    );
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should(
      'not.exist'
    );
    cy.get(dependency.emberPowerSelect.option)
      .contains(linkedMandatee.fullName)
      .scrollIntoView()
      .click();
    cy.intercept('PATCH', '/user-organizations/**').as(
      'patchUserOrganizations'
    );
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');
  });
});

// create Agenda for all? multiple agendas (1 of each type)? the list in the modal will be massive already

context('Submission happy flows', () => {
  const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
  const agendaTypeNota = 'Nota';
  const mandatee1 = {
    fullName: mandateeNames.current.first.fullName,
    submitter: false,
  };
  const mandatee3 = {
    fullName: mandateeNames.current.third.fullName,
    submitter: false,
  };
  const extraMandatees = [mandatee1, mandatee3];
  const domain1 = {
    name: 'Cultuur, Jeugd, Sport en Media',
    selected: true,
    fields: [],
  };
  const domain2 = {
    name: 'Economie, Wetenschap en Innovatie',
    selected: false,
    fields: ['Wetenschappelijk onderzoek', 'Innovatie'],
  };
  const domains = [domain1, domain2];
  const files1 = [
    {
      folder: 'files',
      fileName: 'test onderwerp-1-nota',
      fileExtension: 'pdf',
      newFileName: 'submission 1 nota doc',
      fileTypeLong: 'Nota',
      fileTypeParsed: true,
    },
    {
      folder: 'files',
      fileName: 'test onderwerp-2-BVR',
      fileExtension: 'pdf',
      newFileName: 'submission 1 BVR doc',
      fileTypeLong: 'Besluit Vlaamse Regering',
      fileTypeParsed: true,
    }
  ];

  const submission1 = {
    agendaitemType: agendaTypeNota,
    confidential: true,
    shortTitle: `Submission short title 1 - ${currentTimestamp()}`,
    // shortTitle: 'Submission short title 1 - 1725549896',
    longTitle: `Submission long title 1 - ${currentTimestamp()}`, // wont be set
    subcaseType: 'principiële goedkeuring',
    subcaseName: 'Principiële goedkeuring m.h.o. op adviesaanvraag', // wont be set
    mandatees: extraMandatees,
    domains: domains,
    approvers: ['KC.1@test.com'],
    approversComment: 'aanvullende voor de secretarie',
    notified: ['IKW.1@test.com'],
    notifiedComment: 'aanvullende voor de IKW-group',
    documents: files1,
    agendaDate: agendaDateFormatted,
    comment: 'Interne opmerking voor de secretarie',
  };

  it.only('Submission create new from index', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/dossiers?aantal=2');

    cy.createSubmission(submission1).then((result) => {
      cy.url().should('contain', `/indieningen/${result.submissionId}`);
      cy.url().should('not.contain', '/dossiers/nieuwe-indiening');
    });
    // cy.visit('dossiers/indieningen/66D9CD52A93F3B61CE08A187');
    // overview header, case title is the submission short title
    cy.get(submissions.overviewHeader.titleContainer).contains(
      submission1.shortTitle
    );
    cy.get(submissions.overviewHeader.caseLink).should('not.exist');

    // header
    cy.get(submissions.submissionHeader.actions).should('not.exist');
    cy.get(submissions.submissionHeader.requestSendBack);
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');

    // description
    cy.get(submissions.descriptionView.edit).should('not.exist');
    cy.get(submissions.descriptionView.shortTitle).contains(
      submission1.shortTitle
    );
    cy.get(submissions.descriptionView.agendaitemTypePill).contains(
      submission1.agendaitemType
    );
    cy.get(submissions.descriptionView.confidentialityPill);
    cy.get(submissions.descriptionView.title).should('not.exist');
    cy.get(submissions.descriptionView.subcaseType).contains(
      submission1.subcaseType
    );
    cy.get(submissions.descriptionView.subcaseName).should('not.exist');

    // mandatees
    cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 3, {
      timeout: 5000,
    });
    cy.get('@listItems')
      .eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandatee1.fullName);
    cy.get('@listItems')
      .eq(1)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', linkedMandatee.fullName);
    cy.get('@listItems')
      .eq(1)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');
    cy.get('@listItems')
      .eq(2)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandatee3.fullName);

    // governmentAreas
    cy.get(utils.governmentAreasPanel.edit).should('not.exist');
    cy.get(utils.governmentAreasPanel.rows).as('listItemsAreas');
    cy.get('@listItemsAreas').should('have.length', 2, {
      timeout: 5000,
    });
    cy.get('@listItemsAreas')
      .eq(0)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain1.name);
    cy.get('@listItemsAreas')
      .eq(0)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', '-');
    cy.get('@listItemsAreas')
      .eq(1)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', domain2.name);
    cy.get('@listItemsAreas')
      .eq(1)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', domain2.fields[(0, 1)]);

    // emails
    cy.get(submissions.notificationsPanel.edit).should('not.exist');
    cy.get(submissions.notificationsPanel.approvers.item).as(
      'listItemsApprovers'
    );
    cy.get('@listItemsApprovers').should('have.length.at.least', 1); // we added 1, more could be possible with settings
    cy.get(submissions.notificationsPanel.approvers.item).contains(
      submission1.approvers[0]
    );
    cy.get(submissions.notificationsPanel.approvers.remove).should('not.exist');
    cy.get(submissions.notificationsPanel.approvers.comment).contains(
      submission1.approversComment
    );
    cy.get(submissions.notificationsPanel.notification.item).as(
      'listItemsNotified'
    );
    cy.get('@listItemsApprovers').should('have.length.at.least', 1); // we added 1, more could be possible with settings
    cy.get(submissions.notificationsPanel.notification.item).contains(
      submission1.notified[0]
    );
    cy.get(submissions.notificationsPanel.notification.remove).should(
      'not.exist'
    );
    cy.get(submissions.notificationsPanel.notification.comment).contains(
      submission1.notifiedComment
    );

    // documents
    cy.get(route.submission.documents.panel);
    cy.get(route.submission.documents.batchEdit).should('not.exist');
    cy.get(route.submission.documents.add).should('not.exist');
    cy.get(document.draftDocumentCard.card).should('have.length', 2);
    cy.get(document.draftDocumentCard.card).eq(0)
      .as('doc1');
    cy.get('@doc1')
      .find(document.draftDocumentCard.actions)
      .should('not.exist');
    cy.get('@doc1')
      .find(document.draftDocumentCard.versionHistory)
      .should('not.exist');
    cy.get('@doc1')
      .find(document.draftDocumentCard.name.value)
      .contains(submission1.documents[0].newFileName);
    cy.get('@doc1')
      .find(document.draftDocumentCard.type)
      .contains(submission1.documents[0].fileTypeLong);
    cy.get('@doc1')
      .find(document.accessLevelPill.pill)
      .contains('Vertrouwelijk');
    cy.get(document.draftDocumentCard.card).eq(1)
      .as('doc2');
    cy.get('@doc2')
      .find(document.draftDocumentCard.actions)
      .should('not.exist');
    cy.get('@doc2')
      .find(document.draftDocumentCard.versionHistory)
      .should('not.exist');
    cy.get('@doc2')
      .find(document.draftDocumentCard.name.value)
      .contains(submission1.documents[1].newFileName);
    cy.get('@doc2')
      .find(document.draftDocumentCard.type)
      .contains(submission1.documents[1].fileTypeLong);
    cy.get('@doc2')
      .find(document.accessLevelPill.pill)
      .contains('Vertrouwelijk');

    // history panel
    cy.get(route.submission.history.panel);
    cy.get(submissions.statusChangeActivity.item).should('have.length', 1);
  });

  it('Submission create new from case', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/dossiers?aantal=2');
    cy.openCase('case 1 on released agenda', false);
    cy.get(cases.subcaseOverviewHeader.createSubmission).click();
    cy.url().should('contain', '/dossiers/');
    cy.url().should('contain', '/deeldossiers/nieuwe-indiening');
  });

  // needs an existing subcase with at least 1 submission
  it('Submission create update from subcase', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.url().should('contain', '/dossiers/');
    cy.url().should('contain', '/deeldossiers/');
    cy.url().should('contain', '/nieuwe-indiening');
  });
});
// commands:
// - create submission for new case?
// - create submission for existing case (open it first)?
// - both will require lots of params? all the emails and notifications?
// commands to open new submission then separate commands for eacht panel? makes it optional and more controllable?
// those commands could be reused on existing submissions to alter them.
// are the panels different components than the new-submission form fields? guessing so.

context.skip('cleanup mandatees from organisation', () => {
  it('remove mandatees from organisation', () => {
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    // unlink first mandatee
    cy.intercept('PATCH', '/user-organizations/**').as('patchorgs');
    cy.get(settings.organization.technicalInfo.row.unlinkMandatee)
      .eq(0)
      .click();
    cy.get(settings.organization.confirm.unlinkMandatee)
      .click()
      .wait('@patchorgs');
    // unlink second mandatee
    // cy.get(settings.organization.technicalInfo.row.unlinkMandatee).eq(0)
    //   .click();
    // cy.get(settings.organization.confirm.unlinkMandatee).click()
    //   .wait('@patchorgs');
    // cy.get(settings.organization.technicalInfo.row.mandatee).should('not.exist');
  });
});
