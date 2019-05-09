import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	title: attr('string'),
	priority: attr('string'),
	start: attr('date'),
	end: attr('date'),
	dateSwornIn: attr('date'),
	dateDecree: attr('date'),
	// temporaryReplacements: hasMany('mandatee'),
	governmentFields: hasMany('government-field', { inverse: null }),
	decisions: hasMany('decision'),
	cases: hasMany('case'),
	holds: belongsTo('mandate', { inverse: null }),
	person: belongsTo('mandatee', { inverse: null }),
	meetingsAttended: hasMany('meeting-record'),
	approvals: hasMany('approval'),
	subcases: hasMany('subcase'),
	agendaitems: hasMany('agendaitem')
	// state: belongsTo('mandatee-status')
});
