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

	nameToDisplay: computed('chosenFileName', 'document', 'file', function () {
		const chosenFileName = this.get('chosenFileName');
		const name = this.get('file.filename');
		if (chosenFileName) {
			return chosenFileName;
		} else if (name) {
			return name;
		} else {
			return this.get('file.name')
		}
	})
});
