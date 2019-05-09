import DS from 'ember-data';
import { computed } from '@ember/object';
const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	modified: attr('date'),
	announcements: attr('string'),
	others: attr('string'),
	description: attr('string'),
	attendees: hasMany('mandatee'),
	agendaitem: belongsTo('agendaitem'),
	meeting: belongsTo('meeting'),
	signedDocumentVersions: hasMany('document-version'),

	sortedDocumentVersions: computed.sort('signedDocumentVersions', function(a,b) {
		if(a.versionNumber > b.versionNumber) {
			return 1;
		} else if (a.versionNumber < b.versionNumber){
			return -1;
		}
		return 0;
	}),

	latestDocumentVersion: computed('sortedDocumentVersions', function() {
		return this.get('sortedDocumentVersions.lastObject');
	})
});
