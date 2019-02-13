import DS from 'ember-data';

const { Model, hasMany, belongsTo } = DS;

export default Model.extend({
	role: belongsTo('role'),
	organization: belongsTo('organization'),
	persons: hasMany('person')
});
