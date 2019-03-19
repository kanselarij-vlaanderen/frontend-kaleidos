import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	label: attr('string'),
	scopeNote: attr('string'),
	documents: hasMany('document'),
	subtypes: hasMany('document-type', {inverse:null}),
	superType: belongsTo('document-type', {inverse:null})
});
