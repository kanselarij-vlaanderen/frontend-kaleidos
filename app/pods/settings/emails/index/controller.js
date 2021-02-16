import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import {
  action,
  set
} from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default class SettingsEmailController extends Controller {
  @service configService;
  @tracked showLoader = false;
  @tracked emails = [
    {
      subjectKey: 'email:translationRequest:subject',
      contentKey: 'email:translationRequest:content',
      title: 'vertalingsaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.translationRequest.subject,
      content: '',
      defaultContent: CONFIG.mail.translationRequest.content,
    },
    {
      subjectKey: 'email:publishPreviewRequest:subject',
      contentKey: 'email:publishPreviewRequest:content',
      title: 'drukproefaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.publishPreviewRequest.subject,
      content: '',
      defaultContent: CONFIG.mail.publishPreviewRequest.content,
    },
    {
      subjectKey: 'email:publishRequest:subject',
      contentKey: 'email:publishRequest:content',
      title: 'publicatieaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.publishRequest.subject,
      content: '',
      defaultContent: CONFIG.mail.publishRequest.content,
    },
    {
      subjectKey: 'email:withdrawalTranslation:subject',
      contentKey: 'email:withdrawalTranslation:content',
      title: 'terugtrekking vertalingsaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.withdrawalTranslation.subject,
      content: '',
      defaultContent: CONFIG.mail.publishRequest.content,
    },
    {
      subjectKey: 'email:withdrawalPublishPreview:subject',
      contentKey: 'email:withdrawalPublishPreview:content',
      title: 'terugtrekking drukproefaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.withdrawalPublishPreview.subject,
      content: '',
      defaultContent: CONFIG.mail.withdrawalPublishPreview.content,
    }
  ];

  constructor() {
    super(...arguments);
    for (let index = 0; index < this.emails.length; index++) {
      const item = this.emails[index];
      const configSubject = this.getConfig(item.subjectKey, item.defaultSubject).then((result) => result);
      set(item, 'subject', configSubject);
      const configContent = this.getConfig(item.contentKey, item.defaultContent).then((result) => result);
      set(item, 'content', configContent);
    }
  }

  async getConfig(name, defaultValue) {
    return await this.configService.get(name, defaultValue);
  }

  async setConfig(name, value) {
    return await this.configService.set(name, value);
  }

  @action
  async saveSettings() {
    this.showLoader = true;
    for (let index = 0; index < this.emails.length; index ++) {
      const email = this.emails[index];
      await this.configService.set(email.subjectKey, await email.subject);
      await this.configService.set(email.contentKey, await email.content);
    }
    this.showLoader = false;
  }

  @action
  async setMailSubject(mail, event) {
    const mailCopy = this.emails;
    for (let index = 0; index < mailCopy.length; index++) {
      const item = mailCopy[index];
      if (item.subjectKey === mail.subjectKey) {
        set(item, 'subject', event.target.value);
      }
    }
    this.set('emails', mailCopy);
  }

  @action
  async setMailContent(mail, event) {
    const mailCopy = this.emails;
    for (let index = 0; index < mailCopy.length; index++) {
      const item = mailCopy[index];
      if (item.contentKey === mail.contentKey) {
        console.log(event.target.value);
        await set(item, 'content', event.target.value);
      }
    }
    console.log(mailCopy);
    await this.set('emails', mailCopy);
  }
}
