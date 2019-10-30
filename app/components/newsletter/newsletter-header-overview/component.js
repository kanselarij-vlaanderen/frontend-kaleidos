import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import EmberObject from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-page-header', 'vl-u-bg-alt', 'no-print'],
  session: inject(),
  routing: inject('-routing'),
  newsletterService: inject(),
  isShowingOptions: null,
  agenda: null,
  isVerifying: null,

  shouldShowPrintButton: computed('routing.currentRouteName', function() {
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
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');
      if (mailCampaign && mailCampaign.campaignId) {
        await this.newsletterService.deleteCampaign(mailCampaign.campaignId);
      }
      mailCampaign.destroyRecord();
      meeting.set('mailCampaign', null);
      this.set('mailCampaign', null);
      meeting.save();
    },

    async sendCampaign() {
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');

      if(!mailCampaign || !mailCampaign.id || mailCampaign.isSent) {
        return;
      }
       await this.newsletterService.sendCampaign(mailCampaign.campaignId).catch(() => {
        this.globalError.showToast.perform(EmberObject.create({
          title: this.intl.t('warning-title'),
          message: this.intl.t('error-send-newsletter'),
          type: 'error'
        }));
      });
      mailCampaign.set('sentAt', moment().utc().toDate());
      await mailCampaign.save();
      await meeting.belongsTo('mailCampaign').reload();
      this.set('isVerifying',false);
    },

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    async sendTestCampaign() {
      this.set('testCampaignIsLoading', true);
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');

      if(!mailCampaign || !mailCampaign.id || mailCampaign.isSent) {
        this.set('newsletterHTML', html.body);
        this.set('testCampaignIsLoading', false);
        return;
      }

      const html = await this.newsletterService.getMailCampaign(mailCampaign.campaignId).catch(() => {
        this.globalError.showToast.perform(EmberObject.create({
          title: this.intl.t('warning-title'),
          message: this.intl.t('error-send-newsletter'),
          type: 'error'
        }));
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
