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
	governmentDomains: hasMany('government-domains'),
	decisions: hasMany('decision'),
	cases: hasMany('case'),
	holds: belongsTo('mandate'),
	person: belongsTo('mandatee'),
	meetingsAttended: hasMany('meeting-record')
	// state: belongsTo('mandatee-status')
});
