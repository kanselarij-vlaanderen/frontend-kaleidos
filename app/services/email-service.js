/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
export default class emailService extends Service {
  @service store;

  async sendEmail(from, to, subject, content, attachedPieces) {
    // TODO: refactor document selection logic before implementing attachments
    // const attachments = await this.store.query('file', {
    //   'filter[piece][:id:]': this.translateActivity.pieces.map((piece) => piece.id).join(','),
    //   // 'filter[format]': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    // });
    const folder = await this.store.findRecord('mail-folder', CONFIG.EMAIL.OUTBOX.ID);
    const email = await this.store.createRecord('email', {
      folder: folder,
      from: from,
      to: to,
      subject: subject,
      message: content,
    });
    if (attachedPieces) {
      const files = await Promise.all(attachedPieces.map((piece) => piece.file));
      email.set('attachments', files);
    }
    return email.save();
  }
}
