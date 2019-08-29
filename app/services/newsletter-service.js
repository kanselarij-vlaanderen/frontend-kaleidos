import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Service.extend({
  store: inject(),

  createCampaign(agenda, meeting) {
    return $.ajax({
      method: 'POST',
      url: `/newsletter/createCampaign?agendaId=${agenda.get('id')}`,
    }).then((result) => {
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
    });
  },

  async deleteCampaign(id) {
    return $.ajax({
      method: 'DELETE',
      url: `/newsletter/deleteCampaign/${id}`,
    });
	},
	
	sendCampaign(id) {
		return $.ajax({
      method: 'POST',
      url: `/newsletter/sendCampaign/${id}`,
    });
	}
});
