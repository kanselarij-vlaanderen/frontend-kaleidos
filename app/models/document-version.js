import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	chosenFileName: attr('string'),
	identificationNumber: attr('string'),
	serialNumber: attr('string'),
	versionNumber: attr('number'),
	file: belongsTo('file'),
	document: belongsTo('document'),

	nameToDisplay: computed('chosenFileName','serialNumber', function() {
		let serialNumber = this.get('serialNumber');
		if(serialNumber) {
			return serialNumber;
		} else {
			return this.get('chosenFileName');
		}
	})
});
