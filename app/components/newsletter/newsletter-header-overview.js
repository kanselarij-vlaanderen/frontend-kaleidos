import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import SendingOldCampaignError from 'frontend-kaleidos/errors/sending-old-campaign-error';

export default Component.extend({
  classNames: ['vlc-page-header', 'auk-u-bg-alt', 'no-print'],

  intl: service(),
  store: service(),
  session: service(),
  routing: service('-routing'),
  toaster: service(),
  newsletterService: service(),
  currentSession: service(),

  isShowingOptions: null,
  agenda: null,
  isVerifying: null,

  shouldShowPrintButton: computed('routing.currentRouteName', function() {
    return this.routing.get('currentRouteName').includes('newsletter.print');
  }),

  async validatedCampaign(campaignId) {
    const campaign = await this.newsletterService.getMailCampaign(campaignId).catch(() => {
      this.toaster.error(this.intl.t('error-fetch-newsletter'), this.intl.t('warning-title'));
      return false;
    });

    console.info('campaign minutes old', Math.abs(moment(campaign.body.create_time)
      .diff(moment(Date.now()), 'minutes')));

    const threshold = 10;

    if (
      Math.abs(moment(campaign.body.create_time)
        .diff(moment(Date.now()), 'minutes')) > threshold
    ) {
      const sendingOldCampaignError = new SendingOldCampaignError();
      sendingOldCampaignError.message = 'Sending an old campaign.';
      this.toaster.error(this.intl.t('error-old-newsletter'), this.intl.t('warning-title'),
        {
          timeOut: 600000,
        });
      throw (sendingOldCampaignError);
    } else {
      return true;
    }
  },

  actions: {
    print() {
      window.print();
    },

    toggleIsVerifying() {
      this.toggleProperty('isVerifying');
    },

    async createCampaign() {
      this.set('isLoading', true);
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      await this.newsletterService.createCampaign(agenda, meeting).then(() => {
        this.set('isLoading', false);
      });
      this.set('newsletterHTML', null);
      this.set('testCampaignIsLoading', false);
      location.reload();
    },

    async deleteCampaign() {
      this.set('isLoading', true);
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');
      if (mailCampaign && mailCampaign.campaignId) {
        await this.newsletterService.deleteCampaign(mailCampaign.campaignId);
      }
      mailCampaign.destroyRecord();
      const reloadedMeeting = await this.store.findRecord('meeting', meeting.id, {
        reload: true,
      });
      reloadedMeeting.set('mailCampaign', null);
      this.set('mailCampaign', null);
      await reloadedMeeting.save();
      this.set('isLoading', false);
      location.reload();
    },

    async sendCampaign() {
      this.set('isLoading', true);
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');

      if (!mailCampaign || !mailCampaign.id || mailCampaign.isSent) {
        return;
      }

      let validCampaign = true;
      await this.validatedCampaign(mailCampaign.campaignId).catch((ex) => {
        console.error(ex);
        this.set('isVerifying', false);
        this.set('isLoading', false);
        validCampaign = false;
      });
      if (!validCampaign) {
        return false;
      }

      await this.newsletterService.sendCampaign(mailCampaign.campaignId, agenda.id).catch(() => {
        this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      });
      this.set('isLoading', false);
      mailCampaign.set('sentAt', moment().utc()
        .toDate());
      await mailCampaign.save();
      await meeting.belongsTo('mailCampaign').reload();
      this.set('isVerifying', false);
    },

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    async sendTestCampaign() {
      this.set('testCampaignIsLoading', true);
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');

      if (!mailCampaign || !mailCampaign.id || mailCampaign.isSent) {
        this.set('newsletterHTML', html.body);
        this.set('testCampaignIsLoading', false);
        return;
      }

      const html = await this.newsletterService.getMailCampaignContent(mailCampaign.campaignId).catch(() => {
        this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      });
      this.set('newsletterHTML', html.body);
      this.set('testCampaignIsLoading', false);
    },

    async clearNewsletterHTML() {
      this.set('newsletterHTML', null);
      this.set('testCampaignIsLoading', false);
    },
  },
});
