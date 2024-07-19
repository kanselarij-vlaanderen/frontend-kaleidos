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

  async sendBackToSubmitterMail(submission, comment) {
    const [mailSettings, outbox] = await Promise.all([
      this.store.queryOne('email-notification-setting'),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
    ]);

    if (!(mailSettings && outbox)) {
      this.toaster.warning(
        this.intl.t('notification-mails-could-not-be-sent'),
        this.intl.t('warning-title')
      );
      return;
    }

    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.router.urlFor(
      'cases.submissions.submission',
      submission
    );

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      submissionTitle: submission.shortTitle,
      caseName: submission.title,
      comment,
    };

    const mail = caseSendBackEmail(params);

    const mailResource = this.store.createRecord('email', {
      to: submission.creator.email,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      subject: mail.subject,
      message: mail.message,
    });

    await mailResource.save();
  }

  async sendResubmissionMails(submission, comment) {
    const [mailSettings, outbox] = await Promise.all([
      this.store.queryOne('email-notification-setting'),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
    ]);

    if (!(mailSettings && outbox)) {
      this.toaster.warning(
        this.intl.t('notification-mails-could-not-be-sent'),
        this.intl.t('warning-title')
      );
      return;
    }

    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.router.urlFor(
      'cases.submissions.submission',
      submission
    );

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      submissionTitle: submission.shortTitle,
      caseName: submission.title,
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

    const submitterEmailResource = this.store.createRecord('email', {
      to: submission.creator.email,
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

  async sendFirstSubmissionMails(
    mailSettings,
    submission,
  ) {
    const outbox = await this.store.findRecordByUri(
      'mail-folder',
      PUBLICATION_EMAIL.OUTBOX
    );

    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.router.urlFor(
      'cases.submissions.submission',
      submission
    );

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      submissionTitle: submission.shortTitle,
      caseName: submission.title,
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

    const creator = await submission.creator;
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

  async sendUpdateSubmissionMails(submission) {
    const [mailSettings, outbox] = await Promise.all([
      this.store.queryOne('email-notification-setting'),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
    ]);

    if (!(mailSettings && outbox)) {
      this.toaster.warning(
        this.intl.t('notification-mails-could-not-be-sent'),
        this.intl.t('warning-title')
      );
      return;
    }

    const hostUrlPrefix = `${window.location.protocol}//${window.location.host}`;
    const submissionUrl = this.router.urlFor(
      'cases.submissions.submission',
      submission
    );

    const params = {
      submissionUrl: `${hostUrlPrefix}${submissionUrl}`,
      submissionTitle: submission.shortTitle,
      caseName: submission.title,
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

    const creator = await submission.creator;
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
