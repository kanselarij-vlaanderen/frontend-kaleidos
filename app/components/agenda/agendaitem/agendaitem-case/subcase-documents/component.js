import Component from '@ember/component';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { computed } from '@ember/object';
export default Component.extend(EditAgendaitemOrSubcase, isAuthenticatedMixin, UploadDocumentMixin, {
	classNames: ['vl-u-spacer--large'],
	isAddingNewDocument: false,
	isEditing: false,
	modelToAddDocumentVersionTo: computed('item.constructor', function() {
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
			this.uploadFiles(await this.get('item')).then(() => {
				this.get('item').hasMany('documentVersions').reload();
				this.get('item').reload();
				this.toggleProperty('isAddingNewDocument');
			});
		}
	}
});
