import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-page-header', 'vl-u-bg-alt', 'no-print'],
  session: service(),
  routing: service('-routing'),
  toaster: service(),
  newsletterService: service(),
  isShowingOptions: null,
  agenda: null,
  isVerifying: null,

  shouldShowPrintButton: computed('routing.currentRouteName', function () {
    return this.routing.get('currentRouteName').includes(`newsletter.overview`);
  }),

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
      this.newsletterService.createCampaign(agenda, meeting).then(() => {
        this.set('isLoading', false);
      });
      this.set('newsletterHTML', null);
      this.set('testCampaignIsLoading', false);

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
      meeting.set('mailCampaign', null);
      this.set('mailCampaign', null);
      await meeting.save();
      this.set('isLoading', false);
    },

    async sendCampaign() {
      this.set('isLoading', true);
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');

      if (!mailCampaign || !mailCampaign.id || mailCampaign.isSent) {
        return;
      }

      await this.newsletterService.sendCampaign(mailCampaign.campaignId, agenda.id).catch(() => {
        this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      });
      this.set('isLoading', false);
      mailCampaign.set('sentAt', moment().utc().toDate());
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

      const html = await this.newsletterService.getMailCampaign(mailCampaign.campaignId).catch(() => {
        this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      });
      this.set('newsletterHTML', html.body);
      this.set('testCampaignIsLoading', false);
    },

    async clearNewsletterHTML() {
      this.set('newsletterHTML', null);
      this.set('testCampaignIsLoading', false);
    }
  },
});
