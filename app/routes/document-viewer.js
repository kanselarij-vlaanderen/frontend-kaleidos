import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		const documentVersion = params.document_version_id;
		return this.store.findRecord('document-version', documentVersion);
	}
});
