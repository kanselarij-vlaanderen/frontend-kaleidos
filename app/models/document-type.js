import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	label: attr('string'),
	scopeNote: attr('string'),
	priority: attr('number'),

	documents: hasMany('document', { inverse: null }),
	subtypes: hasMany('document-type', { inverse: null }),
	superType: belongsTo('document-type', { inverse: null })
});
