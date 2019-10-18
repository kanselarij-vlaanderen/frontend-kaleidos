import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	remark: attr('string'),
	label: attr('string'),
	date: attr('datetime'),
	subcase: belongsTo('subcase', { inverse: null }),
	agendaitem: belongsTo('agendaitem', { inverse: null }),
	code: belongsTo('subcase-phase-code', { inverse: null })
});
