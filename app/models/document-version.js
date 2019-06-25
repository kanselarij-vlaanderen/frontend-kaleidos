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
	subcase: belongsTo('subcase', { inverse: null }),
	agendaitem: belongsTo('agendaitem', { inverse: null }),
	announcement: belongsTo('announcement'),
	file: belongsTo('file'),
	convertedFile: belongsTo('file', {inverse:null}),
	newsletter: belongsTo('newsletter-info'),
	meetingRecord: belongsTo('meeting-record'),

	nameToDisplay: computed('chosenFileName', 'document', 'file', function () {
		const chosenFileName = this.get('chosenFileName');
		const title = this.get('document.title');
		if (chosenFileName) {
			return chosenFileName;
		} else if (this.get('file.filename')) {
			return this.get('file.filename');
		} else if (title) {
			return title;
		} else {
			return this.get('file.name');
		}
	})
});
