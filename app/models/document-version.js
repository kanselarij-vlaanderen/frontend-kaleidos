import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	chosenFileName: attr('string'),
	identificationNumber: attr('string'),
	versionNumber: attr('number'),
	serialNumber: attr('string'),
	document: belongsTo('document'),
	subcase: belongsTo('subcase', { inverse: null }),
	agendaitem: belongsTo('agendaitem', { inverse: null }),
  announcement: belongsTo('announcement'),
	file: belongsTo('file'),

	newsletter: belongsTo('newsletter-info'),
	meetingRecord: belongsTo('meeting-record'),
	decision: belongsTo('decision'),
	signedDecision: belongsTo('decision'),

	nameToDisplay: computed('chosenFileName', 'document.title', function () {
		let fileName = this.get('chosenFileName');
		if (fileName) {
			return fileName;
		} else {
			return this.get('document.title');
		}
	})
});
