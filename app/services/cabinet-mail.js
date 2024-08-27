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

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        submissionTitle: submission.shortTitle,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        comment,
      };

      const mail = caseSendBackEmail(params);
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

  async sendResubmissionMails(submission, comment) {
    const { mailSettings, outbox } = await this.loadSettings();
    if (mailSettings && outbox) {
      const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
      const submissionUrl = this.getSubmissionUrl(submission);

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        submissionTitle: submission.shortTitle,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        comment,
      };

      const notificationEmail = caseResubmittedEmail(params);
      const submitterEmail = caseResubmittedSubmitterEmail(params);

      const notificationEmailResources = [
        ...submission.approvalAddresses,
        ...submission.notificationAddresses,
      ].map((address) =>
        this.store.createRecord('email', {
          to: address,
          from: mailSettings.defaultFromEmail,
          folder: outbox,
          subject: notificationEmail.subject,
          message: notificationEmail.message,
        })
      );
      const creator = await this.draftSubmissionService.getCreator(submission);
      const submitterEmailResource = this.store.createRecord('email', {
        to: creator.email,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: submitterEmail.subject,
        message: submitterEmail.message,
      });

      await Promise.all([
        ...notificationEmailResources.map((resource) => resource.save()),
        submitterEmailResource.save(),
      ]);
    }
  }

  async sendFirstSubmissionMails(submission) {
    const { mailSettings } = await this.loadSettings();
    const { outbox } = await this.loadSettings();
    if (outbox) {
      const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
      const submissionUrl = this.getSubmissionUrl(submission);

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        submissionTitle: submission.shortTitle,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        approvalComment: submission.approvalComment,
        notificationComment: submission.notificationComment,
      };

      const approversMail = caseSubmittedApproversEmail(params);
      const ikwMail = caseSubmittedIkwEmail(params);
      const submitterMail = caseSubmittedSubmitterEmail(params);

      const approversMailResources = submission.approvalAddresses.map((address) =>
        this.store.createRecord('email', {
          to: address,
          from: mailSettings.defaultFromEmail,
          folder: outbox,
          subject: approversMail.subject,
          message: approversMail.message,
        })
      );

      const ikwMailResources = submission.notificationAddresses.map((address) =>
        this.store.createRecord('email', {
          to: address,
          from: mailSettings.defaultFromEmail,
          folder: outbox,
          subject: ikwMail.subject,
          message: ikwMail.message,
        })
      );

      const creator = await this.draftSubmissionService.getCreator(submission);
      const submitterMailResource = this.store.createRecord('email', {
        to: creator.email,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: submitterMail.subject,
        message: submitterMail.message,
      });

      await Promise.all([
        ...approversMailResources.map((resource) => resource.save()),
        ...ikwMailResources.map((resource) => resource.save()),
        submitterMailResource.save(),
      ]);
    }
  }

  async sendUpdateSubmissionMails(submission) {
    const { mailSettings, outbox } = await this.loadSettings();

    if (mailSettings && outbox) {
      const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
      const submissionUrl = this.getSubmissionUrl(submission);

      const params = {
        submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
        submissionTitle: submission.shortTitle,
        caseName: submission.decisionmakingFlowTitle || "geen titel WIP",
        approvalComment: submission.approvalComment,
        notificationComment: submission.notificationComment,
      };

      const approversMail = caseUpdateSubmissionApproversEmail(params);
      const ikwMail = caseUpdateSubmissionIkwEmail(params);
      const submitterMail = caseUpdateSubmissionSubmitterEmail(params);

      const approversMailResources = submission.approvalAddresses.map((address) =>
        this.store.createRecord('email', {
          to: address,
          from: mailSettings.defaultFromEmail,
          folder: outbox,
          subject: approversMail.subject,
          message: approversMail.message,
        })
      );

      const ikwMailResources = submission.notificationAddresses.map((address) =>
        this.store.createRecord('email', {
          to: address,
          from: mailSettings.defaultFromEmail,
          folder: outbox,
          subject: ikwMail.subject,
          message: ikwMail.message,
        })
      );

      const creator = await this.draftSubmissionService.getCreator(submission);
      const submitterMailResource = this.store.createRecord('email', {
        to: creator.email,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: submitterMail.subject,
        message: submitterMail.message,
      });

      await Promise.all([
        ...approversMailResources.map((resource) => resource.save()),
        ...ikwMailResources.map((resource) => resource.save()),
        submitterMailResource.save(),
      ]);
    }
  }
}
