import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	label: attr('string'),
	scopeNote: attr('string'),
	altLabel: attr('string'),

	mandatees: hasMany('mandatee', { inverse: null }),
	codes: hasMany('ise-code'),
	domain: belongsTo('government-domain')
});
