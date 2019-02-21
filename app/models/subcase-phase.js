import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	remark: attr('string'),
	date: attr('date'),
	subcases: hasMany('subcase'),
	code: belongsTo('subcase-phase-code')
});
