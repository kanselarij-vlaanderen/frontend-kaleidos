import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	versionNumber: attr('number'),
	subcase: belongsTo('subcase'),
	file: belongsTo('file')
});
