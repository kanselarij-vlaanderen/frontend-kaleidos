import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default Model.extend({
	campaignId:attr('string'),
	campaignWebId:attr('string'),
	archiveUrl:attr('string'),
	sent: attr('boolean'),
	sentAt: attr('date'),
	
	meetings:hasMany('meeting')
});
