import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONFIG from 'fe-redpencil/app/utils/config';

export default class SettingsEmailDebugController extends Controller {
  @service configService;
  @service mailService;
  @tracked showLoader = false;

  @tracked subject = '';
  @tracked content = '';
  @tracked toMailAddress = '';

  @action
  async sendTestMail() {
    this.showLoader = true;
    await this.mailService.sendEmail(CONFIG.EMAIL.DEFAULT_FROM, this.toMailAddress, this.subject, this.content);
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
