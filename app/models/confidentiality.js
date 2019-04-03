import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({
	label: attr('string'),
	scopeNote: attr('string'),
	subcases: hasMany('subcase', {inverse:null}),
	documents: hasMany('document', {inverse:null})
});
