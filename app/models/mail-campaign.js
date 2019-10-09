import DS from 'ember-data';
const { Model, attr, hasMany } = DS;
import { computed } from '@ember/object';

export default Model.extend({
	campaignId:attr('string'),
	campaignWebId:attr('string'),
	archiveUrl:attr('string'),
	sent: attr('boolean'),
	sentAt: attr('date'),
	
	meetings:hasMany('meeting', {inverse:null}),

	isSent: computed('sent','sentAt', function() {
		const { sent, sentAt} = this;
		if(sent || sentAt){
			return true;
		}
		return false;
	})
});
