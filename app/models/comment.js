import DS from 'ember-data';

let { Model, attr, belongsTo } = DS;

export default Model.extend({
	text: attr('string'),
	createdAt: attr('date'),
	agendaitem: belongsTo('agendaitem'),
	session: belongsTo('session')
});
