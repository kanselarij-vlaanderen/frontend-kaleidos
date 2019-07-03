import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import { inject } from '@ember/service';

export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, UploadDocumentMixin, ModifiedMixin, {
	globalError: inject(),
	classNames: ['vl-u-spacer--large'],
	isAddingNewDocument: false,
	isEditing: false,
	isLoading: false,
	item: null, // can be of type 'agendaitem' or 'subcase'

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
			this.set('isCreatingDocuments', true);
			try {
				const item = await this.get('item');
				await this.uploadFiles(item).then(async () => {
					if (this.modelToAddDocumentVersionTo === 'agendaitem') {
						this.changeFormallyOkPropertyIfNotSetOnTrue(item);
						await this.updateModifiedProperty(await item.get('agenda'));
						await item.save();
					}
					item.hasMany('documentVersions').reload();
				});
			} catch (e) {
				// TODO: Handle errors
			} finally {
				this.set('isCreatingDocuments', false);
				this.toggleProperty('isAddingNewDocument');
				this.set('isLoading', true);
			}
		}
	}
});
