import Component from '@ember/component';
import $ from 'jquery';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(isAuthenticatedMixin, UploadDocumentMixin, {
	classNames: ["vl-u-spacer-extended-bottom-s"],
	isShowingVersions: false,
	isUploadingNewVersion: false,
	uploadedFile: null,
	fileName: null,
	isEditing: false,

	numberVr: computed('document.numberVr', function () {
		return this.get('document.numberVr')
	}),

	openClass: computed('isShowingVersions', function () {
		if (this.get('isShowingVersions')) {
			return "js-vl-accordion--open";
		}
	}),

	modelToAddDocumentVersionTo: computed('item', function () {
		return this.get('item.constructor.modelName');
	}),

	filteredDocumentVersions: computed('document.documentVersions.@each', 'item.documentVersions.@each', function () {
		return this.get('document').getDocumentVersionsOfItem(this.get('item'));
	}),

	lastDocumentVersion: computed('filteredDocumentVersions.@each', function () {
		return (this.get('filteredDocumentVersions') || []).objectAt(0);
	}),

	actions: {
		showVersions() {
			this.toggleProperty('isShowingVersions');
		},

		async uploadNewVersion() {
			const { item, uploadedFile, fileName } = this;
			const document = await this.get('document');
			const newVersion = await document.get('lastDocumentVersion');
			uploadedFile.set('fileName', fileName);
			const newDocumentVersion = await this.createNewDocumentVersion(uploadedFile, document, newVersion.get('versionNumber'));

			document.set('lastDocumentVersion', newDocumentVersion);
			await item.hasMany('documentVersions').reload();
			await item.save();

			if (!this.get('isDestroyed')) {
				this.set('isUploadingNewVersion', false);
			}
		},

		async openUploadDialog() {
			const uploadedFile = this.get('uploadedFile');
			if (uploadedFile && uploadedFile.id) {
				this.removeFile(uploadedFile.id);
			}
			this.toggleProperty('isUploadingNewVersion');
		},

		async getUploadedFile(file) {
			this.set('fileName', file.filename)
			this.set('uploadedFile', file);
		},

		toggleIsEditing() {
			if (!this.get('document.numberVr')) {
				return;
			}
			this.get('document').rollbackAttributes();
			this.toggleProperty('isEditing');
		},

		saveChanges() {
			const document = this.get('document');
			document.set('numberVr', this.get('numberVr'))
			document.save().then(() => {
				this.toggleProperty('isEditing');
			});
		}
	},

	removeFile() {
		$.ajax({
			method: "DELETE",
			url: '/files/' + this.get('uploadedFile.id')
		});
		this.set('uploadedFile', null);
	}
});
