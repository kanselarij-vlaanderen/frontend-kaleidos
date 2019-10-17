import Service from '@ember/service';
import { inject } from '@ember/service';
import $ from 'jquery';
import EmberObject from '@ember/object';
import moment from 'moment';

export default Service.extend({
  store: inject(),
  globalError: inject(),
  intl: inject(),

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
        this.globalError.showToast.perform(
          EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error-create-newsletter'),
            type: 'error',
          })
        );
      },
    });
  },

  async deleteCampaign(id) {
    return $.ajax({
      method: 'DELETE',
      url: `/newsletter/deleteCampaign/${id}`,
      error: () => {
        this.globalError.showToast.perform(
          EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error-delete-newsletter'),
            type: 'error',
          })
        );
      },
    });
  },

  sendCampaign(id) {
    return $.ajax({
      method: 'POST',
      url: `/newsletter/sendCampaign/${id}`,
      error: () => {
        this.globalError.showToast.perform(
          EmberObject.create({
            title: this.intl.t('warning-title'),
            message: this.intl.t('error-send-newsletter'),
            type: 'error',
          })
        );
      },
    });
  },

  // TODO title = shortTitle, inconsistenties fix/conversion needed if this is changed
  async createNewsItemForSubcase(subcase, agendaitem, inNewsletter = false) {
		const news = this.store.createRecord("newsletter-info", {
			subcase: await subcase,
			created: moment().utc().toDate(),
			title: await agendaitem.get('shortTitle'),
      subtitle: await agendaitem.get('title'),
      finished: false,
      inNewsletter: inNewsletter
		});
    return await news.save();
  },
});
