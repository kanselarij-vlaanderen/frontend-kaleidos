import Service, { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import {
  caseSubmittedApproversEmail,
  caseSubmittedIkwEmail,
  caseSubmittedSubmitterEmail,
} from 'frontend-kaleidos/utils/cabinet-submission-email';

export default class CabinetMailService extends Service {
  @service store;
  @service router;
  @service toaster;
  @service intl;

  async sendFirstSubmissionMails(
    mailSettings,
    submission,
    submitter,
    approverAddresses,
    notifiedAddresses
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
      approversComment: submission.approvalComment,
      ikwComment: submission.notificationComment,
    };

    const approversMail = caseSubmittedApproversEmail(params);
    const ikwMail = caseSubmittedIkwEmail(params);
    const submitterMail = caseSubmittedSubmitterEmail(params);

    const approversMailResources = approverAddresses.map((address) =>
      this.store.createRecord('email', {
        to: address,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: approversMail.subject,
        message: approversMail.message,
      })
    );

    const ikwMailResources = notifiedAddresses.map((address) =>
      this.store.createRecord('email', {
        to: address,
        from: mailSettings.defaultFromEmail,
        folder: outbox,
        subject: ikwMail.subject,
        message: ikwMail.message,
      })
    );

    const submitterMailResource = this.store.createRecord('email', {
      to: submitter.email,
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
