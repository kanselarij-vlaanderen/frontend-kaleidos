/* global cy,Cypress */
// / <reference types="Cypress" />

// ***********************************************
// Functions
// import auk from '../../selectors/auk.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
// import route from '../../selectors/route.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import submissions from '../../selectors/submission.selectors';
import utils from '../../selectors/utils.selectors';

/**
 * @description Creates a new submission for a new case.
 * @name createSubmission
 * @memberOf Cypress.Chainable#
 * @function
 * @param {
 *  {
 *    agendaitemType: String,
 *    confidential: Boolean,
 *    shortTitle: String,
 *    longTitle: String,
 *    subcaseType: String,
 *    [mandatees]: String,
 *    [domains]: String,
 *    [documents]: String,
 *    [approvers]: String,
 *    approversComment: String,
 *    [notified]: String,
 *    notifiedComment: String,
 *    internalComment: String,
 *    agendaDate: String,
 *    agendaKind: String,
 *  }[]
 * } submission
 * @returns {Promise<String>} the id of the created submission
 */
function createSubmission(submission) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.log('createSubmission');
  cy.intercept('POST', '/submissions').as(`createNewSubmission${randomInt}`);
  // cy.intercept('POST', '/meetings/*/submit').as(`submitToMeeting${randomInt}`);
  // cy.intercept('POST', '/submission-activities').as(`postSubmissionActivities${randomInt}`); // we need to check draft docs
  cy.intercept('GET', '/mandatees**').as(`getMandatees${randomInt}`);
  cy.intercept('GET', '/government-bodies**').as(
    `getGovernmentBodies${randomInt}`
  );

  cy.visit('dossiers?aantal=2'); // would it be faster to go to submissions page?
  // in case page is loading
  cy.get(appuniversum.loader, {
    timeout: 60000,
  });
  cy.get(appuniversum.loader).should('not.exist', {
    timeout: 60000,
  });
  cy.get(cases.casesHeader.addSubmission).click();
  cy.url().should('include', 'dossiers/nieuwe-indiening');

  cy.wait(`@getMandatees${randomInt}`, {
    timeout: 60000,
  });
  cy.wait(`@getGovernmentBodies${randomInt}`, {
    timeout: 60000,
  });

  // Set the type
  if (submission.agendaitemType) {
    cy.get(submissions.agendaItemTypeSelector.typeRadio)
      .contains(submission.agendaitemType)
      .scrollIntoView()
      .click();
  }

  // toggle confidential
  if (submission.confidential) {
    cy.get(submissions.newSubmissionForm.toggleConfidential)
      .parent()
      .scrollIntoView()
      .click();
  }

  // Set the short title
  if (submission.shortTitle) {
    cy.get(submissions.newSubmissionForm.shortTitle)
      .click()
      .type(submission.shortTitle);
  }

  // Set the subcase type
  if (submission.subcaseType) {
    cy.get(submissions.newSubmissionForm.subcaseType).click();
    // types start lowercase and contains capitals, check case insensitive
    cy.get(dependency.emberPowerSelect.option)
      .contains(submission.subcaseType, {
        matchCase: false,
      })
      .scrollIntoView()
      .trigger('mouseover')
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.exist');
  }

  // add mandatees
  if (submission.mandatees) {
    let count = 0;
    submission.mandatees.forEach((mandateeModel) => {
      cy.get(mandatee.mandateeSelectorPanel.container)
        .find(appuniversum.checkbox)
        .contains(mandateeModel.fullName)
        .click();
      if (mandateeModel.submitter && count > 0) {
        cy.get(mandatee.mandateeSelectorPanel.selectedMinisterName)
          .contains(mandateeModel.fullName)
          .parents(mandatee.mandateeSelectorPanel.selectedMinister)
          .find(appuniversum.radio)
          .click();
      }
      count++;
    });
  }

  // add domains
  if (submission.domains) {
    submission.domains.forEach((domain) => {
      cy.get(cases.governmentAreasPanel.panel, {
        timeout: 60000,
      })
        .contains(domain.name)
        .as('domain');
      if (domain.selected) {
        cy.get('@domain').click();
      }
      if (domain.fields) {
        domain.fields.forEach((field) => {
          cy.get('@domain')
            .siblings(cases.governmentAreasPanel.fieldsList)
            .contains(field)
            .click();
        });
      }
    });
  }

  // add approvers and their comment

  if (submission.approvers) {
    submission.approvers.forEach((approver) => {
      cy.get(submissions.notificationsPanel.approvers.add).click();
      cy.get(utils.emailModal.input).click()
        .type(approver);
      cy.get(utils.emailModal.add).click();
    });
  }
  if (submission.approversComment) {
    cy.get(submissions.notificationsPanel.approvers.commentEdit).click()
      .type(submission.approversComment);
  }

  // add notified and their comment
  if (submission.notified) {
    submission.notified.forEach((notifyee) => {
      cy.get(submissions.notificationsPanel.notification.add).click();
      cy.get(utils.emailModal.input).click()
        .type(notifyee);
      cy.get(utils.emailModal.add).click();
    });
  }

  if (submission.notifiedComment) {
    cy.get(submissions.notificationsPanel.notification.commentEdit).click()
      .type(submission.notifiedComment);
  }

  // add documents
  if (submission.documents) {
    cy.addDocumentsInSubmissionFileUpload(submission.documents);
  }

  // save
  cy.get(appuniversum.loader, {
    timeout: 60000,
  }).should('not.exist');
  cy.get(submissions.newSubmissionForm.save).should('not.be.disabled')
    .click();

  // select the agenda for the submission
  cy.get(submissions.proposableAgendas.agendaRow)
    .children()
    .contains(submission.agendaDate)
    .scrollIntoView()
    .click();
  // TODO select the correct agendaKind if PVV exists for same date

  if (submission.comment) {
    cy.get(submissions.proposableAgendas.comment).click()
      .type(submission.comment);
  }

  cy.intercept('POST', 'draft-document-containers').as('createNewDraftDocumentContainer');
  cy.intercept('POST', 'draft-pieces').as('createNewDraftPiece');
  cy.intercept('POST', 'submission-status-change-activities').as('createNewSubmissionStatusChangeActivity');
  // should be 3, 1-3 may fail depending on email adresses set on profile and settings
  cy.intercept('POST', 'emails').as('createMails');
  cy.intercept('POST', 'meetings/*/submit-submission').as('submitSubmission');

  // save the form
  cy.get(submissions.proposableAgendas.save).click();

  // if there are many docs, this might time out or not be enough?
  cy.wait('@createNewDraftDocumentContainer', {
    timeout: 24000,
  });
  cy.wait('@createNewDraftPiece', {
    timeout: 24000,
  });
  cy.wait('@createNewSubmissionStatusChangeActivity');

  let submissionId;
  cy.wait(`@createNewSubmission${randomInt}`)
    .its('response.body')
    .as('subcaseResponseBody');

  cy.wait('@createMails');
  cy.wait('@submitSubmission');

  // TODO alert from mail creation pops up because the profile dossierbeheerder has no email set
  cy.get(appuniversum.alert.close).click();

  cy.get(appuniversum.loader, {
    timeout: 60000,
  }).should('not.exist');

  // check if we have transitioned to the detail page of the submission
  cy.get(submissions.descriptionView.panel);

  cy.get(appuniversum.loader, {
    timeout: 60000,
  }).should('not.exist');

  cy.log('/createSubmission');
  cy.get('@subcaseResponseBody')
    .then((responseBody) => {
      submissionId = responseBody.data.id;
      cy.log('submissionId', submissionId);
    })
    .then(
      () => new Cypress.Promise((resolve) => {
        resolve({
          submissionId,
        });
      })
    );
}

/**
 * @description Adds a new document for each file in the "files"-array to an opened document upload modal
 * @name addDocumentsInSubmissionFileUpload
 * @memberOf Cypress.Chainable#
 * @function
 * @param {{
 *  folder: String,
 *  fileName: String,
 *  fileExtension: String,
 *  newFileName: String,
 *  fileType: String,
 *  fileTypeParsed: Boolean,
 *  confidential: Boolean,
 *  confidentialParsed: Boolean,
 * }[]} files
 */
function addDocumentsInSubmissionFileUpload(files) {
  cy.log('addDocumentsInSubmissionFileUpload');
  cy.get(submissions.documentUploadPanel.panel).as('fileUploadDialog');

  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  files.forEach((file, index) => {
    cy.get('@fileUploadDialog').within(() => {
      cy.intercept(
        'GET',
        '/concepts**559774e3-061c-4f4b-a758-57228d4b68cd**'
      ).as(`loadConceptsDocType_${randomInt}`);
      cy.uploadDraftFile(file.folder, file.fileName, file.fileExtension);
      // ensure the new uploadedDocument component is visible before trying to continue
      cy.get(document.uploadedDocument.nameInput, {
        timeout: 60000,
      }).should('have.length.at.least', index + 1);

      if (file.newFileName) {
        cy.get(document.uploadedDocument.nameInput)
          .eq(index)
          .clear()
          .type(file.newFileName);
      }
    });

    // File type is required for submission
    // No fileType will be selected if not provided or parsed.
    cy.wait(`@loadConceptsDocType_${randomInt}`, {
      timeout: 60000,
    });

    cy.get('@fileUploadDialog')
      .find(document.uploadedDocument.container)
      .eq(index)
      .find(document.uploadedDocument.documentTypes)
      .as('radioOptions');
    cy.get(utils.radioDropdown.input).should('exist'); // the radio buttons should be loaded before the within or the .length returns 0
    if (!file.fileTypeParsed) {
      cy.get('@radioOptions').within(($t) => {
        if ($t.find(`input[type="radio"][value="${file.fileType}"]`).length) {
          cy.get(utils.radioDropdown.input).check(file.fileType, {
            force: true,
          }); // CSS has position:fixed, which cypress considers invisible
        } else {
          cy.get('input[type="radio"][value="Andere"]').check({
            force: true,
          });
          cy.get(dependency.emberPowerSelect.trigger)
            .click()
            .parents('body') // we want to stay in the within, but have to search the options in the body
            .find(dependency.emberPowerSelect.option)
            .contains(file.fileType)
            .click(); // Match is not exact, ex. fileType "Advies" yields "Advies AgO" instead of "Advies"
        }
      });
    }
  });

  cy.log('/addDocumentsInSubmissionFileUpload');
}

// Commands

Cypress.Commands.add('createSubmission', createSubmission);
// Cypress.Commands.add('createSubmissionInCase', createSubmissionInCase);
// Cypress.Commands.add('createUpdateSubmission', createUpdateSubmission);

Cypress.Commands.add('addDocumentsInSubmissionFileUpload', addDocumentsInSubmissionFileUpload);
// Cypress.Commands.add('visitCaseWithLink', visitCaseWithLink);
