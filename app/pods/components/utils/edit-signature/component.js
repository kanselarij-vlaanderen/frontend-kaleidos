import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  store: inject(),
  fileService: inject(),
  signatureToEdit: null,

  uploadedFile: computed('signatureToEdit.file', function() {
    return this.signatureToEdit.get('file');
  }),

  downloadUrl: computed('signatureToEdit.file', function() {
    return `/files/${this.signatureToEdit.get('file.id')}/download`;
  }),

  actions: {
    closeModal() {
      this.signatureToEdit.rollbackAttributes();
      this.closeModal();
    },

    async saveChanges() {
      this.set('isLoading', true);
      const signature = await this.store.findRecord(
        'signature',
        await this.signatureToEdit.get('id')
      );
      if (this.get('uploadedFile')) {
        signature.set('file', await this.get('uploadedFile'));
      }
      signature.save().then(() => {
        this.set('isLoading', false);
        this.closeModal();
      });
    },

    async getUploadedFile(file) {
      this.set('fileName', file.filename);
      this.set('uploadedFile', file);
    },

    personSelected(person) {
      this.set('selectedPerson', person);
    },

    async removeFile() {
      await this.fileService.removeFile(this.get('uploadedFile.id'));
      this.set('uploadedFile', null);
    },
  },
});
