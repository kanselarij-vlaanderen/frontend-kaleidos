import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

const { Model, attr, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;

export default Model.extend({
	store: inject(),
	created: attr('date'),
	title: attr('string'),
	numberVp: attr('string'),
	numberVr: attr('string'),
	description: attr('string'),
	freezeAccessLevel: attr('boolean'),
	forCabinet: attr('boolean'),

	documentVersions: hasMany('document-version'),
	remarks: hasMany('remark'),
	
	type: belongsTo('document-type'),
	signedDecision: belongsTo('decision', { inverse: null }),
	signedMinutes: belongsTo('meeting-record', { inverse: null }),
	accessLevel: belongsTo('access-level'),

	sortedDocumentVersions: computed('documentVersions.@each', function () {
		return PromiseArray.create({
			promise: this.get('documentVersions').then(versions => {
				return versions.sortBy('versionNumber');
			})
		});
	}),

	lastDocumentVersion: computed('sortedDocumentVersions.@each', 'documentVersions.@each', function () {
		return PromiseObject.create({
			promise: this.get('sortedDocumentVersions').then((documentVersions) => {
				return documentVersions.get('lastObject');
			})
		})
	}),

	reverseSortedDocumentVersions: computed('sortedDocumentVersions', function () {
		return PromiseArray.create({
			promise: this.get('sortedDocumentVersions').then((documentVersions) => {
				return documentVersions.reverse();
			})
		})
	})
});
