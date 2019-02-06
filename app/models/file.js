import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	documentVersion: belongsTo('document-version'),
	filename: attr('string'),
	format: attr('string'),
	size: attr('number'),
	extension: attr('string'),
	created: attr('date'),
	name: attr('string')
});
