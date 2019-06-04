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
	documentVersions: hasMany('document-version'),
	remarks: hasMany('remark'),
	description: attr('string'),
	type: belongsTo('document-type'),
	confidentiality: belongsTo('confidentiality'),
	signedDecision: belongsTo('decision'),

	sortedDocuments: computed('documentVersions', function () {
		return PromiseArray.create({
			promise: this.get('documentVersions').then(versions => {
				return versions.sortBy('versionNumber');
			})
		});
	}),

	lastDocumentVersion: computed('documentVersions.@each', function () {
		return PromiseObject.create({
			promise: this.store.query('document-version', {
				filter: { document: { id: this.get('id') } },
				sort: 'version-number'
			}).then((documentVersions) => {
				return documentVersions.get('lastObject')
			})
		})
	}),

	getDocumentVersionsOfItem(item) {
		const modelName = item.get('constructor.modelName');
		const filter = {
			document: { id: this.get('id') }
		};
		if (!modelName) {
			return [];
		}
		filter[modelName] = { id: item.get('id') };
		return PromiseArray.create({
			promise: this.store.query('document-version', {
				filter,
				sort: '-version-number'
			}).then((documentVersions) => {
				return documentVersions;
			})
		});
	}
});
