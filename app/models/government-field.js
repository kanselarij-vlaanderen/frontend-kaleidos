import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	label: attr('string'),
	scopeNote: attr('string'),
	altLabel: attr('string'),
	iseCode: belongsTo('ise-code', { inverse: null }),
	domain: belongsTo('government-domain', { inverse: null })
});
