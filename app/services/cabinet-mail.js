import Service, { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import {
  caseResubmittedApproversEmail,
  caseResubmittedIkwEmail,
  caseResubmittedSubmitterEmail,
  caseSendBackEmail,
  caseRequestSendBackEmail,
  caseSubmittedApproversEmail,
  caseSubmittedIkwEmail,
  caseSubmittedSubmitterEmail,
  caseUpdateSubmissionApproversEmail,
  caseUpdateSubmissionIkwEmail,
  caseUpdateSubmissionSubmitterEmail,
} from 'frontend-kaleidos/utils/cabinet-submission-email';
import CopyErrorToClipboardToast from 'frontend-kaleidos/components/utils/toaster/copy-error-to-clipboard-toast';
import { containsConfidentialPieces } from 'frontend-kaleidos/utils/documents';

export default class CabinetMailService extends Service {
  @service store;
  @service router;
  @service toaster;
  @service intl;
  @service draftSubmissionService;

  async loadSettings() {
    const [mailSettings, outbox] = await Promise.all([
      this.store.queryOne('email-notification-setting'),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
    ]);

    if (!(mailSettings && outbox)) {
      this.toaster.warning(
        this.intl.t('notification-mails-could-not-be-sent'),
        this.intl.t('warning-title')
      );
      return {};
    }
    return { mailSettings, outbox };
  }

  getSubmissionUrl(submission) {
    return this.router.urlFor(
      'cases.submissions.submission',
      submission
    );
  }

  getSubmissionCaseTitle = async(submission) => {
    let title = submission.decisionmakingFlowTitle;
    if (!title) {
      const decisionmakingFlow = await submission.decisionmakingFlow;
      const _case = await decisionmakingFlow?.case;
      title = _case?.shortTitle || _case?.title || "geen dossier titel gevonden";
    }
    return title;
  };

  async sendBackToSubmitterMail(submission, comment, meeting) {
    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.getSubmissionUrl(submission);
    const caseTitle = await this.getSubmissionCaseTitle(submission);

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      caseName: caseTitle,
      comment,
      meeting,
      submission
    };

    const submitterEmail = await caseSendBackEmail(params);
    const creator = await this.draftSubmissionService.getCreator(submission);
    const submitterEmailResource = await this.createMailRecord(creator.email, submitterEmail, true);

    await submitterEmailResource?.save();
  }

  async sendResubmissionMails(submission, comment, meeting) {
    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.getSubmissionUrl(submission);
    const submissionPieces = await submission.pieces;
    const hasConfidentialPieces = await containsConfidentialPieces(submissionPieces);
    const caseTitle = await this.getSubmissionCaseTitle(submission);

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      caseName: caseTitle,
      resubmitted: true,
      comment,
      submission,
      meeting,
      hasConfidentialPieces
    };

    // same mail for approvers and notification
    const creator = await this.draftSubmissionService.getCreator(submission);
    const approversEmail = await caseResubmittedApproversEmail(params);
    const approversMailResource = await this.createMailRecord(submission.approvalAddresses.join(','), approversEmail, false, [...submission.approvalAddresses, creator.email].join(','));
    const notificationEmail = await caseResubmittedIkwEmail(params);
    const ikwMailResource = await this.createMailRecord(submission.notificationAddresses.join(','), notificationEmail, true);

    const submitterEmail = await caseResubmittedSubmitterEmail(params);
    const submitterEmailResource = await this.createMailRecord(creator.email, submitterEmail, true);

    await Promise.all([
      approversMailResource?.save(),
      ikwMailResource?.save(),
      submitterEmailResource?.save(),
    ]);
  }

  async sendFirstSubmissionMails(submission, meeting) {
    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.getSubmissionUrl(submission);
    const submissionPieces = await submission.pieces;
    const hasConfidentialPieces = await containsConfidentialPieces(submissionPieces);
    const caseTitle = await this.getSubmissionCaseTitle(submission);

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      caseName: caseTitle,
      approvalComment: submission.approvalComment,
      notificationComment: submission.notificationComment,
      hasConfidentialPieces,
      meeting,
      submission
    };

    const creator = await this.draftSubmissionService.getCreator(submission);
    const approversMail = await caseSubmittedApproversEmail(params);
    const approversMailResource = await this.createMailRecord(submission.approvalAddresses.join(','), approversMail, false, [...submission.approvalAddresses, creator.email].join(','));

    const ikwMail = await caseSubmittedIkwEmail(params);
    const ikwMailResource = await this.createMailRecord(submission.notificationAddresses.join(','), ikwMail, true);

    const submitterMail = await caseSubmittedSubmitterEmail(params);
    const submitterMailResource = await this.createMailRecord(creator.email, submitterMail, true);

    await Promise.all([
      approversMailResource?.save(),
      ikwMailResource?.save(),
      submitterMailResource?.save(),
    ]);
  }

  async sendUpdateSubmissionMails(submission, meeting) {
    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.getSubmissionUrl(submission);
    const submissionPieces = await submission.pieces;
    const hasConfidentialPieces = await containsConfidentialPieces(submissionPieces);
    const caseTitle = await this.getSubmissionCaseTitle(submission);

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      caseName: caseTitle,
      approvalComment: submission.approvalComment,
      notificationComment: submission.notificationComment,
      hasConfidentialPieces,
      submission,
      meeting
    };

    const creator = await this.draftSubmissionService.getCreator(submission);
    const approversMail = await caseUpdateSubmissionApproversEmail(params);
    const approversMailResource = await this.createMailRecord(submission.approvalAddresses.join(','), approversMail, false, [...submission.approvalAddresses, creator.email].join(','));

    const ikwMail = await caseUpdateSubmissionIkwEmail(params);
    const ikwMailResource = await this.createMailRecord(submission.notificationAddresses.join(','), ikwMail, true);

    const submitterMail = await caseUpdateSubmissionSubmitterEmail(params);
    const submitterMailResource = await this.createMailRecord(creator.email, submitterMail, true);

    await Promise.all([
      approversMailResource?.save(),
      ikwMailResource?.save(),
      submitterMailResource?.save(),
    ]);
  }

  async sendRequestSendBackToSubmitterMail(submission, comment, meeting) {
    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.getSubmissionUrl(submission);
    const caseTitle = await this.getSubmissionCaseTitle(submission);

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      caseName: caseTitle,
      comment,
      meeting,
      submission
    };

    const treaterEmail = await caseRequestSendBackEmail(params);
    const { mailSettings } = await this.loadSettings();
    const treaterEmailResource = await this.createMailRecord(mailSettings?.cabinetSubmissionsSecretaryEmail, treaterEmail);

    await treaterEmailResource?.save();
  }

  // replyTo:
  // when mailing secretarie and KC also replyTo secretarie and KC
  // IKW shouldn't really need to reply, use the default for now (unsure if we need the "to" + default here)
  // when mailing creator, replyTo should be the default from settings so they reply to the secretarie
  async createMailRecord(to, mailObject, replyToDefault = false, overrideReplyTo) {
    const { mailSettings, outbox } = await this.loadSettings();
    if (mailSettings && outbox) {
      const replyTo = replyToDefault ? mailSettings.cabinetSubmissionsReplyToEmail : to;
      // just in case there is no "to" (like a creator without an email address).
      if (to?.length) {
        return this.store.createRecord('email', {
          to,
          from: mailSettings.defaultFromEmail,
          replyTo: overrideReplyTo ? overrideReplyTo : replyTo,
          folder: outbox,
          subject: mailObject.subject,
          message: mailObject.message,
        });
      }
      let message = "to: " + to + "\n";
      message += "replyTo: " + (overrideReplyTo ? overrideReplyTo : replyTo) + "\n";
      message += "subject: " + mailObject.subject + "\n";
      message += "message: " + mailObject.message + "\n";

      const mailErrorOptions = {
        title: this.intl.t('warning-title'),
        message: this.intl.t('mail-could-not-be-sent'),
        errorContent: message,
        showDatetime: true,
        options: {
          timeOut: 60 * 10 * 1000,
        },
      };
      this.toaster.show(CopyErrorToClipboardToast, mailErrorOptions);
      return;
    }
  }
}
