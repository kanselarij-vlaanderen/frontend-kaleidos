import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import { computed } from '@ember/object';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, UploadDocumentMixin, ModifiedMixin, {
	classNames: ['vl-u-spacer--large'],
	isAddingNewDocument: false,
	isEditing: false,
	isLoading: false,

	modelToAddDocumentVersionTo: computed('item.constructor', function () {
		return this.get('item.constructor.modelName');
	}),

	actions: {
		toggleIsAddingNewDocument() {
			this.toggleProperty('isAddingNewDocument');
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			this.toggleProperty('isEditing');
		},

		async uploadNewDocument() {
			this.set('isLoading', true);
			const modelName = await this.get('modelToAddDocumentVersionTo');
			const item = await this.get('item');
			this.set('isCreatingDocuments', true);
			await this.uploadFiles(item).then(async () => {
				if (modelName === 'agendaitem') {
					await this.updateModifiedProperty(await item.get('agenda'));
				}
				item.hasMany('documentVersions').reload();
				this.set('isCreatingDocuments', false);
				this.toggleProperty('isAddingNewDocument');
				this.set('isLoading', true);
			});
		}
	}
});
