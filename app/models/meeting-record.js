import DS from 'ember-data';
import { computed } from '@ember/object';
const { Model, attr, hasMany, belongsTo, PromiseArray } = DS;

export default Model.extend({
	created: attr('date'),
	modified: attr('date'),
	announcements: attr('string'),
	others: attr('string'),
	description: attr('string'),

	attendees: hasMany('mandatee'),
	signedDocumentVersions: hasMany('document-version'),

	agendaitem: belongsTo('agendaitem'),
	meeting: belongsTo('meeting'),

	sortedDocumentVersions: computed.sort('signedDocumentVersions', function (a, b) {
		if (a.versionNumber > b.versionNumber) {
			return 1;
		} else if (a.versionNumber < b.versionNumber) {
			return -1;
		}
		return 0;
	}),

	latestDocumentVersion: computed('sortedDocumentVersions', function () {
		return this.get('sortedDocumentVersions.lastObject');
	}),

	compare(a, b) {
		if (a.priority < b.priority) {
			return -1;
		}
		if (a.priority > b.priority) {
			return 1;
		}
		return 0;
	},

	sortedAttendees: computed('attendees.@each', function () {
		return PromiseArray.create({
			promise: this.get('attendees').then((attendees) => {
				return attendees;
			})
		})
	})
});
