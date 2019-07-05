import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import EmberObject from '@ember/object';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend(UploadDocumentMixin, {
	globalError: inject(),
	fileService: inject(),

	classNames: ["vlc-document-card-item"],
	classNameBindings: ['aboutToDelete'],
	documentVersion: null,

	aboutToDelete: computed('documentVersion.aboutToDelete', function () {
		if (this.documentVersion) {
			if (this.documentVersion.get('aboutToDelete')) {
				return "deleted-state";
			}
		}
	}),

	actions: {
		cancel() {
			this.set('documentVersionToDelete', null);
			this.set('isVerifyingDelete', false);
		},

		verify() {
			this.globalError.showToast.perform(EmberObject.create({
				title: 'Opgelet!',
				message: "Documentversie wordt verwijderd.",
				type: "warning-undo",
				modelIdToDelete: this.documentVersionToDelete.get('id')
			}));
			this.fileService.get('deleteDocumentWithUndo').perform(this.documentVersionToDelete);
			this.set('isVerifyingDelete', false);
			this.set('documentVersionToDelete', null);
		},

		deleteDocumentVersion(document) {
			this.set('documentVersionToDelete', document);
			this.set('isVerifyingDelete', true);
		}
	}
});
