/* global context, it, cy, Cypress, afterEach */

// / <reference types="Cypress" />
// import cases from '../../selectors/case.selectors';
import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';
import route from '../../selectors/route.selectors';
import settings from '../../selectors/settings.selectors';
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

// the second active mandatee will be our current linked mandatee
const oldLinkedMandatee = {
  mandatee: mandateeNames.current.second,
  fullName: mandateeNames.current.second.fullName,
  submitter: true,
};
// link the first mandatee instead
const newLinkedMandatee = {
  mandatee: mandateeNames.current.first,
  fullName: mandateeNames.current.first.fullName,
  submitter: true,
};


const limitedAccess = 'Beperkte toegang';
const submittedStatus = 'Ingediend';
const inTreatmentStatus = 'In behandeling';
const treatedStatus = 'Behandeld';
// const sentbackStatus = 'Teruggestuurd';
const updateSubmitted = 'Update ingediend';
const reSubmittedStatus = 'Opnieuw ingediend';
const onAgendaStatus = 'Geagendeerd';

// const accessCabinet = 'Intern Regering';
// const accessConfidential = 'Vertrouwelijk';
const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
const agendaTypeNota = 'Nota';
// const agendaTypeAnnouncement = 'Mededeling';

const submissionOtherSpecNewCaseShortTitle = 'Submission new case short title 1';
const submissionOtherSpecExistingCaseShortTitle = 'Submission existing case short title 1';

const newDraftPiece = {
  folder: 'files',
  fileName: 'test onderwerp-1-nota',
  fileExtension: 'pdf',
  // newFileName: 'submission 1 nota pdf',
};
const newPdfFile = {
  folder: 'files',
  fileName: 'test onderwerp-3-IF',
  fileExtension: 'pdf',
  newFileName: 'submission 3 IF pdf',
  fileTypeLong: 'Advies Inspectie Financiën',
  fileTypeParsed: true,
};
const updateComment = 'New documents for update';

context('change mandatees on organisation', () => {
  afterEach(() => {
    cy.logout();
  });

  it('check the submissions table before changing mandatee', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(appuniversum.loader).should('not.exist');
    // at this point, there should be only 2 (may be altered by earlier tests)
    cy.get(route.submissionsOverview.row.shortTitle).should('have.length', 2);
  });

  // PM has 2 mandatee roles, we should link both
  it('change mandatees on to first mandatee', () => {
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

    // link new mandatee
    cy.intercept('PATCH', '/user-organizations/**').as(
      'patchUserOrganizations'
    );
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
      .contains(newLinkedMandatee.fullName)
      .scrollIntoView()
      .click();
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');
    // link new mandatee
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
      .contains(newLinkedMandatee.fullName)
      .scrollIntoView()
      .click();
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');
  });

  it('check the submissions table after changing mandatee', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(appuniversum.loader).should('not.exist');
    // We can see the submission where our mandatee was not the submitter
    cy.get(route.submissionsOverview.row.shortTitle).should('have.length', 1)
      .eq(0)
      .parents('tr')
      .as('submissionNewCaseRow');
    cy.get('@submissionNewCaseRow').contains(submissionOtherSpecNewCaseShortTitle);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.newCase);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.limitedAccess)
      .should('contain', limitedAccess);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.plannedStart)
      .should('contain', agendaDateFormatted);
  });

  // could open up the submission and check stuff? don't see a point yet.
  // need specific profile test when more setup is done. Maybe send one back and then change the mandatee?
  // it would show only the right mandatee connected to org is allowed to edit
});

context('Create 2 submissions as first mandatee', () => {
  afterEach(() => {
    cy.logout();
  });

  const files1 = [
    {
      folder: 'files',
      fileName: 'test onderwerp-1-nota',
      fileExtension: 'pdf',
      newFileName: 'submission first mandatee nota doc',
      fileTypeLong: 'Nota',
      fileTypeParsed: true,
    },
    {
      folder: 'files',
      fileName: 'test onderwerp-2-BVR',
      fileExtension: 'pdf',
      newFileName: 'submission first mandatee BVR doc',
      fileTypeLong: 'Besluit Vlaamse Regering',
      fileTypeParsed: true,
    }
  ];
  // 1 submission to approve > will be added as agendaitem number 2 (mandatee priority)
  const submissionNewCaseShortTitle = `Submission new case short title 2 - ${currentTimestamp()}`;
  // const submissionNewCaseShortTitle = 'Submission new case short title 2 - ';
  const submissionNewCase = {
    newCase: true,
    agendaitemType: agendaTypeNota,
    shortTitle: submissionNewCaseShortTitle,
    subcaseType: 'principiële goedkeuring',
    documents: files1,
    agendaDate: agendaDateFormatted,
    formallyOk: 'Formeel OK',
  };

  // 1 submission for some profile tests maybe
  // approve after agenda was > will be added as agendaitem number 2 (mandatee priority)
  // maybe accept to different agenda, postponed, retracted, anything really
  const submissionAnotherNewCaseShortTitle = `Submission another new case short title 2 - ${currentTimestamp()}`;
  // const submissionAnotherNewCaseShortTitle = 'Submission another new case short title 2 - ';
  const submissionAnotherNewCase = {
    newCase: true,
    confidential: true,
    agendaitemType: agendaTypeNota,
    shortTitle: submissionAnotherNewCaseShortTitle,
    subcaseType: 'principiële goedkeuring',
    documents: files1,
    agendaDate: agendaDateFormatted,
  };

  it('create 2 submissions for first mandatee', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(appuniversum.loader).should('not.exist');
    cy.createSubmission(submissionNewCase);
    cy.createSubmission(submissionAnotherNewCase);
  });

  it('check the submissions table after creating', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=5');

    // 1 from _B.cy
    // 2 from this spec so far
    cy.get(route.submissionsOverview.row.shortTitle).should('have.length', 3);
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionNewCaseShortTitle)
      .parents('tr')
      .as('submissionNewCaseRow');
    cy.get(route.submissionsOverview.row.shortTitle)
      .contains(submissionAnotherNewCaseShortTitle)
      .parents('tr')
      .as('submissionAnotherNewCaseRow');

    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.newCase);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.limitedAccess)
      .should('not.exist');
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.plannedStart)
      .should('contain', agendaDateFormatted);
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.subcaseType)
      .contains(submissionNewCase.subcaseType, {
        matchCase: false,
      });
    cy.get('@submissionNewCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', submittedStatus);

    // small check on the second one just to make sure it is listed
    cy.get('@submissionAnotherNewCaseRow').find(route.submissionsOverview.row.status)
      .should('contain', submittedStatus);
  });

  it('Treating and accepting the first submission will reorder agendaitems', () => {
    cy.login('Secretarie');
    cy.openAgendaForDate(agendaDate);
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 2);
    cy.get(agenda.agendaOverviewItem.subitem).eq(0)
      .contains('Goedkeuring van het verslag');
    cy.get(agenda.agendaOverviewItem.subitem).eq(1)
      .contains(submissionOtherSpecExistingCaseShortTitle);
    cy.openSubmission(submissionNewCase.shortTitle);
    cy.takeInTreatment();
    cy.acceptSubmissionCreateSubcase(submissionNewCase);

    // the accepted submission has higher mandatee priority and has been put between the first 2 agendaitems
    // TODO we also need to check if decisions were changed etc, but this can be tested separate from submission
    // that is a "submit a subcase to meeting" thing, not a submission specific thing
    cy.openAgendaForDate(agendaDate);
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 3);
    cy.get(agenda.agendaOverviewItem.subitem).eq(0)
      .contains('Goedkeuring van het verslag');
    cy.get(agenda.agendaOverviewItem.subitem).eq(1)
      .contains(submissionNewCase.shortTitle);
    cy.get(agenda.agendaOverviewItem.subitem).eq(2)
      .contains(submissionOtherSpecExistingCaseShortTitle);
  });

  it('approving the agenda in its current state', () => {
    // there should be 3
    // 1 from _B.cy
    // 2 from this spec so far
    cy.login('Secretarie');
    cy.openAgendaForDate(agendaDate);
    cy.setAllItemsFormallyOk(2); // 3 items, but we can set formally ok on accepting submission
    // TODO how long will yggdrasil take? We need to check what other profiles see 'geagendeerd' and for BIS updates
    cy.approveDesignAgenda();
  });

  // process the sent back one? we don't have all that info here
  // we could edit it in _B, but accept it in _D?

  it('Check second submission via agenda view, take in treatment', () => {
    cy.login('Kanselarij');
    cy.openAgendaForDate(agendaDate);
    // submissions via agenda for a change
    cy.get(agenda.agendaTabs.tabs).contains('Indieningen')
      .click();
    // 1 from _B, 1 from this spec, treated submissions are not listed
    cy.get(route.agendaSubmissions.row.shortTitle).should('have.length', 2);
    cy.get(route.agendaSubmissions.row.shortTitle).contains(submissionAnotherNewCase.shortTitle)
      .parents('tr')
      .as('anotherSubmissionRow');
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.newCase);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.limitedAccess)
      .should('contain', limitedAccess);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.submitter)
      .contains(newLinkedMandatee.fullName);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.mandatees)
      .contains('-');
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.subcaseType)
      .contains(submissionAnotherNewCase.subcaseType, {
        matchCase: false,
      });
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.status)
      .should('contain', submittedStatus);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.treatedBy)
      .contains('-');
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.goToSubmission)
      .click();
    cy.takeInTreatment();
  });

  it('Accepting the second submission will not reorder already approved agendaitems', () => {
    // open second submission via agenda view again, check treated by and status
    cy.login('Kanselarij');
    cy.openAgendaForDate(agendaDate);
    // submissions via agenda for a change
    cy.get(agenda.agendaTabs.tabs).contains('Indieningen')
      .click();
    cy.get(route.agendaSubmissions.row.shortTitle).contains(submissionAnotherNewCase.shortTitle)
      .parents('tr')
      .as('anotherSubmissionRow');
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.newCase);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.limitedAccess)
      .should('contain', limitedAccess);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.submitter)
      .contains(newLinkedMandatee.fullName);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.mandatees)
      .contains('-');
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.subcaseType)
      .contains(submissionAnotherNewCase.subcaseType, {
        matchCase: false,
      });
    // this changed
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.status)
      .should('contain', inTreatmentStatus);
    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.treatedBy)
      .contains('Kanselarij Test');

    cy.get('@anotherSubmissionRow').find(route.agendaSubmissions.row.goToSubmission)
      .click();
    cy.acceptSubmissionCreateSubcase(submissionAnotherNewCase);

    // the accepted submission has higher mandatee priority but is only applicable to new agendaitems, not approved ones
    // that is a "submit a subcase to meeting" thing, not a submission specific thing
    cy.openAgendaForDate(agendaDate);
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 4);
    cy.get(agenda.agendaOverviewItem.subitem).eq(0)
      .contains('Goedkeuring van het verslag');
    cy.get(agenda.agendaOverviewItem.subitem).eq(1)
      .contains(submissionNewCase.shortTitle);
    cy.get(agenda.agendaOverviewItem.subitem).eq(2)
      .contains(submissionOtherSpecExistingCaseShortTitle);
    // The new agendaitem has been put on the bottom below the approved ones
    cy.get(agenda.agendaOverviewItem.subitem).eq(3)
      .contains(submissionAnotherNewCaseShortTitle);
  });

  it('test the submissions overview sorting and filter', () => {
    cy.login('Kanselarij');
    cy.visit('/indieningen/opvolgen?aantal=5');
    cy.get(route.submissionsOverview.row.shortTitle).should('have.length', 4);
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionOtherSpecNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.status)
      .should('contain', reSubmittedStatus);
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionOtherSpecExistingCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.status)
      .should('contain', onAgendaStatus);
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.status)
      .should('contain', onAgendaStatus);
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionAnotherNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.status)
      .should('contain', treatedStatus);
    // TODO add tests for filters, mandatees, sorting here. (date filter may need multiple agendas for better tests)

    // treated = not propagated yet. Editors see the subcase view after clicking
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionAnotherNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.goToSubmission)
      .click();
    cy.get(appuniversum.loader);
    cy.get(appuniversum.loader).should('not.exist');
    cy.url().should('contain', '/dossiers/');
    cy.url().should('contain', '/deeldossiers/');
  });

  it('treated second submission is not propagated yet', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=5');
    // creators see the submissions view after clicking
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionAnotherNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.goToSubmission)
      .click();
    cy.get(appuniversum.loader);
    cy.get(appuniversum.loader).should('not.exist');
    cy.url().should('contain', '/dossiers/');
    cy.url().should('contain', '/indieningen/');
  });

  // TODO CRUD on a BIS update maybe later or before the next it?

  it('create BIS update for first submission', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));

    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen/opvolgen?aantal=5');
    // on agenda = propagated on open meeting. creators see the subcase view and can submit updates
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.goToSubmission)
      .click();
    cy.get(appuniversum.loader);
    cy.get(appuniversum.loader).should('not.exist');
    cy.url().should('contain', '/dossiers/');
    cy.url().should('contain', '/deeldossiers/');
    cy.url().should('not.contain', '/nieuwe-indiening');

    // previous submissions history
    cy.get(submissions.historyPanel.panel);
    cy.get(submissions.statusChangeActivity.item).should('have.length', 3);

    cy.get(cases.subcaseHeader.createUpdateSubmission).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.url().should('contain', '/dossiers/');
    cy.url().should('contain', '/deeldossiers/');
    cy.url().should('contain', '/nieuwe-indiening');

    // limited edit on update submissions
    cy.get(submissions.descriptionView.panel);
    cy.get(submissions.descriptionView.edit).should('not.exist');
    cy.get(mandatee.mandateePanelView.actions.edit);
    cy.get(utils.governmentAreasPanel.emptyState); // we didn't add any
    cy.get(utils.governmentAreasPanel.edit).should('not.exist');
    cy.get(submissions.notificationsPanel.edit).should('not.exist');
    cy.get(submissions.notificationsPanel.approvers.add);
    cy.get(submissions.notificationsPanel.approvers.commentEdit);
    cy.get(submissions.notificationsPanel.notification.add);
    cy.get(submissions.notificationsPanel.notification.commentEdit);
    // doc 1 is a real piece, only new version is allowed
    cy.get(document.addDraftDocumentCard.card).should('have.length', 2);
    cy.get(document.addDraftDocumentCard.card).eq(0)
      .as('doc1');
    cy.get('@doc1').find(document.addDraftDocumentCard.name.value)
      .contains('VR 20'); // this document has gotten a VR number
    cy.get('@doc1').find(document.addDraftDocumentCard.name.value)
      .contains(submissionNewCase.documents[0].newFileName);
    cy.get('@doc1').find(document.addDraftDocumentCard.name.value)
      .should('not.contain', 'BIS');
    cy.get('@doc1').find(document.addDraftDocumentCard.versionHistory)
      .should('not.exist');
    cy.get('@doc1').find(document.addDraftDocumentCard.type)
      .contains(submissionNewCase.agendaitemType);
    cy.get('@doc1').find(document.addDraftDocumentCard.uploadDraftPiece);
    cy.get('@doc1').find(document.addDraftDocumentCard.deleteDraftPiece)
      .should('not.exist');
    cy.get('@doc1').find(document.accessLevelPill.edit)
      .should('not.exist');

    cy.get(route.draftUpdateSubmission.addDraftDocuments);
    cy.get(route.draftUpdateSubmission.cancel);
    cy.get(route.draftUpdateSubmission.save).should('be.disabled')
      .contains('Nieuwe indiening'); // we need at least 1 document to allow saving

    cy.addNewDraftPiece(submissionNewCase.documents[0].newFileName, newDraftPiece);
    cy.addDocumentsInUpdateSubmissionFileUpload([newPdfFile]);

    // there are now 3 documents
    cy.get(document.addDraftDocumentCard.card).should('have.length', 3);
    cy.get('@doc1').find(document.addDraftDocumentCard.name.value)
      .contains('VR 20');
    cy.get('@doc1').find(document.addDraftDocumentCard.name.value)
      .contains(submissionNewCase.documents[0].newFileName);
    // this changed
    cy.get('@doc1').find(document.addDraftDocumentCard.versionHistory);
    cy.get('@doc1').find(document.addDraftDocumentCard.name.value)
      .should('contain', 'BIS');
    // we can now only delete the uploaded draft file
    cy.get('@doc1').find(document.addDraftDocumentCard.uploadDraftPiece)
      .should('not.exist');
    cy.get('@doc1').find(document.addDraftDocumentCard.deleteDraftPiece);

    cy.get(document.addDraftDocumentCard.card).eq(2)
      .as('doc3');
    cy.get('@doc3').find(document.addDraftDocumentCard.name.value)
      .should('not.contain', 'VR 20'); // this document does not have a VR number yet
    cy.get('@doc3').find(document.addDraftDocumentCard.name.value)
      .contains(newPdfFile.newFileName);
    cy.get('@doc3').find(document.addDraftDocumentCard.type)
      .contains(newPdfFile.fileTypeLong);
    // new draft piece can only be deleted
    cy.get('@doc1').find(document.addDraftDocumentCard.uploadDraftPiece)
      .should('not.exist');
    cy.get('@doc1').find(document.addDraftDocumentCard.deleteDraftPiece);
    // TODO should we show the accesslevel? no way to see if this doc is confidential at this stage (which might be important)
    cy.get('@doc3').find(document.accessLevelPill.edit)
      .should('not.exist');

    cy.get(route.draftUpdateSubmission.save).should('not.be.disabled')
      .click();

    // when proposing if not postponed
    // there is no choice of agendas here, this is a different modal
    cy.get(submissions.proposableAgendas.comment).should('not.exist');
    cy.get(route.draftUpdateSubmission.submitComment).type(updateComment);

    // save the submission
    // TODO-command to avoid repetitive intercepts/waits for update submissions
    cy.intercept('POST', '/submissions').as(`createNewSubmission${randomInt}`);
    cy.intercept('PATCH', '/draft-pieces/**').as('patchDraftPieces');
    cy.intercept('POST', '/submission-status-change-activities')
      .as('createNewSubmissionStatusChangeActivity');
    // should be 3, 1-3 may fail depending on email adresses set on profile and settings
    cy.intercept('POST', '/emails').as('createMails');
    cy.intercept('POST', '/meetings/*/submit-submission').as('submitSubmission');

    cy.get(auk.confirmationModal.footer.confirm).contains('Nieuwe indiening')
      .click();

    // patch to draft piece = linking the submission
    cy.wait('@patchDraftPieces', {
      timeout: 24000,
    });
    cy.wait('@createNewSubmissionStatusChangeActivity');
    cy.wait(`@createNewSubmission${randomInt}`);
    cy.wait('@createMails');
    cy.wait('@submitSubmission');

    cy.get(appuniversum.loader, {
      timeout: 60000,
    }).should('not.exist');

    // check if we have transitioned to the detail page of the submission
    cy.get(submissions.descriptionView.panel);

    // TODO alert from mail creation pops up because the profile dossierbeheerder has no email set
    cy.get(appuniversum.alert.close).click();

    // user is able to request a sendback
    cy.get(submissions.submissionHeader.requestSendBack);
    cy.get(submissions.overviewHeader.caseLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(cases.subcaseHeader.createUpdateSubmission).should('not.exist');
    cy.get(cases.subcaseHeader.openCurrentSubmission);

    // submission history panel
    cy.get(submissions.statusChangeActivity.item).should('have.length', 4);
    // this profile can't see the comment
    cy.get(submissions.statusChangeActivity.item).eq(0)
      .should('not.contain', updateComment)
      .should('contain', updateSubmitted);
  });

  it('check views as kanselarij after creating update', () => {
    cy.login('Kanselarij');
    cy.visit('/indieningen/opvolgen?aantal=5');
    // since we sort on modified, the new update should always be at the top
    cy.get(route.submissionsOverview.row.shortTitle).should('have.length', 5);
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionOtherSpecNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.status)
      .should('contain', reSubmittedStatus);
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionOtherSpecExistingCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.status)
      .should('contain', onAgendaStatus);
    cy.get(route.submissionsOverview.row.shortTitle).contains(submissionAnotherNewCaseShortTitle)
      .parents('tr')
      .find(route.submissionsOverview.row.status)
      .should('contain', treatedStatus);

    // there are now 2 rows with the same name
    // previous submission is still on agenda
    cy.get(route.submissionsOverview.row.status)
      .should('contain', onAgendaStatus)
      .parents('tr')
      .find(route.submissionsOverview.row.shortTitle)
      .contains(submissionNewCaseShortTitle);
    // new submission is an update, open it
    cy.get(route.submissionsOverview.row.shortTitle).eq(0)
      .contains(submissionNewCaseShortTitle)
      .parents('tr')
      .as('updateSubmissionRow');
    cy.get('@updateSubmissionRow').find(route.submissionsOverview.row.status)
      .should('contain', updateSubmitted);
    cy.get('@updateSubmissionRow').find(route.submissionsOverview.row.goToSubmission)
      .click();

    // submission view
    // submission history panel of this submission
    cy.get(submissions.historyPanel.panel);
    cy.get(submissions.statusChangeActivity.item).should('have.length', 1);
    cy.get(submissions.statusChangeActivity.item).eq(0)
      .should('contain', updateComment)
      .should('contain', updateSubmitted);

    cy.get(submissions.overviewHeader.caseLink).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(cases.subcaseHeader.createUpdateSubmission).should('not.exist');
    cy.get(cases.subcaseHeader.openCurrentSubmission);

    // submission history panel on subcase view
    cy.get(submissions.statusChangeActivity.item).should('have.length', 4);
    // this profile can see the comment
    cy.get(submissions.statusChangeActivity.item).eq(0)
      .should('contain', updateComment)
      .should('contain', updateSubmitted);
  });
});

context('change back mandatees on organisation to second', () => {
  // PM has 2 mandatee roles, we should link both
  it('change mandatees on to second mandatee', () => {
    cy.login('Admin');
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    // unlink first mandatee (2 entries)
    cy.intercept('PATCH', '/user-organizations/**').as('patchorgs');
    cy.get(settings.organization.technicalInfo.row.unlinkMandatee)
      .eq(0)
      .click();
    cy.get(settings.organization.confirm.unlinkMandatee)
      .click()
      .wait('@patchorgs');
    cy.get(settings.organization.technicalInfo.row.unlinkMandatee)
      .eq(0)
      .click();
    cy.get(settings.organization.confirm.unlinkMandatee)
      .click()
      .wait('@patchorgs');

    // link old mandatee (second)
    cy.intercept('PATCH', '/user-organizations/**').as(
      'patchUserOrganizations'
    );
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
      .contains(oldLinkedMandatee.fullName)
      .scrollIntoView()
      .click();
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');
  });
});
