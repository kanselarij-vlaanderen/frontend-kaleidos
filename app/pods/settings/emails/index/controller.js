import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import {
  action,
  set
} from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class SettingsEmailController extends Controller {
  @service configService;
  @tracked showLoader = false;

  @tracked footerKey = 'email:footer';
  @tracked footer = '';
  @tracked emails = [
    {
      subjectKey: 'email:translationRequest:subject',
      contentKey: 'email:translationRequest:content',
      mailKey: 'email:translationRequest:to',
      title: 'vertalingsaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.translationRequest.subject,
      content: '',
      defaultContent: CONFIG.mail.translationRequest.content,
      to: '',
      defaultTo: CONFIG.EMAIL.TO.translationsEmail,
    },
    {
      subjectKey: 'email:publishPreviewRequest:subject',
      contentKey: 'email:publishPreviewRequest:content',
      mailKey: 'email:publishPreviewRequest:to',
      title: 'drukproefaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.publishPreviewRequest.subject,
      content: '',
      defaultContent: CONFIG.mail.publishPreviewRequest.content,
      to: '',
      defaultTo: CONFIG.EMAIL.TO.publishpreviewEmail,
    },
    {
      subjectKey: 'email:publishRequest:subject',
      contentKey: 'email:publishRequest:content',
      mailKey: 'email:publishRequest:to',
      title: 'publicatieaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.publishRequest.subject,
      content: '',
      defaultContent: CONFIG.mail.publishRequest.content,
      to: '',
      defaultTo: CONFIG.EMAIL.TO.publishEmail,
    },
    {
      subjectKey: 'email:withdrawalTranslation:subject',
      contentKey: 'email:withdrawalTranslation:content',
      mailKey: 'email:withdrawalTranslation:to',
      title: 'terugtrekking vertalingsaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.withdrawalTranslation.subject,
      content: '',
      defaultContent: CONFIG.mail.publishRequest.content,
      to: '',
      defaultTo: CONFIG.EMAIL.TO.activityWithdrawTranslationsEmail,
    },
    {
      subjectKey: 'email:withdrawalPublishPreview:subject',
      contentKey: 'email:withdrawalPublishPreview:content',
      mailKey: 'email:withdrawalPublishPreview:to',
      title: 'terugtrekking drukproefaanvraag',
      subject: '',
      defaultSubject: CONFIG.mail.withdrawalPublishPreview.subject,
      content: '',
      defaultContent: CONFIG.mail.withdrawalPublishPreview.content,
      to: '',
      defaultTo: CONFIG.EMAIL.TO.activityWithdrawPublishPreviewEmail,
    }
  ];

  constructor() {
    super(...arguments);
    for (let index = 0; index < this.emails.length; index++) {
      const item = this.emails[index];
      const configSubject = this.getConfig(item.subjectKey, item.defaultSubject).then((result) => result);
      set(item, 'subject', configSubject);
      const configContent = this.getConfig(item.contentKey, item.defaultContent).then((result) => result);
      set(item, 'message', configContent);
      const toMailAddress = this.getConfig(item.mailKey, item.defaultTo).then((result) => result);
      set(item, 'to', toMailAddress);
    }
    this.footer = this.configService.get(this.footerKey, CONFIG.mail.defaultFooter);
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
      await this.configService.set(email.contentKey, await email.message);
      await this.configService.set(email.mailKey, await email.to);
    }
    await this.configService.set(this.footerKey, await this.footer);
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
  async setFooterContent(event) {
    this.footer = event.target.value;
  }

  @action
  async setMailTo(mail, event) {
    const mailCopy = this.emails;
    for (let index = 0; index < mailCopy.length; index++) {
      const item = mailCopy[index];
      if (item.subjectKey === mail.subjectKey) {
        set(item, 'to', event.target.value);
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
        await set(item, 'content', event.target.value);
      }
    }
    await this.set('emails', mailCopy);
  }
}
