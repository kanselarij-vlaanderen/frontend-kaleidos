import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';

export default class SettingsEmailsDebugController extends Controller {
  @service configService;
  @service toaster;
  @service intl;
  @tracked showLoader = false;

  @tracked subject = '';
  @tracked content = '';
  @tracked pieceId;
  @tracked toMailAddress = '';

  @action
  async sendTestMail() {
    this.showLoader = true;

    if (this.pieceId) {
      const piece = await this.store.findRecord('piece', this.pieceId);
      await this.sendEmail(CONFIG.EMAIL.DEFAULT_FROM, this.toMailAddress, this.subject, this.content, [piece, piece]);
    } else {
      await this.sendEmail(CONFIG.EMAIL.DEFAULT_FROM, this.toMailAddress, this.subject, this.content);
    }
    this.subject = '';
    this.content = '';
    this.pieceId = null;
    this.toMailAddress = '';
    this.toaster.success(this.intl.t('sent-test-mail'), this.intl.t('sent-test-mail'));
    this.showLoader = false;
  }

  async sendEmail(from, to, subject, plainTextMessage, attachments) {
    const folder = await this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX);
    const email = this.store.createRecord('email', {
      folder: folder,
      from: from,
      to: to,
      subject: subject,
      message: plainTextMessage,
      attachments,
    });
    return await email.save();
  }

  @action
  async onChangeSubject(event) {
    this.subject = event.target.value;
  }
  @action
  async onChangePieceId(event) {
    this.pieceId = event.target.value;
  }

  @action
  async onChangeContent(event) {
    this.content = event.target.value;
  }
  @action
  async onchangeTargetMailAddress(event) {
    this.toMailAddress = event.target.value;
  }
}
