import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	name: attr('string'),
	function: attr('string'),
	isActive: attr('boolean'),

	file: belongsTo('file'),
	person: belongsTo('person'),
})
