import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, hasMany, belongsTo, PromiseArray } = DS;

export default Model.extend({
	created: attr('date'),
	title: attr('string'),
	numberVp: attr('string'),
	numberVr: attr('string'),
	documentVersions: hasMany('document-version', { inverse: null }),
	remarks: hasMany('remark'),
	description: attr('string'),
	type: belongsTo('document-type'),
	confidentiality: belongsTo('confidentiality'),

	sortedDocuments: computed('documentVersions', function () {
		return this.get('documentVersions').then(versions => {
			return versions.sortBy('versionNumber');
		});
	}),

	lastDocumentVersion: computed('documentVersions.@each', async function () {
		return (await (await this.get('documentVersions')).sortBy('versionNumber')).get('lastObject');
	}),

	filteredDocumentVersions: computed('documentVersions.@each', 'item.documents.@each', function () {
		return this.get('documentVersions')
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
