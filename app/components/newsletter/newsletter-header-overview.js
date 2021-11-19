import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import SendingOldCampaignError from 'frontend-kaleidos/errors/sending-old-campaign-error';
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

  @tracked isVerifying = false;
  @tracked isLoading = false;

  @tracked mailCampaign;
  @tracked newsletterHtml = null;
  @tracked testCampaignIsLoading = false;

  async validatedCampaign(campaignId) {
    const campaign = await this.newsletterService
      .getMailCampaign(campaignId)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-fetch-newsletter'),
          this.intl.t('warning-title')
        );
        return false;
      });

    console.info(
      'campaign minutes old',
      Math.abs(
        moment(campaign.body.create_time).diff(moment(Date.now()), 'minutes')
      )
    );

    const threshold = 10;

    if (
      Math.abs(
        moment(campaign.body.create_time).diff(moment(Date.now()), 'minutes')
      ) > threshold
    ) {
      const sendingOldCampaignError = new SendingOldCampaignError();
      sendingOldCampaignError.message = 'Sending an old campaign.';
      this.toaster.error(
        this.intl.t('error-old-newsletter'),
        this.intl.t('warning-title'),
        {
          timeOut: 600000,
        }
      );
      throw sendingOldCampaignError;
    } else {
      return true;
    }
  }

  shouldShowPrintButton() {
    return this.router.currentRouteName.includes('newsletter.print');
  }

  @action
  print() {
    window.print();
  }

  @action
  toggleIsVerifying() {
    this.isVerifying = !this.isVerifying;
  }

  @action
  async createCampaign() {
    this.isLoading = true;
    const agenda = await this.args.agenda;
    const meeting = await agenda.createdFor;
    await this.newsletterService.createCampaign(agenda, meeting).then(() => {
      this.isLoading = false;
    });
    this.newsletterHTML = null;
    this.testCampaignIsLoading = false;
    location.reload();
  }

  @action
  async deleteCampaign() {
    this.isLoading = true;
    const agenda = await this.args.agenda;
    const meeting = await agenda.createdFor;
    const mailCampaign = await meeting.mailCampaign;
    if (mailCampaign && mailCampaign.campaignId) {
      await this.newsletterService.deleteCampaign(mailCampaign.campaignId);
    }
    mailCampaign.destroyRecord();
    const reloadedMeeting = await this.store.findRecord('meeting', meeting.id, {
      reload: true,
    });
    reloadedMeeting.mailCampaign = null;

    this.mailCampaign = null;
    await reloadedMeeting.save();
    this.isLoading = false;
    location.reload();
  }

  @action
  async sendCampaign() {
    this.isLoading = true;
    const agenda = await this.args.agenda;
    const meeting = await agenda.createdFor;
    const mailCampaign = await meeting.mailCampaign;

    if (!mailCampaign || !mailCampaign.id || mailCampaign.isSent) {
      return;
    }

    let validCampaign = true;
    await this.validatedCampaign(mailCampaign.campaignId).catch((ex) => {
      console.error(ex);
      this.isVerifying = false;
      this.isLoading = false;
      validCampaign = false;
    });
    if (!validCampaign) {
      return false;
    }

    await this.newsletterService
      .sendCampaign(mailCampaign.campaignId, agenda.id)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-send-newsletter'),
          this.intl.t('warning-title')
        );
      });
    this.isLoading = false;
    mailCampaign.set('sentAt', moment().utc().toDate());
    await mailCampaign.save();
    await meeting.belongsTo('mailCampaign').reload();
    this.isVerifying = false;
  }

  @action
  async sendTestCampaign() {
    this.testCampaignIsLoading = true;
    const agenda = await this.args.agenda;
    const meeting = await agenda.createdFor;
    const mailCampaign = await meeting.get('mailCampaign');

    if (!mailCampaign || !mailCampaign.id || mailCampaign.isSent) {
      this.newsletterHTML = html.body;
      this.testCampaignIsLoading = false;
      return;
    }

    const html = await this.newsletterService
      .getMailCampaignContent(mailCampaign.campaignId)
      .catch(() => {
        this.toaster.error(
          this.intl.t('error-send-newsletter'),
          this.intl.t('warning-title')
        );
      });
    this.newsletterHTML = html.body;
    this.testCampaignIsLoading = false;
  }

  @action
  async clearNewsletterHTML() {
    this.newsletterHTML = null;
    this.testCampaignIsLoading = false;
  }
}
