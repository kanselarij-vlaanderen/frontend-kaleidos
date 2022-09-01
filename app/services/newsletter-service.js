import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class NewsletterService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;

  async createCampaign(meeting, silent = false) {
    const endpoint = `/newsletter/mail-campaigns`;
    const body = {
      data: {
        type: 'mail-campaigns',
        relationships: {
          meeting: {
            data: { type: 'meetings', id: meeting.id },
          },
        },
      },
    };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      if (!silent) {
        this.toaster.error(
          this.intl.t('error-create-newsletter'),
          this.intl.t('warning-title')
        );
      }
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    }
    const mailCampaign = this.store.createRecord('mail-campaign', {
      campaignId: result.data.id,
      campaignWebId: result.data.attributes.webId,
      archiveUrl: result.data.attributes.archiveUrl,
    });

    await mailCampaign.save();
    const reloadedMeeting = await this.store.findRecord('meeting', meeting.id, {
      reload: true,
    });
    reloadedMeeting.mailCampaign = mailCampaign;
    await reloadedMeeting.save();
    return mailCampaign;
  }

  async sendMailCampaign(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}/send`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (!response.ok) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      const result = await response.json();
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    }
  }

  async sendToBelga(meetingId) {
    const endpoint = `/newsletter/belga-newsletters`;
    const body = {
      data: {
        type: 'belga-newsletters',
        relationships: {
          meeting: {
            data: { type: 'meetings', id: meetingId },
          },
        },
      },
    };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      this.toaster.error(
        this.intl.t('error-send-belga'),
        this.intl.t('warning-title')
      );
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    } else {
      return result;
    }
  }

  async getMailCampaign(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    } else {
      return result.data;
    }
  }

  // TODO title = shortTitle, inconsistenties fix/conversion needed if this is changed
  async createNewsItemForAgendaitem(agendaitem, inNewsletter = false) {
    const agendaItemTreatment = await agendaitem.treatment;
    const news = this.store.createRecord('newsletter-info', {
      agendaItemTreatment,
      inNewsletter,
    });
    const agendaItemType = await agendaitem.type;
    if (agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
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
        const activity = await agendaitem.agendaActivity;
        const subcase = await activity.subcase;
        const dmf = await subcase.decisionmakingFlow;
        const previousNewsItem = await this.store.queryOne(
          'newsletter-info',
          {
            'filter[agenda-item-treatment][decision-activity][subcase][decisionmaking-flow][:id:]': dmf.id,
            'filter[agenda-item-treatment][agendaitems][type][:uri:]': CONSTANTS.AGENDA_ITEM_TYPES.NOTA, // Don't copy over news item from announcement
            sort: '-agenda-item-treatment.agendaitems.agenda-activity.start-date',
          }
        );
        if (previousNewsItem) {
          news.richtext = previousNewsItem.richtext;
          news.title = previousNewsItem.title;
          news.themes = await previousNewsItem.themes;
        }
      } catch (error) {
        console.log(error);
      }
    }
    return news;
  }

  async generateNewsItemMandateeProposalText(newsItem) {
    const treatment = await newsItem.agendaItemTreatment;
    if (treatment) {
      let mandatees = await this.store.query('mandatee', {
        'filter[subcases][decision-activities][treatment][:id:]': treatment.id,
        sort: 'priority',
        page: {
          size: PAGE_SIZE.MANDATEES_IN_GOV_BODY,
        },
      });

      if (!mandatees.length) {
        const mandatee = await this.store.queryOne('mandatee', {
          'filter[requested-subcases][decision-activities][treatment][:id:]': treatment.id,
        });
        mandatees = mandatee ? [mandatee] : [];
      }

      if (mandatees.length) {
        const titles = mandatees.map((mandatee) => mandatee.newsletterTitle || mandatee.title);
        let proposalText;
        if (titles.length > 1) {
          // construct string like "mandatee_1, mandatee_2, mandatee_3 en mandatee_4"
          proposalText = [
            titles.slice(0, titles.length - 1).join(', '), // all elements but last one
            titles.slice(titles.length - 1) // last element
          ].join(' en ');
        } else {
          proposalText = titles[0] || '';
        }

        let proposalPrefix = this.intl.t('proposal-text');
        return `${proposalPrefix}${proposalText}`;
      }
    }

    return null;
  }

  async deleteCampaign(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}`;
    try {
      await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-delete-newsletter'),
        this.intl.t('warning-title')
      );
    }
  }

  // TODO These are for developers use - in comments for follow up
  /*
  downloadBelgaXML(meetingId) {
    try {
      return await fetch({
        method: 'GET',
        url: `/newsletter/belga-newsletters/${meetingId}/download`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-download-XML'), this.intl.t('warning-title'));
      return null;
    }

  async getMailCampaignContent(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}?fields[mail-campaigns]=html`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (!response.ok) {
      console.warn('An exception ocurred: ', response.error);
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
    } else {
      return response.data.attributes;
    }
  }
  */
}
