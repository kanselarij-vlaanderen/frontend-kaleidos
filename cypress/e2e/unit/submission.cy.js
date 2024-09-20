/* global context, it, cy, Cypress, before, afterEach */

// / <reference types="Cypress" />
// import cases from '../../selectors/case.selectors';
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

// TODO-submission test sending back, request sending back, removing, sending back when on agenda
// TODO-submission more profile testing, who can see what when.
// TODO-submission all update submission testing
// TODO-submission change mandatee to co-mandatee and check actions
// TODO-submission change mandatee to not a co-mandatee and check actions

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

const agendaDate = Cypress.dayjs().add(4, 'weeks')
  .day(1); // anything but day 4
// const agendaDate = Cypress.dayjs('2024-09-13');

const linkedMandatee = {
  // the second active mandatee will be our linked mandatee
  mandatee: mandateeNames.current.second, // might not be needed, depends what we want to check
  fullName: mandateeNames.current.second.fullName,
  submitter: true,
};

before(() => {
  cy.login('Admin');
  // cy.createAgenda(null, agendaDate, 'indieningen kabinet');
  cy.logoutFlow();
});

context.skip('setup emails and mandatees', () => {
  afterEach(() => {
    cy.logout();
  });

  it('add one mandatee to dossierbeheerder', () => {
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

  it('set email setting defaults', () => {
    cy.login('Admin');
    cy.get(utils.mHeader.settings).click();
    cy.get(settings.overview.manageEmails).click();
    cy.get(settings.email.publication.requestTo).click()
      .clear()
      .type('johan.delaure@redpencil.io');
    cy.get(settings.email.submission.toSecretary).click()
      .clear()
      .type('johan.delaure+sec@redpencil.io');
    cy.get(settings.email.submission.toIKW).click()
      .clear()
      .type('johan.delaure+ikw@redpencil.io');
    cy.get(settings.email.submission.toKCGroup).click()
      .clear()
      .type('johan.delaure+KC@redpencil.io');
    cy.get(settings.email.submission.replyTo).click()
      .clear()
      .type('johan.delaure+replyTo@redpencil.io');
    cy.intercept('PATCH', '/email-notification-settings/**')
      .as('patchEmailSettings');
    cy.get(settings.email.save).click();
    cy.wait('@patchEmailSettings');
  });
});

// create Agenda for all? multiple agendas (1 of each type)? the list in the modal will be massive already

context.skip('Submission happy flows', () => {
  afterEach(() => {
    cy.logout();
  });

  const accessCabinet = 'Intern Regering';
  const accessConfidential = 'Vertrouwelijk';
  const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
  const agendaTypeNota = 'Nota';
  // const agendaTypeAnnouncement = 'Mededeling';
  const mandatee1 = {
    fullName: mandateeNames.current.first.fullName,
    submitter: false,
  };
  const mandatee3 = {
    fullName: mandateeNames.current.third.fullName,
    submitter: false,
  };
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
  const files2 = files1;
  files2[0].newFileName = 'submission 2 nota doc conf';
  files2[0].fileName = 'test onderwerp-1-nota-vertrouwelijk';
  files2[1].newFileName = 'submission 2 BVR doc';

  // first submission for new case
  const submissionNewCaseShortTitle = `Submission new case short title 1 - ${currentTimestamp()}`;
  const submissionNewCase = {
    newCase: true,
    agendaitemType: agendaTypeNota,
    confidential: true,
    shortTitle: submissionNewCaseShortTitle,
    longTitle: `Submission new case long title 1 - ${currentTimestamp()}`, // wont be set initially
    subcaseType: 'principiële goedkeuring',
    subcaseName: 'Principiële goedkeuring m.h.o. op adviesaanvraag', // wont be set initially
    mandatees: [mandatee1, mandatee3],
    domains: [domain1, domain2],
    approvers: ['KC.1@test.com'],
    approversComment: 'aanvullende voor de secretarie',
    notified: ['IKW.1@test.com'],
    notifiedComment: 'aanvullende voor de IKW-groep',
    documents: files1,
    agendaDate: agendaDateFormatted,
    comment: 'Interne opmerking voor de secretarie',
  };

  // first submission for an existing case
  const submissionExistingCaseShortTitle = `Submission existing case short title 1 - ${currentTimestamp()}`;
  // const submissionExistingCaseShortTitle = 'Submission existing case short title 1 - 1725621062'
  const previousSubcaseInfo = {
    agendaitemType: agendaTypeNota,
    shortTitle: 'Cypress test: profile rights - subcase 2 with decision - 1715070204',
    longTitle: 'Cypress test: profile rights - subcase 2 with decision',
    subcaseType: 'definitieve goedkeuring',
    subcaseName: 'goedkeuring na advies van de Raad van State',
    confidential: false,
    mandatees: [
      {
        fullName: mandateeNames['09112023-01082024'].first.fullName,
        submitter: true,
      },
      {
        fullName: mandateeNames['09112023-01082024'].second.fullName,
        submitter: false,
      }
    ],
    domains: [
      {
        name: 'Welzijn, Volksgezondheid en Gezin',
        selected: true,
        fields: ['Welzijn', 'Gezondheids- en woonzorg'],
      }
    ],
  };
  const submissionExistingCase = {
    // TODO-setup Not many decent cases to use, this one will do for now. profile tests should have already ran
    caseShortTitle: 'Cypress test: profile rights - digital agenda - 1715070204',
    agendaitemType: agendaTypeNota, // will replace previous
    // confidential: false,
    shortTitle: submissionExistingCaseShortTitle, // will replace previous
    longTitle: `Submission existing case long title 1 - ${currentTimestamp()}`, // wont be set initially
    subcaseType: 'definitieve goedkeuring', // will replace previous
    subcaseName: 'goedkeuring na onderhandelingen', // wont be set initially
    approvers: ['KC.1@test.com'],
    approversComment: 'aanvullende voor de secretarie bestaande case',
    notified: ['IKW.1@test.com'],
    notifiedComment: 'aanvullende voor de IKW-groep bestaande case',
    documents: files1,
    agendaDate: agendaDateFormatted,
    comment: 'Interne opmerking voor de secretarie bestaande case',
    previousSubcaseInfo: previousSubcaseInfo,
  };

  it('Create new submission from cases or submission index', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/dossiers?aantal=2');

    cy.createSubmission(submissionNewCase).then((result) => {
      cy.url().should('contain', `/indieningen/${result.submissionId}`);
      cy.url().should('not.contain', '/dossiers/nieuwe-indiening');
    });

    // overview header, case title is the submission short title
    cy.get(submissions.overviewHeader.titleContainer)
      .contains(submissionNewCase.shortTitle);
    cy.get(submissions.overviewHeader.caseLink).should('not.exist');

    // header
    cy.get(submissions.submissionHeader.actions).should('not.exist');
    cy.get(submissions.submissionHeader.requestSendBack);
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');

    // description
    cy.get(submissions.descriptionView.edit).should('not.exist');
    cy.get(submissions.descriptionView.shortTitle)
      .contains(submissionNewCase.shortTitle);
    cy.get(submissions.descriptionView.agendaitemTypePill)
      .contains(submissionNewCase.agendaitemType);
    cy.get(submissions.descriptionView.confidentialityPill);
    cy.get(submissions.descriptionView.title).should('not.exist');
    cy.get(submissions.descriptionView.subcaseType)
      .contains(submissionNewCase.subcaseType);
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
    cy.get('@listItemsApprovers').should('have.length', 2); // based on setup: 1 from settings SEC, 1 we added
    cy.get(submissions.notificationsPanel.approvers.item).contains(
      submissionNewCase.approvers[0]
    );
    cy.get(submissions.notificationsPanel.approvers.remove).should('not.exist');
    cy.get(submissions.notificationsPanel.approvers.comment).contains(
      submissionNewCase.approversComment
    );
    cy.get(submissions.notificationsPanel.notification.item).as(
      'listItemsNotified'
    );
    cy.get('@listItemsNotified').should('have.length.at.least', 1); // we added 1, more could be possible with settings
    cy.get('@listItemsNotified').should('have.length', 2); // based on setup: 1 from settings KC (conf subm) and 1 we added (no IKW since confidential)
    cy.get(submissions.notificationsPanel.notification.item)
      .contains(submissionNewCase.notified[0]);
    cy.get(submissions.notificationsPanel.notification.remove)
      .should('not.exist');
    cy.get(submissions.notificationsPanel.notification.comment)
      .contains(submissionNewCase.notifiedComment);

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
      .contains(submissionNewCase.documents[0].newFileName);
    cy.get('@doc1')
      .find(document.draftDocumentCard.type)
      .contains(submissionNewCase.documents[0].fileTypeLong);
    cy.get('@doc1')
      .find(document.accessLevelPill.pill)
      .contains(accessConfidential);
    cy.get('@doc1')
      .find(document.accessLevelPill.edit)
      .should('not.exist');
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
      .contains(submissionNewCase.documents[1].newFileName);
    cy.get('@doc2')
      .find(document.draftDocumentCard.type)
      .contains(submissionNewCase.documents[1].fileTypeLong);
    cy.get('@doc2')
      .find(document.accessLevelPill.pill)
      .contains(accessConfidential);
    cy.get('@doc2')
      .find(document.accessLevelPill.edit)
      .should('not.exist');

    // history panel
    cy.get(submissions.historyPanel.panel);
    cy.get(submissions.statusChangeActivity.item).should('have.length', 1);
    cy.get(submissions.statusChangeActivity.item).contains(submissionNewCase.comment);
  });

  it('Create new submission from existing case', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/dossiers?aantal=2');
    cy.createSubmission(submissionExistingCase);
    // cy.visit('/dossiers/indieningen/66DAE350F08D8D8342A44C07')
    // overview header, case title is the existing case short title
    cy.get(submissions.overviewHeader.titleContainer)
      .contains(submissionExistingCase.caseShortTitle);
    cy.get(submissions.overviewHeader.caseLink);

    // header
    cy.get(submissions.submissionHeader.actions).should('not.exist');
    cy.get(submissions.submissionHeader.requestSendBack);
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');

    // description
    cy.get(submissions.descriptionView.edit).should('not.exist');
    cy.get(submissions.descriptionView.shortTitle)
      .contains(submissionExistingCase.shortTitle);
    cy.get(submissions.descriptionView.agendaitemTypePill)
      .contains(submissionExistingCase.agendaitemType);
    cy.get(submissions.descriptionView.confidentialityPill).should('not.exist');
    cy.get(submissions.descriptionView.title).should('not.exist');
    cy.get(submissions.descriptionView.subcaseType)
      .contains(submissionExistingCase.subcaseType);
    cy.get(submissions.descriptionView.subcaseName).should('not.exist');

    // mandatees
    cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 2, {
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

    // governmentAreas from previous subcase
    cy.get(utils.governmentAreasPanel.edit).should('not.exist');
    cy.get(utils.governmentAreasPanel.rows).as('listItemsAreas');
    cy.get('@listItemsAreas').should('have.length', 1, {
      timeout: 5000,
    });
    cy.get('@listItemsAreas')
      .eq(0)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', previousSubcaseInfo.domains[0].name);
    cy.get('@listItemsAreas')
      .eq(0)
      .find(utils.governmentAreasPanel.row.fields)
      .should('contain', previousSubcaseInfo.domains[0].fields[(0, 1)]);

    // emails
    cy.get(submissions.notificationsPanel.edit).should('not.exist');
    cy.get(submissions.notificationsPanel.approvers.item).as(
      'listItemsApprovers'
    );
    cy.get('@listItemsApprovers').should('have.length.at.least', 1); // we added 1, more could be possible with settings
    cy.get('@listItemsApprovers').should('have.length', 2); // based on setup: 1 from settings SEC, 1 we added
    cy.get(submissions.notificationsPanel.approvers.item).contains(
      submissionExistingCase.approvers[0]
    );
    cy.get(submissions.notificationsPanel.approvers.remove).should('not.exist');
    cy.get(submissions.notificationsPanel.approvers.comment).contains(
      submissionExistingCase.approversComment
    );
    cy.get(submissions.notificationsPanel.notification.item).as(
      'listItemsNotified'
    );
    cy.get('@listItemsNotified').should('have.length.at.least', 1); // we added 1, more could be possible with settings
    cy.get('@listItemsNotified').should('have.length', 3); // based on setup: 1 from settings IKW, 1 from settings KC (conf doc) and 1 we added
    cy.get(submissions.notificationsPanel.notification.item)
      .contains(submissionExistingCase.notified[0]);
    cy.get(submissions.notificationsPanel.notification.remove)
      .should('not.exist');
    cy.get(submissions.notificationsPanel.notification.comment)
      .contains(submissionExistingCase.notifiedComment);

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
      .contains(submissionExistingCase.documents[0].newFileName);
    cy.get('@doc1')
      .find(document.draftDocumentCard.type)
      .contains(submissionExistingCase.documents[0].fileTypeLong);
    cy.get('@doc1')
      .find(document.accessLevelPill.pill)
      .contains(accessConfidential); // from parsing
    cy.get('@doc1')
      .find(document.accessLevelPill.edit)
      .should('not.exist');
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
      .contains(submissionExistingCase.documents[1].newFileName);
    cy.get('@doc2')
      .find(document.draftDocumentCard.type)
      .contains(submissionExistingCase.documents[1].fileTypeLong);
    cy.get('@doc2')
      .find(document.accessLevelPill.pill)
      .contains(accessCabinet); // default because neither previous subcase not submission are confidential
    cy.get('@doc2')
      .find(document.accessLevelPill.edit)
      .should('not.exist');

    // history panel
    cy.get(submissions.historyPanel.panel);
    cy.get(submissions.statusChangeActivity.item).should('have.length', 1);
    cy.get(submissions.statusChangeActivity.item).contains(submissionExistingCase.comment);
  });

  it('open the first submission as admin, check available options', () => {
    cy.login('Admin');
    // TODO-Setup move these to profile tests eventually per status per profile
    cy.openSubmission(submissionNewCase.shortTitle);

    // const shortTitle = 'Submission new case short title 1 - 1725623168'
    // cy.openSubmission(shortTitle);

    // check actions
    cy.get(submissions.submissionHeader.actions).click();
    cy.get(submissions.submissionHeader.action.takeInTreatment);
    cy.get(submissions.submissionHeader.action.createSubcase).should('not.exist');
    cy.get(submissions.submissionHeader.action.delete);
    cy.get(submissions.submissionHeader.action.sendBack).should('not.exist');
    cy.get(submissions.submissionHeader.requestSendBack).should('not.exist');
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');
    cy.get(submissions.descriptionView.edit);
    cy.get(mandatee.mandateePanelView.actions.edit);
    cy.get(utils.governmentAreasPanel.edit);
    cy.get(submissions.notificationsPanel.edit);
    cy.get(route.submission.documents.batchEdit);
    cy.get(document.draftDocumentCard.card).eq(0)
      .as('doc1');
    cy.get('@doc1')
      .find(document.draftDocumentCard.actions)
      .children(appuniversum.button)
      .click();
    cy.get(document.draftDocumentCard.editPiece);
    cy.get(document.draftDocumentCard.delete);
    cy.get('@doc1')
      .find(document.accessLevelPill.edit);
    // doc 2 is the same, no need to check
    cy.get(route.submission.documents.add);
  });

  it('open the first submission as secretarie, check available options', () => {
    cy.login('Secretarie');
    cy.openSubmission(submissionNewCase.shortTitle);

    // const shortTitle = 'Submission new case short title 1 - 1725623168';
    // cy.openSubmission(shortTitle);

    // check actions
    cy.get(submissions.submissionHeader.actions).click();
    cy.get(submissions.submissionHeader.action.takeInTreatment);
    cy.get(submissions.submissionHeader.action.createSubcase).should('not.exist');
    cy.get(submissions.submissionHeader.action.delete).should('not.exist');
    cy.get(submissions.submissionHeader.action.sendBack).should('not.exist');
    cy.get(submissions.submissionHeader.requestSendBack).should('not.exist');
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');
    cy.get(submissions.descriptionView.edit).should('not.exist');
    cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
    cy.get(utils.governmentAreasPanel.edit).should('not.exist');
    cy.get(submissions.notificationsPanel.edit).should('not.exist');
    cy.get(route.submission.documents.batchEdit).should('not.exist');
    cy.get(document.draftDocumentCard.card).eq(0)
      .as('doc1');
    cy.get('@doc1')
      .find(document.draftDocumentCard.actions)
      .should('not.exist');
    cy.get('@doc1')
      .find(document.accessLevelPill.edit)
      .should('not.exist');
    cy.get(route.submission.documents.add).should('not.exist');
  });

  it('open the first submission as kanselarij, check available options', () => {
    cy.login('Kanselarij');
    cy.openSubmission(submissionNewCase.shortTitle);

    // const shortTitle = 'Submission new case short title 1 - 1725623168'
    // cy.openSubmission(shortTitle);

    // check actions
    cy.get(submissions.submissionHeader.actions).click();
    cy.get(submissions.submissionHeader.action.takeInTreatment);
    cy.get(submissions.submissionHeader.action.createSubcase).should('not.exist');
    cy.get(submissions.submissionHeader.action.delete).should('not.exist');
    cy.get(submissions.submissionHeader.action.sendBack).should('not.exist');
    cy.get(submissions.submissionHeader.requestSendBack).should('not.exist');
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');
    cy.get(submissions.descriptionView.edit).should('not.exist');
    cy.get(mandatee.mandateePanelView.actions.edit).should('not.exist');
    cy.get(utils.governmentAreasPanel.edit).should('not.exist');
    cy.get(submissions.notificationsPanel.edit).should('not.exist');
    cy.get(route.submission.documents.batchEdit).should('not.exist');
    cy.get(document.draftDocumentCard.card).eq(0)
      .as('doc1');
    cy.get('@doc1')
      .find(document.draftDocumentCard.actions)
      .should('not.exist');
    cy.get('@doc1')
      .find(document.accessLevelPill.edit)
      .should('not.exist');
    cy.get(route.submission.documents.add).should('not.exist');
  });

  it('open the first submission as secretarie, treat, edit and create subcase', () => {
    cy.login('Secretarie');
    cy.openSubmission(submissionNewCase.shortTitle);

    // const shortTitle = 'Submission existing case short title 1 - 1725621062';
    // cy.openSubmission(shortTitle);

    // check details in view, long title and subcasename are visible but empty
    cy.get(submissions.descriptionView.title);
    cy.get(submissions.descriptionView.subcaseName);

    cy.takeInTreatment();

    // actions have changed
    cy.get(submissions.submissionHeader.actions).click();
    cy.get(submissions.submissionHeader.action.createSubcase);
    cy.get(submissions.submissionHeader.action.delete).should('not.exist');
    cy.get(submissions.submissionHeader.action.sendBack);
    cy.get(submissions.submissionHeader.requestSendBack).should('not.exist');
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');

    cy.get(submissions.descriptionView.edit);
    cy.get(mandatee.mandateePanelView.actions.edit);
    cy.get(utils.governmentAreasPanel.edit);
    cy.get(submissions.notificationsPanel.edit);
    cy.get(route.submission.documents.batchEdit);
    cy.get(document.draftDocumentCard.card).eq(0)
      .as('doc1');
    cy.get('@doc1')
      .find(document.draftDocumentCard.actions)
      .children(appuniversum.button)
      .click();
    cy.get(document.draftDocumentCard.editPiece);
    cy.get(document.draftDocumentCard.delete);
    cy.get('@doc1')
      .find(document.accessLevelPill.edit);
    // doc 2 is the same, no need to check
    cy.get(route.submission.documents.add);
    cy.get(submissions.statusChangeActivity.item).should('have.length', 2);
    cy.acceptSubmissionCreateSubcase(submissionNewCase);
    cy.wait(10000);
  });

  // TODO-submission expand testing on second submission (from exisiting case)
  it('open the second submission as kanselarij, treat, edit and create subcase', () => {
    cy.login('Kanselarij');
    cy.openSubmission(submissionExistingCase.shortTitle);

    // check details in view, long title and subcasename are visible but empty
    cy.get(submissions.descriptionView.title); // TODO contains specific info from previousSubcase
    cy.get(submissions.descriptionView.subcaseName); // TODO contains specific info

    cy.takeInTreatment();

    // actions have changed
    cy.get(submissions.submissionHeader.actions).click();
    cy.get(submissions.submissionHeader.action.createSubcase);
    cy.get(submissions.submissionHeader.action.delete).should('not.exist');
    cy.get(submissions.submissionHeader.action.sendBack);
    cy.get(submissions.submissionHeader.requestSendBack).should('not.exist');
    cy.get(submissions.submissionHeader.resubmit).should('not.exist');

    cy.get(submissions.descriptionView.edit);
    cy.get(mandatee.mandateePanelView.actions.edit);
    cy.get(utils.governmentAreasPanel.edit);
    cy.get(submissions.notificationsPanel.edit);
    cy.get(route.submission.documents.batchEdit);
    cy.get(document.draftDocumentCard.card).eq(0)
      .as('doc1');
    cy.get('@doc1')
      .find(document.draftDocumentCard.actions)
      .children(appuniversum.button)
      .click();
    cy.get(document.draftDocumentCard.editPiece);
    cy.get(document.draftDocumentCard.delete);
    cy.get('@doc1')
      .find(document.accessLevelPill.edit);
    // doc 2 is the same, no need to check
    cy.get(route.submission.documents.add);
    cy.get(submissions.statusChangeActivity.item).should('have.length', 2);
    cy.acceptSubmissionCreateSubcase(submissionExistingCase);
  });

  // needs an existing subcase with at least 1 submission
  it.skip('Submission create update from subcase', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.url().should('contain', '/dossiers/');
    cy.url().should('contain', '/deeldossiers/');
    cy.url().should('contain', '/nieuwe-indiening');
  });
});

context.skip('change mandatees on organisation', () => {
  const newLinkedMandatee = {
    // the second active mandatee will be our linked mandatee
    mandatee: mandateeNames.current.third, // might not be needed, depends what we want to check
    fullName: mandateeNames.current.third.fullName,
    submitter: true,
  };
  it('change mandatees on organisation', () => {
    cy.login('Admin');
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    // unlink first mandatee
    cy.intercept('PATCH', '/user-organizations/**').as('patchorgs');
    cy.get(settings.organization.technicalInfo.row.unlinkMandatee)
      .eq(0)
      .click();
    cy.get(settings.organization.confirm.unlinkMandatee)
      .click()
      .wait('@patchorgs');
    cy.get(utils.mandateeSelector.container).click();

    // link new mandatee
    cy.intercept('PATCH', '/user-organizations/**').as(
      'patchUserOrganizations'
    );
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should(
      'not.exist'
    );
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should(
      'not.exist'
    );
    cy.get(dependency.emberPowerSelect.option)
      .contains(newLinkedMandatee.fullName)
      .scrollIntoView()
      .click();
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');
  });
});

context.skip('cleanup mandatees from organisation', () => {
  it('remove mandatees from organisation', () => {
    cy.login('Admin');
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
    cy.logout();
  });
});
