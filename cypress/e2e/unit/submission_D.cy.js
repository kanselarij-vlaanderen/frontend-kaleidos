/* global context, it, cy, Cypress, afterEach */

// / <reference types="Cypress" />
// import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import agenda from '../../selectors/agenda.selectors';
// import publication from '../../selectors/publication.selectors';
// import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
// import document from '../../selectors/document.selectors';
import settings from '../../selectors/settings.selectors';
// import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
// import signature from '../../selectors/signature.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';
// import submissions from '../../selectors/submission.selectors';
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
// const treatedStatus = 'Behandeld';
// const sentbackStatus = 'Teruggestuurd';
// const reSubmittedStatus = 'Opnieuw ingediend';

// const accessCabinet = 'Intern Regering';
// const accessConfidential = 'Vertrouwelijk';
const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
const agendaTypeNota = 'Nota';
// const agendaTypeAnnouncement = 'Mededeling';

const submissionOtherSpecNewCaseShortTitle = 'Submission new case short title 1';
const submissionOtherSpecExistingCaseShortTitle = 'Submission existing case short title 1';


context('change mandatees on organisation', () => {
  afterEach(() => {
    cy.logout();
  });

  it('check the submissions table before changing mandatee', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen?aantal=2');
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
    cy.visit('/indieningen?aantal=2');
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
    cy.visit('/indieningen?aantal=2');
    cy.get(appuniversum.loader).should('not.exist');
    cy.createSubmission(submissionNewCase);
    cy.createSubmission(submissionAnotherNewCase);
  });

  it('check the submissions table after creating', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visit('/indieningen?aantal=5');

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
