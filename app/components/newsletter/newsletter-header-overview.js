import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument {Meeting} meeting
 * @argument {Agenda} agenda
 */
export default class NewsletterHeaderOverviewComponent extends Component {
  @service intl;
  @service store;
  @service router;
  @service toaster;
  @service newsletterService;
  @service currentSession;

  @tracked mailCampaign;

  @tracked verifyingPublishAll = false;
  @tracked verifyingPublishBelga = false;
  @tracked verifyingPublishWeb = false;
  @tracked verifyingPublishMail = false;

  @tracked newsletterHTML = null;
  @tracked loadingNewsletter = false;

  constructor() {
    super(...arguments);
    this.loadMailCampaign.perform();
  }

  @task
  *loadMailCampaign() {
    this.mailCampaign = yield this.args.meeting.mailCampaign;
  }

  get shouldShowPrintButton() {
    return this.router.currentRouteName.includes('newsletter.print');
  }

  @action
  print() {
    window.print();
  }

  @action
  toggleVerifyingPublishAll() {
    this.verifyingPublishAll = !this.verifyingPublishAll;
  }

  @action
  toggleVerifyingPublishMail() {
    this.verifyingPublishMail = !this.verifyingPublishMail;
  }

  @action
  toggleVerifyingPublishBelga() {
    this.verifyingPublishBelga = !this.verifyingPublishBelga;
  }

  @action
  toggleVerifyingPublishWeb() {
    this.verifyingPublishWeb = !this.verifyingPublishWeb;
  }

  @task
  *publishToMail() {
    if (!this.mailCampaign) {
      yield this.createMailCampaign();
    }

    if (this.mailCampaign?.isSent) {
      this.toaster.error(this.intl.t('error-already-sent-newsletter'));
    } else {
      if (yield this.validateMailCampaign()) {
        yield this.publishToMailAndSaveCampaign();
      }
    }

    this.toggleVerifyingPublishMail();
  }

  @task
  *publishToBelga() {
    if (!this.mailCampaign) {
      yield this.createMailCampaign();
    }
    yield this.publishNewsletterToBelga();
    this.toggleVerifyingPublishBelga();
  }

  @task
  *publishToWeb() {
    try {
      const themisPublicationActivity = this.store.createRecord('themis-publication-activity', {
        startDate: new Date(),
        meeting: this.args.meeting,
        scope: [CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS]
      });
      yield themisPublicationActivity.save();
      this.toaster.success(this.intl.t('success-publish-newsletter-to-web'));
      this.toggleVerifyingPublishWeb();
    } catch(e) {
      this.toaster.error(this.intl.t('error-publish-newsletter-to-web'));
    }
  }

  @task
  *publishToAll() {
    if (!this.mailCampaign) {
      yield this.createMailCampaign();
    }

    if (this.mailCampaign?.isSent) {
      this.toaster.error(this.intl.t('error-already-sent-newsletter'));
    } else {
      if (yield this.validateMailCampaign()) {
        yield this.publishToMailAndSaveCampaign();
        // Although belga is independent of mailchimp, if there is no valid campaign we should maybe avoid sending belga
        // Specific example: no newsletters (for notes) present! we need at least one note to avoid an empty mail/belga
        // A different example is a note without themes, valid for belga but not for mailchimp (no recipients)
      }
      yield this.publishNewsletterToBelga();
      // For valvas, we should be able to send a valvas push as long as there is at least 1 note or announcement.
    }

    this.toggleVerifyingPublishAll();
  }

  async validateMailCampaign() {
    if (!this.mailCampaign?.campaignId) {
      return false;
    }

    try {
      const campaign = await this.newsletterService.getMailCampaign(this.mailCampaign.campaignId);
      const threshold = 10;

      if (
        Math.abs(
          moment(campaign.body.create_time).diff(moment(Date.now()), 'minutes')
        ) > threshold
      ) {
        this.toaster.error(
          this.intl.t('error-old-newsletter'),
          this.intl.t('warning-title'),
          {
            timeOut: 600000,
          }
        );
        return false;
      } else {
        return true;
      }
    } catch(e) {
      this.toaster.error(
        this.intl.t('error-fetch-newsletter'),
        this.intl.t('warning-title')
      );
      return false;
    }
  }

  async publishNewsletterToBelga() {
    try {
      await this.newsletterService.sendToBelga(this.args.agenda.id);
      this.toaster.success(this.intl.t('success-publish-newsletter-to-belga'));
    } catch(e) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
    }
  }

  async publishToMailAndSaveCampaign() {
    try {
      await this.newsletterService.sendMailCampaign(this.mailCampaign.campaignId);
      this.mailCampaign.set('sentAt', new Date());
      await this.mailCampaign.save();
      await this.args.meeting.belongsTo('mailCampaign').reload();
      this.toaster.success(this.intl.t('success-publish-newsletter-to-mail'));
    } catch(e) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
    }
  }

  async createMailCampaign() {
    this.mailCampaign = await this.newsletterService.createCampaign(this.args.agenda, this.args.meeting);
  }

  @task
  *deleteCampaign() {
    const meeting = this.args.meeting;

    if (this.mailCampaign?.campaignId) {
      yield this.newsletterService.deleteCampaign(this.mailCampaign.campaignId);
    }
    this.mailCampaign.destroyRecord();
    const reloadedMeeting = yield this.store.findRecord('meeting', meeting.id, {
      reload: true,
    });
    reloadedMeeting.mailCampaign = null;

    yield reloadedMeeting.save();
    yield this.loadMailCampaign.perform();
  }

  // TODO These are for developers use - in comments for follow up
  /*
  @task
  *downloadBelgaXML() {
    if (!this.mailCampaign) {
      yield this.createMailCampaign();
    }

    yield this.newsletterService
      .downloadBelgaXML(this.args.agenda.id)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-download-XML'),
          this.intl.t('warning-title')
        );
      });
  }

  @action
  async showNewsletter() {
    this.loadingNewsletter = true;

    const meeting = this.args.meeting;
    const mailCampaign = await meeting.get('mailCampaign');

    if (!this.mailCampaign) {
      await this.createMailCampaign();
    }

    const html = await this.newsletterService
      .getMailCampaignContent(this.mailCampaign.campaignId)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-send-newsletter'),
          this.intl.t('warning-title')
        );
      });
    this.newsletterHTML = html.body;
    this.loadingNewsletter = false;
  }

  @action
  async clearNewsletterHTML() {
    this.newsletterHTML = null;
    this.loadingNewsletter = false;
  }
 */
}
