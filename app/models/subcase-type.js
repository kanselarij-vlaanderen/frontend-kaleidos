import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({
	label: attr('string'),
	altLabel: attr('string'),
	scopeNote: attr('string'),
	subcases: hasMany('subcase', { inverse: null })
});
