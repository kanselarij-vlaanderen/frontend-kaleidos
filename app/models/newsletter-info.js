import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	text: attr('string'),
	subtitle: attr('string'),
	title: attr('string'),
	publicationDate: attr('date'),
	publicationDocDate: attr('date'),
	remarks: hasMany('remark'),
	themes: hasMany('theme'),
	decision: belongsTo('decision'),
	agendaitem: belongsTo('agendaitem'),
	meeting: belongsTo('meeting')
});
