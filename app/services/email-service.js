/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
export default class emailService extends Service {
  @service store;

  /**
   * Get case title.
   *
   * @param _case
   * @returns {*}
   */
  async sendEmail(from, to, subject, content, attachedPieces) {
    // TODO: refactor document selection logic before implementing attachments
    // const attachments = await this.store.query('file', {
    //   'filter[piece][:id:]': this.translateActivity.pieces.map((piece) => piece.id).join(','),
    //   // 'filter[format]': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    // });
    const folder = await this.store.findRecord('email-folder', CONFIG.EMAIL.OUTBOX.ID);
    alert('Email infra not working yet. Check console for email details.');
    console.info('from', from);
    console.info('to', to);
    console.info('subject', subject);
    console.info('content', content);
    console.info('attachedPieces', attachedPieces);
    const email = await this.store.createRecord('email', {
      folder: folder,
      from: from,
      to: to,
      subject: subject,
      content: content,
      // htmlContent: ??
      // TODO: establish HTML-template and save to property 'html' instead
    });
    if (attachedPieces) {
      const files = attachedPieces.map((piece) => piece.file);
      email.set('attachments', files);
    }
    email.save();
  }
}
