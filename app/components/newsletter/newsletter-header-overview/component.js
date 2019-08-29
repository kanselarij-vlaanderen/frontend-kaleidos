import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-page-header', 'vl-u-bg-alt', 'no-print'],
  session: inject(),
  routing: inject('-routing'),
  newsletterService: inject(),
  isShowingOptions: null,
  agenda: null,

  shouldShowPrintButton: computed('routing.currentRouteName', function() {
    return this.routing.get('currentRouteName').includes(`newsletter.overview`);
  }),

  actions: {
    print() {
      window.print();
    },

    async createCampaign() {
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      this.newsletterService.createCampaign(agenda, meeting);
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
      meeting.save();
    },

    async sendCampaign() {
      const agenda = await this.get('agenda');
      const meeting = await agenda.get('createdFor');
      const mailCampaign = await meeting.get('mailCampaign');
      this.newsletterService.sendCampaign(mailCampaign.campaignId).then(() => {
        mailCampaign.set('sent', true);
        mailCampaign.set('sentAt', moment().utc().toDate());
        mailCampaign.save();
      });
    },

    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },
  },
});
