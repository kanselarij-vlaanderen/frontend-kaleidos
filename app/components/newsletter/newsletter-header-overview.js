import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
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
  @tracked verifyingPublishMail = false;

  @tracked isLoading = false;

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
  async publishToMail() {
    this.isLoading = true;

    if (!this.mailCampaign) {
      await this.createMailCampaign();
    }

    if (this.mailCampaign?.isSent) {
      this.toaster.error(this.intl.t('error-already-sent-newsletter'));
    } else {
      if (await this.validateMailCampaign()) {
        await this.publishToMailAndSaveCampaign();
      }
    }

    this.isLoading = false;
    this.toggleVerifyingPublishMail();
  }

  @action
  async publishToBelga() {
    this.isLoading = true;

    if (!this.mailCampaign) {
      await this.createMailCampaign();
    }
    await this.publishNewsletterToBelga();

    this.isLoading = false;
    this.toggleVerifyingPublishBelga();
  }

  @action
  async publishToAll() {
    this.isLoading = true;

    if (!this.mailCampaign) {
      await this.createMailCampaign();
    }

    if (this.mailCampaign?.isSent) {
      this.toaster.error(this.intl.t('error-already-sent-newsletter'));
    } else {
      if (await this.validateMailCampaign()) {
        await this.publishToMailAndSaveCampaign();
        // Although belga is independent of mailchimp, if there is no valid campaign we should maybe avoid sending belga
        // Specific example: no newsletters (for notes) present! we need at least one note to avoid an empty mail/belga
        // A different example is a note without themes, valid for belga but not for mailchimp (no recipients)
      }
      await this.publishNewsletterToBelga();
      // For valvas, we should be able to send a valvas push as long as there is at least 1 note or announcement.
    }

    this.isLoading = false;
    this.toggleVerifyingPublishAll();
  }

  async validateMailCampaign() {
    if (!this.mailCampaign?.campaignId) {
      return false;
    }
    const campaign = await this.newsletterService
      .getMailCampaign(this.mailCampaign.campaignId)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-fetch-newsletter'),
          this.intl.t('warning-title')
        );
        return false;
      });

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
    }
    // campaign is valid
    return true;
  }

  async publishNewsletterToBelga() {
    await this.newsletterService
      .sendToBelga(this.args.agenda.id)
      .then(() => {
        this.toaster.success(
          this.intl.t('success-publish-newsletter-to-belga')
        );
      })
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-send-newsletter'),
          this.intl.t('warning-title')
        );
      });
  }

  async publishToMailAndSaveCampaign() {
    await this.newsletterService
      .sendMailCampaign(this.mailCampaign.campaignId)
      .then(() => {
        this.toaster.success(this.intl.t('success-publish-newsletter-to-mail'));
      })
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-send-newsletter'),
          this.intl.t('warning-title')
        );
      });

    this.mailCampaign.set('sentAt', moment().utc().toDate());
    await this.mailCampaign.save();
  }

  async createMailCampaign() {
    this.mailCampaign = await this.newsletterService.createCampaign(
      this.args.agenda,
      this.args.meeting
    );
  }

  // TODO These are for developers use - in comments for follow up
  @action
  async deleteCampaign() {
    this.isLoading = true;
    const meeting = this.args.meeting;

    if (this.mailCampaign?.campaignId) {
      await this.newsletterService.deleteCampaign(this.mailCampaign.campaignId);
    }
    this.mailCampaign.destroyRecord();
    const reloadedMeeting = await this.store.findRecord('meeting', meeting.id, {
      reload: true,
    });
    reloadedMeeting.mailCampaign = null;

    await reloadedMeeting.save();
    await this.loadMailCampaign.perform();
    this.isLoading = false;
  }
  /*
  @action
  async downloadBelgaXML() {
    this.isLoading = true;

    if (!this.mailCampaign) {
      await this.createMailCampaign();
    }

    await this.newsletterService
      .downloadBelgaXML(this.args.agenda.id)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-download-XML'),
          this.intl.t('warning-title')
        );
      });
    this.isLoading = false;
  }
  @action
  async showNewsletter() {
    this.loadingNewsletter = true;

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
