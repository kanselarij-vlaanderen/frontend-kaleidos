import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	title: attr('string'),
	numberVp: attr('string'),
	numberVr: attr('string'),
	documentVersions: hasMany('document-version', { inverse: null }),
	remarks: hasMany('remark'),

	decision: belongsTo('decision'),
	type: belongsTo('document-type'),
	confidentiality: belongsTo('confidentiality'),

	sortedDocuments: computed.sort('documentVersions', function (a, b) {
		if (a.versionNumber > b.versionNumber) {
			return 1;
		} else if (a.versionNumber < b.versionNumber) {
			return -1;
		}
		return 0;
	}),

	lastDocumentVersion: computed('sortedDocuments', function () {
		return this.get('sortedDocuments').get('lastObject');
	})
});
