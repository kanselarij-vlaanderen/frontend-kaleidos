import DS from 'ember-data';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	priority: attr('number'),
	orderAdded: attr('number'),
	extended: attr('boolean'),
	dateAdded: attr('date'),
	agenda: belongsTo('agenda'),
	comments: hasMany('comment'),
	subcase: belongsTo('subcase')
});
