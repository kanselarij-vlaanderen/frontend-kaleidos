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
	newsletter: belongsTo('newsletter-info'),

	sortedDocuments: computed('documentVersions', function () {
		return this.get('documentVersions').then(versions => {
			return versions.sortBy('versionNumber');
		});
	}),

	lastDocumentVersion: computed('documentVersions', async function () {
		return (await (await this.get('documentVersions')).sortBy('versionNumber')).get('lastObject');
	}),

	async getDocumentVersionsOfItem(item) {
		const modelName = item.get('constructor.modelName')
		if (modelName === 'agendaitem') {
			let documentVersions = await this.store.query('document-version', {
				filter: { document: { id: await this.get('id') }, agendaitem: { id: item.get('id') } },
				sort: '-version-number'
			});
			return documentVersions;
		} else {
			let documentVersions = await this.store.query('document-version', {
				filter: { document: { id: await this.get('id') }, subcase: { id: item.get('id') } },
				sort: '-version-number'
			});
			return documentVersions;
		}
	}
});
