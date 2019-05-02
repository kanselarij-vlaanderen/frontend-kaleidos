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
		return model.save();
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
					await item.save();
				}))
			}
			const model = await this.setNewPropertiesToModel(item);
			model.reload();

			// await this.get('agendaitem').belongsTo('subcase').reload();
			// await item.hasMany('documentVersions').reload();
			this.toggleProperty('isEditing');
		},
	}
});
