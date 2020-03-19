import Service from '@ember/service';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import EmberObject from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Service.extend(isAuthenticatedMixin, {
  store: service(),
  toaster: service(),
  intl: service(),
  formatter: service(),

  createCampaign(agenda, meeting) {
    return $.ajax({
      method: 'POST',
      url: `/newsletter/createCampaign?agendaId=${agenda.get('id')}`,
      success: (result) => {
        const { body } = result;
        const mailCampaign = this.store.createRecord('mail-campaign', {
          campaignId: body.campaign_id,
          campaignWebId: body.campaign_web_id,
          archiveUrl: body.archive_url,
        });
        mailCampaign.save().then((savedCampaign) => {
          meeting.set('mailCampaign', savedCampaign);
          return meeting.save();
        });
      },
      error: () => {
        this.toaster.error(this.intl.t('error-create-newsletter'), this.intl.t('warning-title'));
      },
    });
  },

  async deleteCampaign(id) {
    return $.ajax({
      method: 'DELETE',
      url: `/newsletter/deleteCampaign/${id}`,
      error: () => {
        this.toaster.error(this.intl.t('error-delete-newsletter'), this.intl.t('warning-title'));
      },
    });
  },

  sendCampaign(id, agendaId) {
    return $.ajax({
      method: 'POST',
      url: `/newsletter/sendCampaign/${id}?agendaId=${agendaId}`,
      error: () => {
        this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      },
    });
  },

  getMailCampaign(id) {
    return $.ajax({
      method: 'GET',
      url: `/newsletter/fetchTestCampaign/${id}`,
      error: () => {
        this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      },
    });
  },

  // TODO title = shortTitle, inconsistenties fix/conversion needed if this is changed
  async createNewsItemForSubcase(subcase, agendaitem, inNewsletter = false) {
    if (this.isEditor) {
      const news = this.store.createRecord('newsletter-info', {
        subcase: await subcase,
        title: agendaitem ? await agendaitem.get('shortTitle') : await subcase.get('shortTitle'),
        subtitle: agendaitem ? await agendaitem.get('title') : await subcase.get('title'),
        finished: false,
        inNewsletter: inNewsletter
      });
      return await news.save();
    }
  },

  async createNewsItemForMeeting(meeting) {
    if (this.isEditor) {
      const plannedStart = await meeting.get('plannedStart');
      const pubDate = moment(plannedStart).set({ hour: 14, minute: 0 });
      const pubDocDate = moment(plannedStart).weekday(7).set({ hour: 14, minute: 0 });
      const newsletter = this.store.createRecord('newsletter-info', {
        meeting: meeting,
        finished: false,
        mandateeProposal: null,
        publicationDate: this.formatter.formatDate(pubDate),
        publicationDocDate: this.formatter.formatDate(pubDocDate)
      });
      await newsletter.save();
      meeting.set('newsletter', newsletter);
      return await meeting.save();
    }
  }
});
