/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
export default class emailService extends Service {
  @service store;

  /**
   * Get case title.
   *
   * @param _case
   * @returns {*}
   */
  sendEmail(from, to, subject, content, attachedPieces) {
    // Prepare email
    // TODO: refactor document selection logic before implementing attachments
    // const attachments = await this.store.query('file', {
    //   'filter[piece][:id:]': this.translateActivity.pieces.map((piece) => piece.id).join(','),
    //   // 'filter[format]': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    // });
    alert('Email infra not working yet. Check console for email details.');
    console.info('from', from);
    console.info('to', to);
    console.info('subject', subject);
    console.info('content', content);
    console.info('attachedPieces', attachedPieces);
    const email = this.store.createRecord('email', {
      // TODO: link the created mail to an outgoing mail-folder
      // TODO: establish from/to mailing list mgmt
      from: from,
      to: to,
      subject: subject,
      content: content, // TODO: establish HTML-template and save to property 'html' instead
      // attachments,
    });
    email.save(); // Can go in background
  }
}
