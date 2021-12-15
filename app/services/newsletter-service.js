import Service, { inject as service } from '@ember/service';
import { ajax } from 'frontend-kaleidos/utils/ajax';
import moment from 'moment';

export default class NewsletterService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service formatter;
  @service currentSession;

  async createCampaign(agenda, meeting) {
    try {
      const result = await ajax({
        method: 'POST',
        url: `/newsletter/createMailCampaign`,
        data: {
          agendaId: agenda.id,
        }
      });

      const mailCampaign = this.store.createRecord('mail-campaign', {
        campaignId: result.data.id,
        campaignWebId: result.data.webId,
        archiveUrl: result.data.archiveUrl,
      });

      await mailCampaign.save().then(async (savedCampaign) => {
        const reloadedMeeting = await this.store.findRecord(
          'meeting',
          meeting.id,
          {
            reload: true,
          }
        );
        reloadedMeeting.mailCampaign = savedCampaign;
        await reloadedMeeting.save();
        return mailCampaign;
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-create-newsletter'),
        this.intl.t('warning-title')
      );
      return null;
    }
  }

  async sendMailCampaign(id) {
    try {
      const result = await ajax({
        method: 'POST',
        url: `/newsletter/sendMailCampaign`,
        data: {
          id: id,
        }
      });
      return result;
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      return null;
    }
  }

  async sendToBelga(agendaId) {
    try {
      const result = await ajax({
        method: 'POST',
        url: `/newsletter/sendToBelga`,
        data: {
          agendaId: agendaId,
        }
      });
      return result;
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      return null;
    }
  }

  async getMailCampaign(id) {
    try {
      const result = await ajax({
        method: 'GET',
        url: `/newsletter/fetchMailCampaign`,
        data: {
          id: id,
        }
      });
      return result;
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      return null;
    }
  }

  // TODO title = shortTitle, inconsistenties fix/conversion needed if this is changed
  async createNewsItemForAgendaitem(agendaitem, inNewsletter = false) {
    if (this.currentSession.isEditor) {
      // FIXME: The relationship 'agendaitem' to 'agenda-item-treatment' is "inverse: null",
      // hence the requirement for the "reload" here. Without it, adding a new
      // newsletterInfo immediately after adding a treatment can break data.
      const agendaItemTreatments = await agendaitem
        .hasMany('treatments')
        .reload();
      const news = this.store.createRecord('newsletter-info', {
        agendaItemTreatment: agendaItemTreatments,
        inNewsletter,
      });
      if (agendaitem.showAsRemark) {
        const content = agendaitem.title;
        news.title = agendaitem.shortTitle || content;
        news.richtext = content;
        news.finished = true;
        news.inNewsletter = true;
      } else {
        news.title = agendaitem.shortTitle;
        news.subtitle = agendaitem.title;
        news.finished = false;
        news.inNewsletter = false;
        // Use news item "of previous subcase" as a default
        try {
          const activity = await agendaitem.get('agendaActivity');
          const subcase = await activity.get('subcase');
          const _case = await subcase.get('case');
          const previousNewsItem = await this.store.queryOne(
            'newsletter-info',
            {
              'filter[agenda-item-treatment][subcase][case][:id:]': _case.id,
              'filter[agenda-item-treatment][agendaitem][show-as-remark]': false, // Don't copy over news item from announcement
              sort: '-agenda-item-treatment.agendaitem.agenda-activity.start-date',
            }
          );
          if (previousNewsItem) {
            news.richtext = previousNewsItem.richtext;
            news.title = previousNewsItem.title;
            news.themes = await previousNewsItem.get('themes');
          }
        } catch (error) {
          console.log(error);
        }
      }
      return news;
    }
  }

  async createNewsItemForMeeting(meeting) {
    if (this.currentSession.isEditor) {
      const plannedStart = await meeting.get('plannedStart');
      const pubDate = moment(plannedStart).set({
        hour: 14,
        minute: 0,
      });
      const pubDocDate = moment(plannedStart).weekday(7).set({
        hour: 14,
        minute: 0,
      });
      const newsletter = this.store.createRecord('newsletter-info', {
        meeting,
        finished: false,
        mandateeProposal: null,
        publicationDate: this.formatter.formatDate(pubDate),
        publicationDocDate: this.formatter.formatDate(pubDocDate),
      });
      await newsletter.save();
      meeting.newsletter = newsletter;
      return await meeting.save();
    }
  }

  // TODO These are for developers use - in comments for follow up
  /*
  downloadBelgaXML(agendaId) {
    try {
      return ajax({
        method: 'GET',
        url: `/newsletter/xml-newsletter/${agendaId}`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-download-XML'), this.intl.t('warning-title'));
      return null;
    }

 async deleteCampaign(id) {
    try {
      const result = await ajax({
        method: 'DELETE',
        url: `/newsletter/deleteMailCampaign`,
        data: {
          id: id,
        }
      });
      return result;
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-delete-newsletter'),
        this.intl.t('warning-title')
      );
      return null;
    }
  }
   async getMailCampaignContent(id) {
    try {
      return ajax({
        method: 'GET',
        url: `/newsletter/fetchTestMailCampaign/${id}`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      return null;
    }
  }
  */
}
