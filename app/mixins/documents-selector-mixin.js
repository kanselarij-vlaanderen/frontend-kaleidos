import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';

export default Mixin.create({
	store: inject(),
	documentVersionsSelected: null,
	isEditing: false,

	async setNewPropertiesToModel(model) {
		const { propertiesToSet } = this;
		propertiesToSet.map((property) => {
			model.set(property, this.get(property));
		})
		return model.save().then((model) => model.reload());
	},

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async selectDocument(documents) {
			this.set('documentVersionsSelected', documents);
		},

		async cancelEditing() {
			const item = await this.get('item');
			item.rollbackAttributes();
			this.toggleProperty('isEditing');
		},

		async saveChanges() {
			this.set('isLoading', true);
			const item = await this.get('item');
			const documentVersionsSelected = this.get('documentVersionsSelected');
			const itemDocumentsToEdit = await item.get('documentVersions');

			if (documentVersionsSelected) {
				await Promise.all(documentVersionsSelected.map(async (documentVersion) => {
					if (documentVersion.get('selected')) {
						item.get('documentVersions').addObject(documentVersion);
					} else {
						const foundDocument = itemDocumentsToEdit.find((item) => item.get('id') == documentVersion.get('id'));
						if (foundDocument) {
							item.get('documentVersions').removeObject(documentVersion);
						}
					}
				}))
			}
			this.setNewPropertiesToModel(item).then((newModel) => {
				newModel.reload();
				this.set('isLoading', false);
				this.toggleProperty('isEditing');
			});
		}
	}
});
