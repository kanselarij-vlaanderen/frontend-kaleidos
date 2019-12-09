import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import EmberObject from '@ember/object';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, UploadDocumentMixin, {
  globalError: inject(),
  fileService: inject(),

  async didInsertElement() {
    this._super(...arguments);
    await this.resetPreferredAccessLevel();
  },

  classNames: ['vlc-document-card-item'],
  classNameBindings: ['aboutToDelete'],
  documentVersion: null,
  isEditingAccessLevel: false,

  aboutToDelete: computed('documentVersion.aboutToDelete', function() {
    if (this.documentVersion) {
      if (this.documentVersion.get('aboutToDelete')) {
        return 'deleted-state';
      }
    }
  }),

  preferredAccessLevel: null,

  resetPreferredAccessLevel: async function() {
    this.set('preferredAccessLevel', await this.documentVersion.get('accessLevel'));
  },

  actions: {
    cancel() {
      this.set('documentVersionToDelete', null);
      this.set('isVerifyingDelete', false);
    },

    verify() {
      this.globalError.showToast.perform(
        EmberObject.create({
          title: 'Opgelet!',
          message: 'Documentversie wordt verwijderd.',
          type: 'warning-undo',
          modelIdToDelete: this.documentVersionToDelete.get('id'),
        })
      );
      this.deleteDocumentVersionWithUndo();
      this.set('isVerifyingDelete', false);
      this.set('documentVersionToDelete', null);
    },

    deleteDocumentVersion(document) {
      this.set('documentVersionToDelete', document);
      this.set('isVerifyingDelete', true);
    },

    toggleConfidential(document) {
      document.toggleProperty('confidential');
      document.save();
    },

    chooseAccessLevel(accessLevel) {
      this.set('preferredAccessLevel', accessLevel);
    },

    async saveChanges() {
      let preferredAccessLevel = this.get('preferredAccessLevel');
      this.toggleProperty('isEditingAccessLevel');
      let documentVersion = this.get('documentVersion');
      if (preferredAccessLevel) {
        await documentVersion.set('accessLevel', preferredAccessLevel);
        await documentVersion.save();
      }
      this.resetPreferredAccessLevel();
    },
  },

  async deleteDocumentVersionWithUndo() {
    const { documentVersionToDelete } = this;
    const document = await documentVersionToDelete.get('document');
    const documentVersions = await document.get('documentVersions');
    if(documentVersions.length > 1) {
      await this.fileService.get('deleteDocumentVersionWithUndo').perform(documentVersionToDelete);
    }else {
      const documentToDelete = document;
      await this.fileService.get('deleteDocumentWithUndo').perform(documentToDelete).then(() => {
      });
    }

  },
});
