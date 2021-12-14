import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

  @tracked verifyingPublishAll = false;
  @tracked verifyingPublishBelga = false;
  @tracked verifyingPublishMail = false;

  @tracked isLoading = false;

  @tracked newsletterHTML = null;
  @tracked loadingNewsletter = false;

  shouldShowPrintButton() {
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
  async deleteCampaign() {
    this.isLoading = true;
    const meeting = this.args.meeting;
    const mailCampaign = await meeting.mailCampaign;

    if (!mailCampaign) {
      this.toaster.error(this.intl.t('error-delete-no-newsletter'));
      this.isLoading = false;
      return;
    }

    if (mailCampaign && mailCampaign.campaignId) {
      await this.newsletterService.deleteCampaign(mailCampaign.campaignId);
    }
    mailCampaign.destroyRecord();
    const reloadedMeeting = await this.store.findRecord('meeting', meeting.id, {
      reload: true,
    });
    reloadedMeeting.mailCampaign = null;

    await reloadedMeeting.save();
    this.isLoading = false;
  }

  @action
  async publishToMail() {
    this.isLoading = true;
    const mailCampaign = await this.getMailCampaign();

    if (mailCampaign) {
      if (await this.validateMailCampaign(mailCampaign)) {
        await this.publishToMailAndSaveCampaign(mailCampaign);
      }
    }

    this.isLoading = false;
    this.toggleVerifyingPublishMail();
  }

  @action
  async publishToBelga() {
    this.isLoading = true;
    const mailCampaign = await this.getMailCampaign();
    if (mailCampaign) {
      await this.publishNewsletterToBelga();
    }
    this.isLoading = false;
    this.toggleVerifyingPublishBelga();
  }

  @action
  async publishToAll() {
    this.isLoading = true;

    const mailCampaign = await this.getMailCampaign();
    if (mailCampaign) {
      if (await this.validateMailCampaign(mailCampaign)) {
        await this.publishToMailAndSaveCampaign(mailCampaign);
      }
      await this.publishNewsletterToBelga();
    }

    this.isLoading = false;
    this.toggleVerifyingPublishAll();
  }

  @action
  async showNewsletter() {
    this.loadingNewsletter = true;

    const mailCampaign = await this.getMailCampaign();
    if (mailCampaign) {
      const html = await this.newsletterService
        .getMailCampaignContent(mailCampaign.campaignId)
        .catch(() => {
          this.toaster.error(
            this.intl.t('error-send-newsletter'),
            this.intl.t('warning-title')
          );
        });
      this.newsletterHTML = html.body;
    }
    this.loadingNewsletter = false;
  }

  @action
  async downloadBelgaXML() {
    this.isLoading = true;
    const mailCampaign = await this.getMailCampaign();
    if (mailCampaign) {
      await this.newsletterService
        .downloadBelgaXML(this.args.agenda.id)
        .catch(() => {
          this.toaster.error(
            this.intl.t('error-download-XML'),
            this.intl.t('warning-title')
          );
        });
    }
    this.isLoading = false;
  }

  @action
  async clearNewsletterHTML() {
    this.newsletterHTML = null;
    this.loadingNewsletter = false;
  }

  async validateMailCampaign(mailCampaign) {
    let validCampaign = true;

    const campaign = await this.newsletterService
      .getMailCampaign(mailCampaign.campaignId)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-fetch-newsletter'),
          this.intl.t('warning-title')
        );
        validCampaign = false;
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
      validCampaign = false;
    }
    this.isVerifying = false;
    this.isLoading = false;
    return validCampaign;
  }

  async publishNewsletterToBelga() {
    await this.newsletterService
      .sendtoBelga(this.args.agenda.id)
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

  async publishToMailAndSaveCampaign(mailCampaign) {
    await this.newsletterService
      .sendMailCampaign(mailCampaign.campaignId)
      .then(() => {
        this.toaster.success(this.intl.t('success-publish-newsletter-to-mail'));
      })
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-send-newsletter'),
          this.intl.t('warning-title')
        );
      });

    mailCampaign.set('sentAt', moment().utc().toDate());
    await mailCampaign.save();

    const meeting = this.args.meeting;
    await meeting.belongsTo('mailCampaign').reload();
  }

  async getMailCampaign() {
    let mailCampaign = await this.args.meeting.mailCampaign;
    if (mailCampaign && mailCampaign.isSent) {
      this.toaster.error(this.intl.t('error-already-sent-newsletter'));
      return null;
    } else {
      await this.newsletterService.createCampaign(
        this.args.agenda,
        this.args.meeting
      );
      mailCampaign = await this.args.meeting.mailCampaign;
    }
    return mailCampaign;
  }
}
