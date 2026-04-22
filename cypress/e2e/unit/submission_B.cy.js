/* global context, it, cy, Cypress, afterEach, expect */

// / <reference types="Cypress" />
// import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import agenda from '../../selectors/agenda.selectors';
// import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
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

// create Agenda for all? multiple agendas (1 of each type)? the list in the modal will be massive already

context('Submission happy flows', () => {
  afterEach(() => {
    cy.logout();
  });

  const limitedAccess = 'Beperkte toegang';
  const submittedStatus = 'Ingediend';
  const treatedStatus = 'Behandeld';
  const sentbackStatus = 'Teruggestuurd';
  const reSubmittedStatus = 'Opnieuw ingediend';

  const accessCabinet = 'Intern Regering';
  const accessConfidential = 'Vertrouwelijk';
  const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
  const agendaTypeNota = 'Nota';
  const agendaTypeAnnouncement = 'Mededeling';
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
    name: 'Werk, Economie, Wetenschap, Innovatie, Landbouw en Sociale Economie',
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
  // const submissionNewCaseShortTitle = 'Submission new case short title 1 - 1745846633';
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
  // const submissionExistingCaseShortTitle = 'Submission existing case short title 1 - 1745846633';
  const previousSubcaseInfo = {
    agendaitemType: agendaTypeNota,
    shortTitle: 'Cypress test: profile rights - subcase 2 with decision - 1715070204',
    longTitle: 'Cypress test: profile rights - subcase 2 with decision',
    subcaseType: 'definitieve goedkeuring',
    subcaseName: 'goedkeuring na advies van de Raad van State',
    confidential: false,
    mandatees: [
      {
        fullName: mandateeNames['09112023-01082024'].first.fullName, // Jambon
        submitter: true,
      },
      {
        fullName: mandateeNames['09112023-01082024'].second.fullName, // Crevits
        submitter: false,
      }
    ],
    domains: [
      {
        name: 'Welzijn, Volksgezondheid en Gezin',
        selected: true,
        // these fields are no longer active, they should not be added on submission creation
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
    cy.visit('/indieningen/opvolgen?aantal=2');

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
    cy.visit('/indieningen/opvolgen?aantal=2');
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
    // TODO depends on active mandatee being linked to a previous subcase with old mandatees
    // Jambon was on previous subcase but no longer active
    // Crevits was on previous subcase and is still active (rank changed from 2 to 3)
    cy.get('@listItems')
      .eq(0)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', linkedMandatee.fullName); // Depraetere
    cy.get('@listItems')
      .eq(1)
      .find(mandatee.mandateePanelView.row.name)
      .should('contain', mandatee3.fullName); // Crevits
    cy.get('@listItems')
      .eq(0)
      .find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');

    // governmentAreas from previous subcase
    cy.get(utils.governmentAreasPanel.edit).should('not.exist');
    cy.get(utils.governmentAreasPanel.rows).as('listItemsAreas');
    cy.get('@listItemsAreas').should('have.length', 1, {
      timeout: 5000,
    });
    // the domain from previous subcase is NOT deprecated, so they are added on submission creation
    cy.get('@listItemsAreas')
      .eq(0)
      .find(utils.governmentAreasPanel.row.label)
      .should('contain', previousSubcaseInfo.domains[0].name);
    // the fields from previous subcase are OUTSIDE active range, so they are NOT added on submission creation
    cy.get('@listItemsAreas')
      .eq(0)
      .find(utils.governmentAreasPanel.row.fields)
      .should('not.contain', previousSubcaseInfo.domains[0].fields[(0, 1)]);

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

  it('check the submissions table after creating both', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=2');
    // these 2 will only be in view if there is no submission on a later agenda
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionNewCaseShortTitle)
      .parents('tr')
      .as('submissionNewCaseRow');
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionExistingCaseShortTitle)
      .parents('tr')
      .as('submissionExistingCaseRow');

    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.newCase);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.limitedAccess)
      .should('contain', limitedAccess);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.plannedStart)
      .should('contain', agendaDateFormatted);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.subcaseType)
      .contains(submissionNewCase.subcaseType, {
        matchCase: false,
      });
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', submittedStatus);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.goToSubmission);

    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.newCase)
      .should('not.exist');
    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.limitedAccess)
      .should('not.exist');
    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.plannedStart)
      .should('contain', agendaDateFormatted);
    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.subcaseType)
      .contains(submissionExistingCase.subcaseType, {
        matchCase: false,
      });
    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', submittedStatus);
    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.goToSubmission);
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

  it('check the submissions table after accepting both', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=2');
    // these 2 will only be in view if there is no submission on a later agenda
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionNewCaseShortTitle)
      .parents('tr')
      .as('submissionNewCaseRow');
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionExistingCaseShortTitle)
      .parents('tr')
      .as('submissionExistingCaseRow');

    // only status changed
    // a case was created but not visible yet to this profile
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', treatedStatus);
    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', treatedStatus);
  });

  it('send back the submission from the agenda', () => {
    cy.login('Kanselarij');
    const fileSpy = cy.spy();
    const pieceSpy = cy.spy();
    const containerSpy = cy.spy();
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(submissionNewCase.shortTitle);

    cy.get(agenda.agendaitemControls.actions)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaitemControls.action.sendSubmissionBack).forceClick();
    cy.intercept('DELETE', 'agendaitems/**').as('deleteAgendaitem');
    cy.intercept('DELETE', 'agenda-activities/**').as('deleteAgendaActivity');
    cy.intercept('DELETE', 'agenda-item-treatments/**').as('deleteAgendaItemTreatment');
    cy.intercept('DELETE', 'decision-activities/**').as('deleteDecisionActivity');
    cy.intercept('DELETE', 'cases/**').as('deleteCase');
    cy.intercept('DELETE', 'decisionmaking-flows/**').as('deleteDecFlow');
    cy.intercept('DELETE', 'subcases/**').as('deleteSubcase');
    cy.intercept('DELETE', 'files/**').as('deleteFile');
    cy.intercept('DELETE', 'draft-files/**', fileSpy).as('deleteDraftFile');
    cy.intercept('DELETE', 'pieces/**').as('deleteAcceptedPiece');
    cy.intercept('DELETE', 'draft-pieces/**', pieceSpy).as('deleteDraftPiece');
    cy.intercept('DELETE', 'document-containers/**').as('deleteDocumentContainer');
    cy.intercept('DELETE', 'draft-document-containers/**', containerSpy).as('deleteDraftDocumentContainer');
    cy.get(auk.confirmationModal.footer.confirm).contains('Verwijderen')
      .click();
    cy.wait('@deleteAgendaitem'); // 2 of these happen
    cy.wait('@deleteAgendaActivity');
    cy.wait('@deleteDecisionActivity');
    cy.wait('@deleteAgendaItemTreatment');
    cy.wait('@deleteCase');
    cy.wait('@deleteDecFlow');
    cy.wait('@deleteSubcase');
    cy.wait('@deleteFile');
    cy.wait('@deleteAcceptedPiece');
    cy.wait('@deleteDocumentContainer');
    cy.wait(2000).then(() => expect(fileSpy).not.to.have.been.called);
    cy.wait(2000).then(() => expect(pieceSpy).not.to.have.been.called);
    cy.wait(2000).then(() => expect(containerSpy).not.to.have.been.called);
    cy.get(appuniversum.alert.close).click(); // email not sent
    cy.openSubmission(submissionNewCase.shortTitle);
    cy.get(document.draftDocumentCard.card).should('have.length', 2);
    // check we didn't get routed to a subcase view
    cy.url().should('contain', '/dossiers/indieningen');
  });

  it('check the submissions table after sending back one', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=2');
    // these 2 will only be in view if there is no submission on a later agenda
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionNewCaseShortTitle)
      .parents('tr')
      .as('submissionNewCaseRow');
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionExistingCaseShortTitle)
      .parents('tr')
      .as('submissionExistingCaseRow');

    // only status changed (The case was removed but was not yet visible to this profile)
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', sentbackStatus);

    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', treatedStatus);
  });

  it('change and resubmit the first submission', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));
    cy.intercept('POST', '/submission-status-change-activities')
      .as(`createNewSubmissionStatusChangeActivity${randomInt}`);
    cy.intercept('PATCH', '/submissions/*').as(`patchSubmission${randomInt}`);
    cy.intercept('POST', '/meetings/*/submit-submission').as(`submitSubmission${randomInt}`);

    cy.login('Kabinetdossierbeheerder');
    cy.openSubmission(submissionNewCase.shortTitle);
    // can edit description
    // can not change anything about the new case
    cy.get(submissions.descriptionView.edit).click();
    cy.get(submissions.decisionmakingFlowSelector.newCaseTitle)
      .should('be.disabled')
      .should('have.value', submissionNewCase.shortTitle);
    cy.get(submissions.decisionmakingFlowSelector.useDifferentCase)
      .should('not.exist');
    cy.get(submissions.decisionmakingFlowSelector.useExistingCase)
      .should('not.exist');
    cy.get(submissions.decisionmakingFlowSelector.useNewCase)
      .should('not.exist');
    cy.get(submissions.decisionmakingFlowSelector.existingCaseTitle)
      .should('not.exist');

    // change to announcement
    cy.get(submissions.descriptionEdit.agendaitemType).contains(agendaTypeAnnouncement)
      .find('input')
      .should('not.be.checked')
      .parent()
      .click();

    // currently confidential
    cy.get(submissions.descriptionEdit.confidential).should('be.checked');

    cy.get(submissions.descriptionEdit.shortTitle).should('have.value', submissionNewCase.shortTitle);
    cy.get(submissions.descriptionEdit.title).should('not.exist');
    cy.get(submissions.descriptionEdit.subcaseType).should('contain', submissionNewCase.subcaseType, {
      matchCase: false,
    });
    cy.get(submissions.descriptionEdit.shortcut).should('not.exist');
    cy.get(submissions.descriptionEdit.shortcutEdit).should('not.exist');
    cy.get(submissions.descriptionEdit.subcaseName).should('not.exist');
    cy.get(submissions.descriptionEdit.subcaseNameCancel).should('not.exist');
    cy.get(submissions.descriptionEdit.subcaseNameClear).should('not.exist');
    cy.get(submissions.descriptionEdit.save).click();
    cy.wait(`@patchSubmission${randomInt}`);

    cy.get(mandatee.mandateePanelView.rows).should('have.length', 3);
    cy.get(mandatee.mandateePanelView.actions.edit).click();
    cy.get(mandatee.mandateePanelEdit.rows)
      .eq(0)
      .within(() => {
        cy.get(mandatee.mandateePanelEdit.row.submitter)
          .find('input')
          .should('not.be.checked')
          .should('be.disabled');
        cy.get(mandatee.mandateePanelEdit.row.delete).should('not.be.disabled');
      });
    cy.get(mandatee.mandateePanelEdit.rows)
      .eq(1)
      .within(() => {
        cy.get(mandatee.mandateePanelEdit.row.submitter)
          .find('input')
          .should('be.checked')
          .should('be.disabled');
        cy.get(mandatee.mandateePanelEdit.row.delete).should('be.disabled');
      });
    // remove third mandatee
    cy.get(mandatee.mandateePanelEdit.rows)
      .eq(2)
      .within(() => {
        cy.get(mandatee.mandateePanelEdit.row.submitter)
          .find('input')
          .should('not.be.checked')
          .should('be.disabled');
        cy.get(mandatee.mandateePanelEdit.row.delete).should('not.be.disabled')
          .click();
      });
    cy.get(mandatee.mandateePanelEdit.actions.save).click();
    cy.wait(`@patchSubmission${randomInt}`);
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 2);

    // add a new mandatee
    cy.addSubmissionMandatee(mandateeNames.current.fourth);
    cy.get(mandatee.mandateePanelView.rows).should('have.length', 3);

    // this util component is generic and has been tested in other specs
    cy.get(utils.governmentAreasPanel.edit);
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

    // notification edits are allowed
    cy.get(submissions.notificationsPanel.edit);

    // header
    cy.get(submissions.submissionHeader.actions).should('not.exist');
    cy.get(submissions.submissionHeader.requestSendBack).should('not.exist');
    cy.get(submissions.submissionHeader.resubmit).click();
    // TODO-command, also used in the createSubmission command
    // select the agenda for the submission
    cy.get(submissions.proposableAgendas.agendaRow)
      .children()
      .contains(submissionNewCase.agendaDate)
      .scrollIntoView()
      .click();
    // save the form
    cy.get(submissions.proposableAgendas.save).click();
    cy.wait(`@createNewSubmissionStatusChangeActivity${randomInt}`);
    cy.wait(`@submitSubmission${randomInt}`);
    cy.wait(`@patchSubmission${randomInt}`);
    // TODO Is this patchSubmission skipped due to earlier patches? maybe visual confirmation that data was saved here?
  });

  it('check the submissions table after resubmitting', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=2');
    // these 2 will only be in view if there is no submission on a later agenda
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionNewCaseShortTitle)
      .parents('tr')
      .as('submissionNewCaseRow');
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionExistingCaseShortTitle)
      .parents('tr')
      .as('submissionExistingCaseRow');

    // only status changed
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', reSubmittedStatus);

    cy.get('@submissionExistingCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', treatedStatus);
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
