import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	title: attr('string'),
	priority: attr('number'),
	start: attr('date'),
	end: attr('date'),
	dateSwornIn: attr('date'),
	dateDecree: attr('date'),

	holds: belongsTo('mandate', { inverse: null }),
	person: belongsTo('person', { inverse: null }),

	iseCodes: hasMany('ise-code', { inverse: null }),
	decisions: hasMany('decision'),
	cases: hasMany('case'),
	meetingsAttended: hasMany('meeting-record'),
	approvals: hasMany('approval'),
	subcases: hasMany('subcase', { inverse: null }),
	agendaitems: hasMany('agendaitem', { inverse: null })
});
