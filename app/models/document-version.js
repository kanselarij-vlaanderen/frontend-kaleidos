import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	chosenFileName: attr('string'),
	identificationNumber: attr('string'),
	versionNumber: attr('number'),
	serialNumber: attr('string'),

	document: belongsTo('document', { inverse: null }),
	subcase: belongsTo('subcase'),
	file: belongsTo('file'),

	nameToDisplay: computed('chosenFileName', 'serialNumber', function () {
		let serialNumber = this.get('serialNumber');
		if (serialNumber) {
			return serialNumber;
		} else {
			return this.get('chosenFileName');
		}
	})
});
