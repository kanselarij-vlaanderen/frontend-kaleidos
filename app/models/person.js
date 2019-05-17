import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	lastName: attr('string'),
	alternativeName: attr('string'),
	firstName: attr('string'),
	mandatees: hasMany('mandatee', { inverse: null }),
	birth: belongsTo('birth'),
	mandatee: belongsTo('mandatee', { inverse: null }),
	gender: belongsTo('gender')
});
