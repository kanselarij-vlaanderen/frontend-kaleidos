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
	documentVersions: hasMany('document-version', { inverse: null }),
	remarks: hasMany('remark'),
	description: attr('string'),
	type: belongsTo('document-type'),
	confidentiality: belongsTo('confidentiality'),
	signedDecision: belongsTo('decision'),

	sortedDocumentVersions: computed('documentVersions', function () {
		return PromiseArray.create({
			promise: this.get('documentVersions').then(versions => {
				return versions.sortBy('versionNumber');
			})
		});
	}),

	lastDocumentVersion: computed('sortedDocumentVersions.@each', function () {
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
