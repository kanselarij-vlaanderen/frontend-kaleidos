import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	modified: attr('date'),
	announcements: attr('string'),
	others: attr('string'),
	description: attr('string'),
	attendees: hasMany('mandatee'),
	agendaitem: belongsTo('agendaitem'),
	meeting: belongsTo('meeting')
});
