/* global context, it, cy, beforeEach, afterEach, expect */

// / <reference types="Cypress" />
import cases from '../../selectors/case.selectors';
// import dependency from '../../selectors/dependency.selectors';
// import agenda from '../../selectors/agenda.selectors';
// import publication from '../../selectors/publication.selectors';
// import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
// import settings from '../../selectors/settings.selectors';
import mandatee from '../../selectors/mandatee.selectors';
// import route from '../../selectors/route.selectors';
// import signature from '../../selectors/signature.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';
import submissions from '../../selectors/submission.selectors';
import utils from '../../selectors/utils.selectors';

// function currentTimestamp() {
//   return Cypress.dayjs().unix();
// }

function uploadDraftFileWithWrongFormat(file) {
  const spy = cy.spy();
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.get(submissions.documentUploadPanel.panel).as('fileUploadDialog');
  cy.intercept('POST', '/draft-files', spy).as(`createNewDraftFile${randomInt}`);

  cy.get('@fileUploadDialog').within(() => {
    const fileFullName = `${file.fileName}.${file.fileExtension}`;
    const filePath = `${file.folder}/${fileFullName}`;

    cy.fixture(filePath, {
      encoding: null,
    }).then((fileContent) => {
      cy.get('[type=file]').selectFile(
        {
          contents: fileContent,
          fileName: fileFullName,
          mimeType: file.mimeType,
        }
      );
    });
    cy.wait(2000).then(() => expect(spy).not.to.have.been.called);
  });
}

// const agendaDate = Cypress.dayjs().add(4, 'weeks')
//   .day(1); // anything but day 4
// const agendaDate = Cypress.dayjs('2024-09-13');

const linkedMandatee = {
  // the second active mandatee will be our linked mandatee
  mandatee: mandateeNames.current.second, // might not be needed, depends what we want to check
  fullName: mandateeNames.current.second.fullName,
  submitter: true,
};

context('Cancel editing tests on new submission form for new case', () => {
  beforeEach(() => {
    cy.login('Kabinetdossierbeheerder');
  });

  afterEach(() => {
    cy.logout();
  });

  const secEmail = 'example+sec@test.com';
  const ikwEmail = 'example+ikw@test.com';
  const kcEmail = 'example+KC@test.com';

  const pdfFile = {
    folder: 'files',
    fileName: 'test onderwerp-1-nota',
    fileExtension: 'pdf',
    newFileName: 'submission 1 nota pdf',
    fileTypeLong: 'Nota',
    fileTypeParsed: true,
  };

  const docxFile = {
    folder: 'files',
    fileName: 'test',
    fileExtension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    newFileName: 'submission 1 nota docx',
  };

  it('Cancel form with documents', () => {
    cy.intercept('DELETE', '/draft-files/*').as('deleteNewDraftFile');

    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(cases.casesHeader.openSubmissionModal).click();
    cy.get(cases.casesHeader.navigateToNewSubmission).click();
    cy.addDocumentsInSubmissionFileUpload([pdfFile]);
    cy.get(submissions.newSubmissionForm.cancel).click();
    cy.wait('@deleteNewDraftFile');
  });

  it('Remove document from form', () => {
    cy.intercept('DELETE', '/draft-files/*').as('deleteNewDraftFile');

    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(cases.casesHeader.openSubmissionModal).click();
    cy.get(cases.casesHeader.navigateToNewSubmission).click();
    cy.addDocumentsInSubmissionFileUpload([pdfFile]);
    cy.get(document.vlUploadedDocument.deletePiece).should('exist')
      .click()
      .wait('@deleteNewDraftFile');
    cy.get(document.vlUploadedDocument.filename).should('not.exist');

    cy.get(submissions.newSubmissionForm.cancel).click();
  });

  it('Only allow certain type of files on submissions', () => {
    const fileTxt = {
      folder: 'files',
      fileName: 'test',
      fileExtension: 'txt',
      mimeType: 'text/plain',
    };

    cy.intercept('DELETE', '/draft-files/*').as('deleteNewDraftFile');

    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(cases.casesHeader.openSubmissionModal).click();
    cy.get(cases.casesHeader.navigateToNewSubmission).click();
    // cy.addDocumentsInSubmissionFileUpload([fileTxt]);
    uploadDraftFileWithWrongFormat(fileTxt);
    cy.get(document.vlUploadedDocument.filename).should('not.exist');
    cy.get(appuniversum.toaster).contains('Geldige bestandsformaten zijn');
    cy.get(appuniversum.alert.close).click();

    // pdf files tests above, no fixtures exist yet for .xlsx and .zip
    // should pass:
    // .pdf, .PDF (will get lowercased), .docx, .xlsx, .zip
    // should fail:
    // .doc, .xls, image formats, .odt and any not listed
    // only restricted to profiles without the permissions "upload-any-submission-document-extension"
    cy.addDocumentsInSubmissionFileUpload([docxFile]);
    cy.get(document.vlUploadedDocument.filename).should('have.length', 1);
    cy.get(appuniversum.alert.close).should('not.exist');

    cy.get(submissions.newSubmissionForm.cancel).click();
    cy.wait('@deleteNewDraftFile');
  });

  it('Confidentiality effect on docs and email', () => {
    cy.intercept('DELETE', '/draft-files/*').as('deleteNewDraftFile');

    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(cases.casesHeader.openSubmissionModal).click();
    cy.get(cases.casesHeader.navigateToNewSubmission).click();

    cy.get(submissions.notificationsPanel.approvers.item).as(
      'listItemsApprovers'
    );
    cy.get(submissions.notificationsPanel.notification.item).as(
      'listItemsNotified'
    );
    // default emails from setting / normal submission
    cy.get('@listItemsApprovers').should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.item).contains(secEmail);
    cy.get('@listItemsNotified').should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.item).contains(ikwEmail);

    // toggle confidential on submission
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('not.be.checked')
      .parent()
      .click();
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('be.checked');

    // confidential changes notified
    cy.get('@listItemsApprovers').should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.item).contains(secEmail);
    cy.get('@listItemsNotified').should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.item).contains(kcEmail);

    // docs uploaded with confidential become confidential
    cy.addDocumentsInSubmissionFileUpload([pdfFile]);
    cy.get(document.uploadedDocument.accessLevel).should('be.checked');

    // confidential submission and confidential doc > no changes
    cy.get('@listItemsApprovers').should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.item).contains(secEmail);
    cy.get('@listItemsNotified').should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.item).contains(kcEmail);

    // toggle confidential on submission
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('be.checked')
      .parent()
      .click();
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('not.be.checked');

    // normal submission and confidential doc > notified changes
    cy.get('@listItemsApprovers').should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.item).contains(secEmail);
    cy.get('@listItemsNotified').should('have.length', 2);
    cy.get(submissions.notificationsPanel.notification.item).contains(kcEmail);
    cy.get(submissions.notificationsPanel.notification.item).contains(ikwEmail);

    // toggle confidential on doc
    cy.get(document.uploadedDocument.accessLevel).should('be.checked')
      .parent()
      .click();
    cy.get(document.uploadedDocument.accessLevel).should('not.be.checked');

    // normal submission and normal doc > changes notified
    cy.get('@listItemsApprovers').should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.item).contains(secEmail);
    cy.get('@listItemsNotified').should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.item).contains(ikwEmail);

    // toggle confidential on submission
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('not.be.checked')
      .parent()
      .click();
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('be.checked');

    // any existing docs become confidential, notified changes
    cy.get(appuniversum.toaster).contains('De rechten van de reeds opgeladen documenten werden aangepast');

    cy.get(document.uploadedDocument.accessLevel).should('be.checked');
    cy.get('@listItemsApprovers').should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.item).contains(secEmail);
    cy.get('@listItemsNotified').should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.item).contains(kcEmail);

    cy.get(submissions.newSubmissionForm.cancel).click();
  });

  it('Can not remove your own mandatee / other mandatees get added or removed when clicked', () => {
    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(cases.casesHeader.openSubmissionModal).click();
    cy.get(cases.casesHeader.navigateToNewSubmission).click();

    // checkbox tree, input for our mandatee is disabled and checked
    cy.get(mandatee.mandateeSelectorPanel.container)
      .find(appuniversum.checkbox)
      .contains(linkedMandatee.fullName)
      .parent()
      .find('input')
      .as('linkedMandateeCheckbox');
    cy.get('@linkedMandateeCheckbox')
      .should('be.checked')
      .should('be.disabled');

    // list with submitter toggle. Should be check and disabled
    cy.get(mandatee.mandateeSelectorPanel.selectedMinister).as('listItems');
    cy.get('@listItems').should('have.length', 1);
    cy.get('@listItems')
      .find(mandatee.mandateeSelectorPanel.selectedMinisterName)
      .contains(linkedMandatee.fullName)
      .parents(mandatee.mandateeSelectorPanel.selectedMinister)
      .as('linkedMandateeRow');
    cy.get('@linkedMandateeRow')
      .find(mandatee.mandateeSelectorPanel.submitterRadio)
      .should('be.disabled')
      .should('be.checked');

    // only 1 is checked
    cy.get(mandatee.mandateeSelectorPanel.container)
      .find(utils.checkboxTree.toggleSingle)
      .parent()
      .find(':checked')
      .should('have.length', 1);

    // add all mandatees
    cy.get(mandatee.mandateeSelectorPanel.container)
      .find(utils.checkboxTree.toggleAll)
      .parent()
      .click();

    // our mandatee is unchanged
    cy.get('@linkedMandateeCheckbox')
      .should('be.checked')
      .should('be.disabled');
    cy.get('@linkedMandateeRow')
      .find(mandatee.mandateeSelectorPanel.submitterRadio)
      .should('be.disabled')
      .should('be.checked');

    // all mandatees are toggled
    cy.get(mandatee.mandateeSelectorPanel.container)
      .find(utils.checkboxTree.toggleSingle)
      .parent()
      .find(':checked')
      .should('have.length', mandateeNames.current.count);

    // all mandatees in list, 1 checked, all disabled
    cy.get('@listItems').should('have.length', mandateeNames.current.count);
    cy.get('@listItems').find(':checked')
      .and('have.length', 1); // only 1 is checked
    cy.get('@listItems').find(':disabled')
      .and('have.length', mandateeNames.current.count); // all are disabled

    // remove all mandatees
    cy.get(utils.checkboxTree.toggleAll)
      .parent()
      .click();

    // our mandatee is unchanged
    cy.get('@linkedMandateeCheckbox')
      .should('be.checked')
      .should('be.disabled');
    cy.get('@linkedMandateeRow')
      .find(mandatee.mandateeSelectorPanel.submitterRadio)
      .should('be.disabled')
      .should('be.checked');

    // only 1 in the list
    cy.get('@listItems').should('have.length', 1);
    cy.get('@listItems').find(':checked')
      .and('have.length', 1);
    cy.get('@listItems').find(':disabled')
      .and('have.length', 1);

    // add 1 mandatee
    cy.get(mandatee.mandateeSelectorPanel.container)
      .find(utils.checkboxTree.toggleSingle)
      .parent()
      .eq(5)
      .click();

    // our mandatee is unchanged
    cy.get('@linkedMandateeCheckbox')
      .should('be.checked')
      .should('be.disabled');
    cy.get('@linkedMandateeRow')
      .find(mandatee.mandateeSelectorPanel.submitterRadio)
      .should('be.disabled')
      .should('be.checked');

    // 2 mandatees are toggled
    cy.get(mandatee.mandateeSelectorPanel.container)
      .find(utils.checkboxTree.toggleSingle)
      .parent()
      .find(':checked')
      .should('have.length', 2);

    // 2 in the list
    cy.get('@listItems').should('have.length', 2);
    cy.get('@listItems').find(':checked')
      .and('have.length', 1);
    cy.get('@listItems').find(':disabled')
      .and('have.length', 2);
  });

  it('Add and delete emails, default emails can not be deleted', () => {
    const emailToAdd = 'test@email.com';
    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(cases.casesHeader.openSubmissionModal).click();
    cy.get(cases.casesHeader.navigateToNewSubmission).click();

    cy.get(submissions.notificationsPanel.approvers.item).should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.remove).should('not.exist');
    cy.get(submissions.notificationsPanel.notification.item).should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.remove).should('not.exist');

    cy.get(submissions.notificationsPanel.approvers.add).click();
    cy.get(utils.emailModal.input).click()
      .type(emailToAdd);
    cy.get(utils.emailModal.add).click();

    cy.get(submissions.notificationsPanel.notification.add).click();
    cy.get(utils.emailModal.input).click()
      .type(emailToAdd);
    cy.get(utils.emailModal.add).click();

    // the added emails can be removed
    cy.get(submissions.notificationsPanel.approvers.item).should('have.length', 2);
    cy.get(submissions.notificationsPanel.approvers.remove).should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.item).should('have.length', 2);
    cy.get(submissions.notificationsPanel.notification.remove).should('have.length', 1);

    cy.get(submissions.notificationsPanel.approvers.item)
      .contains(secEmail)
      .find(submissions.notificationsPanel.approvers.remove)
      .should('not.exist');
    cy.get(submissions.notificationsPanel.approvers.item)
      .contains(emailToAdd)
      .find(submissions.notificationsPanel.approvers.remove)
      .click();

    cy.get(submissions.notificationsPanel.notification.item)
      .contains(ikwEmail)
      .find(submissions.notificationsPanel.notification.remove)
      .should('not.exist');
    cy.get(submissions.notificationsPanel.notification.item)
      .contains(emailToAdd)
      .find(submissions.notificationsPanel.notification.remove)
      .click();

    // both removed, no remove button
    cy.get(submissions.notificationsPanel.approvers.item).should('have.length', 1);
    cy.get(submissions.notificationsPanel.approvers.remove).should('not.exist');
    cy.get(submissions.notificationsPanel.notification.item).should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.remove).should('not.exist');

    // add another notification mail
    cy.get(submissions.notificationsPanel.notification.add).click();
    cy.get(utils.emailModal.input).click()
      .type(emailToAdd);
    cy.get(utils.emailModal.add).click();

    // confidential changes default notification email but keeps the added email
    // toggle confidential on submission
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('not.be.checked')
      .parent()
      .click();
    cy.get(submissions.newSubmissionForm.toggleConfidential).should('be.checked');

    cy.get(submissions.notificationsPanel.notification.item).should('have.length', 2);
    cy.get(submissions.notificationsPanel.notification.remove).should('have.length', 1);

    cy.get(submissions.notificationsPanel.notification.item)
      .contains(kcEmail)
      .find(submissions.notificationsPanel.notification.remove)
      .should('not.exist');
    cy.get(submissions.notificationsPanel.notification.item)
      .contains(emailToAdd)
      .find(submissions.notificationsPanel.notification.remove)
      .click();
    cy.get(submissions.notificationsPanel.notification.item).should('have.length', 1);
    cy.get(submissions.notificationsPanel.notification.remove).should('not.exist');
  });

  it('Scenarios preventing the creation of a submission', () => {
    cy.visit('/indieningen/opvolgen?aantal=2');
    cy.get(cases.casesHeader.openSubmissionModal).click();
    cy.get(cases.casesHeader.navigateToNewSubmission).click();
    // these are mandatory:
    // - short title not empty (only whitespaces count for now but really shouldn't)
    // - subcase type selected
    // - at least 1 document
    // - all documents must have a document type (button enabled but red toast is shown)

    // nothing filled in, save is disabled
    cy.get(submissions.newSubmissionForm.save).should('be.disabled');

    // upload doc with a type > disabled
    // add short title > disabled
    // add subcase type > enabled
    // remove short title > disabled
    // add short title and remove doc > disabled
    // add document without type > enabled but error is thrown
  });
});
