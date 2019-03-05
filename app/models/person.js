import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	lastName: attr('string'),
	alternativeName: attr('string'),
	firstName: attr('string'),
	mandatees: hasMany('mandatee'),
	birth: belongsTo('birth'),
	// identifier: belongsTo('identifier'),
	gender: belongsTo('gender'),


	fullName: computed('firstName', 'lastName', function() {
		return this.get('firstName') || "" + " " + this.get('lastName');
	})
});
