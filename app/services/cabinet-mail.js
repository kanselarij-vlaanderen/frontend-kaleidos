import Service, { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import {
  caseResubmittedEmail,
  caseResubmittedSubmitterEmail,
  caseSendBackEmail,
  caseSubmittedApproversEmail,
  caseSubmittedIkwEmail,
  caseSubmittedSubmitterEmail,
  caseUpdateSubmissionApproversEmail,
  caseUpdateSubmissionIkwEmail,
  caseUpdateSubmissionSubmitterEmail,
} from 'frontend-kaleidos/utils/cabinet-submission-email';

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

  async sendBackToSubmitterMail(submission, comment) {
    const { mailSettings, outbox } = await this.loadSettings();
    if (mailSettings && outbox) {
      const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
      const submissionUrl = this.getSubmissionUrl(submission);
      const meeting = await submission.meeting;

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        comment,
        meeting,
        submission
      };

      const mail = await caseSendBackEmail(params);
      const creator = await this.draftSubmissionService.getCreator(submission);
      const mailResource = this.store.createRecord('email', {
        to: creator.email,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: mail.subject,
        message: mail.message,
      });

      await mailResource.save();
    }
  }

  async sendResubmissionMails(submission, comment, meeting) {
    const { mailSettings, outbox } = await this.loadSettings();
    if (mailSettings && outbox) {
      const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
      const submissionUrl = this.getSubmissionUrl(submission);

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        comment,
        submission,
        meeting
      };

      const notificationEmail = await caseResubmittedEmail(params);
      const submitterEmail = await caseResubmittedSubmitterEmail(params);

      const approversMailResource = this.store.createRecord('email', {
        to: submission.approvalAddresses.join(','),
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: notificationEmail.subject,
        message: notificationEmail.message,
      });

      const notificationEmailResource = this.store.createRecord('email', {
        to: submission.notificationAddresses.join(','),
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: notificationEmail.subject,
        message: notificationEmail.message,
      });

      const creator = await this.draftSubmissionService.getCreator(submission);
      const submitterEmailResource = this.store.createRecord('email', {
        to: creator.email,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: submitterEmail.subject,
        message: submitterEmail.message,
      });

      await Promise.all([
        approversMailResource.save(),
        notificationEmailResource.save(),
        submitterEmailResource.save(),
      ]);
    }
  }

  async sendFirstSubmissionMails(submission, meeting) {
    const { mailSettings } = await this.loadSettings();
    const { outbox } = await this.loadSettings();
    if (outbox) {
      const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
      const submissionUrl = this.getSubmissionUrl(submission);

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        approvalComment: submission.approvalComment,
        notificationComment: submission.notificationComment,
        meeting,
        submission
      };

      const approversMail = await caseSubmittedApproversEmail(params);
      const ikwMail = await caseSubmittedIkwEmail(params);
      const submitterMail = await caseSubmittedSubmitterEmail(params);

      const approversMailResource = this.store.createRecord('email', {
        to: submission.approvalAddresses.join(','),
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: approversMail.subject,
        message: approversMail.message,
      });

      const notificationEmailResource = this.store.createRecord('email', {
        to: submission.notificationAddresses.join(','),
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: ikwMail.subject,
        message: ikwMail.message,
      });

      const creator = await this.draftSubmissionService.getCreator(submission);
      const submitterMailResource = this.store.createRecord('email', {
        to: creator.email,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: submitterMail.subject,
        message: submitterMail.message,
      });

      await Promise.all([
        approversMailResource.save(),
        notificationEmailResource.save(),
        submitterMailResource.save(),
      ]);
    }
  }

  async sendUpdateSubmissionMails(submission, meeting) {
    const { mailSettings, outbox } = await this.loadSettings();

    if (mailSettings && outbox) {
      const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
      const submissionUrl = this.getSubmissionUrl(submission);

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        approvalComment: submission.approvalComment,
        notificationComment: submission.notificationComment,
        submission,
        meeting
      };

      const approversMail = await caseUpdateSubmissionApproversEmail(params);
      const ikwMail = await caseUpdateSubmissionIkwEmail(params);
      const submitterMail = await caseUpdateSubmissionSubmitterEmail(params);

      const approversMailResource = this.store.createRecord('email', {
        to: submission.approvalAddresses.join(','),
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: approversMail.subject,
        message: approversMail.message,
      });

      const notificationEmailResource = this.store.createRecord('email', {
        to: submission.notificationAddresses.join(','),
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: ikwMail.subject,
        message: ikwMail.message,
      });

      const creator = await this.draftSubmissionService.getCreator(submission);
      const submitterMailResource = this.store.createRecord('email', {
        to: creator.email,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: submitterMail.subject,
        message: submitterMail.message,
      });

      await Promise.all([
        approversMailResource.save(),
        notificationEmailResource.save(),
        submitterMailResource.save(),
      ]);
    }
  }
}
