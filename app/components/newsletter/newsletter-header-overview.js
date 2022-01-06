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
  @tracked newsletterHTML = null;

  @tracked verifyingPublishAll = false;
  @tracked verifyingPublishBelga = false;
  @tracked verifyingPublishWeb = false;
  @tracked verifyingPublishMail = false;

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

  @task
  *publishToMail() {
    yield this.ensureMailCampaign();

    if (this.mailCampaign?.isSent) {
      this.toaster.error(this.intl.t('error-already-sent-newsletter'));
    } else {
      if (yield this.validateMailCampaign()) {
        try {
          yield this.newsletterService.sendMailCampaign(this.mailCampaign.campaignId);
          this.mailCampaign.set('sentAt', new Date());
          yield this.mailCampaign.save();
          yield this.args.meeting.belongsTo('mailCampaign').reload(); // TODO Why?
          this.toaster.success(this.intl.t('success-publish-newsletter-to-mail'));
        } catch(e) {
          this.toaster.error(
            this.intl.t('error-send-newsletter'),
            this.intl.t('warning-title')
          );
        }
      }
    }
    this.verifyingPublishMail = false;
  }

  @task
  *publishToBelga() {
    try {
      yield this.ensureMailCampaign();
      yield this.newsletterService.sendToBelga(this.args.agenda.id);
      this.toaster.success(this.intl.t('success-publish-newsletter-to-belga'));
    } catch(e) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
    }
    this.verifyingPublishBelga = false;
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
    } catch(e) {
      this.toaster.error(
        this.intl.t('error-publish-newsletter-to-web'),
        this.intl.t('warning-title')
      );
    }
    this.verifyingPublishWeb = false;
  }

  @task
  *publishToAll() {
    yield this.publishToMail.perform();
    // Although belga is independent of mailchimp, if there is no valid campaign we should maybe avoid sending belga
    // Specific example: no newsletters (for notes) present! we need at least one note to avoid an empty mail/belga
    // A different example is a note without themes, valid for belga but not for mailchimp (no recipients)
    yield this.publishToBelga.perform();
    yield this.publishToWeb.perform();

    this.verifyingPublishAll = false;
  }

  async validateMailCampaign() {
    if (this.mailCampaign && this.mailCampaign.campaignId) {
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
    } else {
      return false;
    }
  }

  async ensureMailCampaign() {
    if (!this.mailCampaign) {
      this.mailCampaign = await this.newsletterService.createCampaign(this.args.agenda, this.args.meeting);
    }
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
    yield this.ensureMailCampaign();
    try {
      yield this.newsletterService.downloadBelgaXML(this.args.agenda.id);
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-download-XML'),
        this.intl.t('warning-title')
      );
    }
  }

  @task
  *loadNewsletterHTML() {
    yield this.ensureMailCampaign();
    try {
      const html = yield this.newsletterService.getMailCampaignContent(this.mailCampaign.campaignId);
      this.newsletterHTML = html.body;
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
    }
  }
  */

  @action
  clearNewsletterHTML() {
    this.newsletterHTML = null;
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
}
