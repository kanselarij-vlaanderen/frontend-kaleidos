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

	sortedDocuments: computed('documentVersions', async function(){
		let versions = await this.get('documentVersions'); 
		return versions.sortBy('versionNumber');
	}),

	lastDocumentVersion: computed('sortedDocuments', async function () {
		return (await this.get('sortedDocuments')).get('lastObject');
	})
});
