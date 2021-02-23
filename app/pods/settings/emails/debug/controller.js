import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class SettingsEmailsDebugController extends Controller {
  @service configService;
  @service emailService;
  @service toaster;
  @service intl;
  @tracked showLoader = false;

  @tracked subject = '';
  @tracked content = '';
  @tracked toMailAddress = '';

  @action
  async sendTestMail() {
    this.showLoader = true;
    await this.emailService.sendEmail(CONFIG.EMAIL.DEFAULT_FROM, this.toMailAddress, this.subject, this.content);
    this.subject = '';
    this.content = '';
    this.toMailAddress = '';
    this.toaster.success(this.intl.t('sent-test-mail'), this.intl.t('sent-test-mail'));
    this.showLoader = false;
  }
  @action
  async onChangeSubject(event) {
    this.subject = event.target.value;
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
