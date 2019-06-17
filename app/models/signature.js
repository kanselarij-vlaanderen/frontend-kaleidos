import DS from 'ember-data';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	name: attr('string'),
	function: attr('string'),
	isActive: attr('boolean'),

	file: belongsTo('file'),
	person: belongsTo('person'),
	meetings: hasMany('meeting', { inverse: null })
})
