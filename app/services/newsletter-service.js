import Service, { inject as service } from '@ember/service';

import { ajax } from 'fe-redpencil/utils/ajax';
import moment from 'moment';

export default Service.extend({
  store: service(),
  toaster: service(),
  intl: service(),
  formatter: service(),
  currentSession: service(),

  async createCampaign(agenda, meeting) {
    try {
      const result = await ajax({
        method: 'POST',
        url: `/newsletter/createCampaign?agendaId=${agenda.get('id')}`,
      });

      const {
        body,
      } = result;

      const mailCampaign = this.store.createRecord('mail-campaign', {
        campaignId: body.campaign_id,
        campaignWebId: body.campaign_web_id,
        archiveUrl: body.archive_url,
      });

      await mailCampaign.save().then(async(savedCampaign) => {
        const reloadedMeeting = await this.store.findRecord('meeting', meeting.id, {
          reload: true,
        });
        reloadedMeeting.set('mailCampaign', savedCampaign);
        return reloadedMeeting.save();
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-create-newsletter'), this.intl.t('warning-title'));
    }
  },

  async deleteCampaign(id) {
    try {
      return ajax({
        method: 'DELETE',
        url: `/newsletter/deleteCampaign/${id}`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-delete-newsletter'), this.intl.t('warning-title'));
      return null;
    }
  },

  sendCampaign(id, agendaId) { // TODO: this and below method are sync, while 2 methods above async?
    try {
      return ajax({
        method: 'POST',
        url: `/newsletter/sendCampaign/${id}?agendaId=${agendaId}`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      return null;
    }
  },

  getMailCampaignContent(id) {
    try {
      return ajax({
        method: 'GET',
        url: `/newsletter/fetchTestCampaign/${id}`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      return null;
    }
  },

  getMailCampaign(id) {
    try {
      return ajax({
        method: 'GET',
        url: `/newsletter/fetchTestCampaignMetaData/${id}`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-send-newsletter'), this.intl.t('warning-title'));
      return null;
    }
  },

  // TODO title = shortTitle, inconsistenties fix/conversion needed if this is changed
  async createNewsItemForAgendaitem(agendaitem, inNewsletter = false) {
    if (this.currentSession.isEditor) {
      const agendaItemTreatment = (await agendaitem.get('treatments')).firstObject;
      const news = this.store.createRecord('newsletter-info', {
        agendaItemTreatment,
        inNewsletter,
      });
      if (agendaitem.showAsRemark) {
        const content = agendaitem.title;
        news.set('title', agendaitem.shortTitle || content);
        news.set('richtext', content);
        news.set('finished', true);
        news.set('inNewsletter', true);
      } else {
        news.set('title', agendaitem.shortTitle);
        news.set('subtitle', agendaitem.title);
        news.set('finished', false);
        news.set('inNewsletter', false);
        // Use news item "of previous subcase" as a default
        try {
          const activity = await agendaitem.get('agendaActivity');
          const subcase = await activity.get('subcase');
          const _case = await subcase.get('case');
          const previousNewsItem = (await this.store.query('newsletter-info', {
            'filter[agenda-item-treatment][subcase][case][:id:]': _case.id,
            'filter[agenda-item-treatment][agendaitem][show-as-remark]': false, // Don't copy over news item from announcement
            sort: '-agenda-item-treatment.agendaitem.agenda-activity.start-date',
            'page[size]': 1,
          })).firstObject;
          if (previousNewsItem) {
            news.set('richtext', previousNewsItem.richtext);
            const themes = await previousNewsItem.get('themes');
            news.set('themes', themes);
          }
        } catch (error) {
          console.log(error);
        }
      }
      return news;
    }
  },

  async createNewsItemForMeeting(meeting) {
    if (this.currentSession.isEditor) {
      const plannedStart = await meeting.get('plannedStart');
      const pubDate = moment(plannedStart).set({
        hour: 14, minute: 0,
      });
      const pubDocDate = moment(plannedStart).weekday(7)
        .set({
          hour: 14, minute: 0,
        });
      const newsletter = this.store.createRecord('newsletter-info', {
        meeting,
        finished: false,
        mandateeProposal: null,
        publicationDate: this.formatter.formatDate(pubDate),
        publicationDocDate: this.formatter.formatDate(pubDocDate),
      });
      await newsletter.save();
      meeting.set('newsletter', newsletter);
      return await meeting.save();
    }
  },
});
