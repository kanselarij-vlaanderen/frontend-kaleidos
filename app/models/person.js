import DS from 'ember-data';
import { computed } from '@ember/object';
const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	lastName: attr('string'),
	alternativeName: attr('string'),
	firstName: attr('string'),

	mandatees: hasMany('mandatee', { inverse: null }),

	birth: belongsTo('birth'),
	mandatee: belongsTo('mandatee', { inverse: null }),
	gender: belongsTo('gender'),
	signature: belongsTo('signature'),

	nameToDisplay: computed('mandatee', 'alternativeName', 'firstName', 'lastName', function () {
		const { alternativeName, firstName, lastName } = this;
		if (alternativeName) {
			return alternativeName;
		} else if(firstName && lastName) {
			return `${firstName} ${lastName}`;
		} else {
			return "";
		}
	})
});
