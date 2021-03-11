import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  store: inject(),
  fileService: inject(),
  selectedPerson: null,

  name: computed('selectedPerson', function() {
    if (this.selectedPerson) {
      return this.selectedPerson.get('nameToDisplay');
    }
    return null;
  }),

  downloadUrl: computed('uploadedFile', function() {
    return `/files/${this.uploadedFile.get('id')}/download`;
  }),

  actions: {
    personSelected(person) {
      this.set('selectedPerson', person);
    },

    closeModal() {
      this.closeModal();
    },

    async createSignature() {
      this.set('isLoading', true);
      const newSignature = this.store.createRecord('signature', {
        name: this.get('name'),
        function: this.get('function'),
        isActive: false,
        person: await this.get('selectedPerson'),
        file: await this.get('uploadedFile'),
      });
      newSignature.save().then(() => {
        this.clearValues();
        this.set('isLoading', false);
        this.closeModal();
      });
    },
    async getUploadedFile(file) {
      this.set('fileName', file.filename);
      this.set('uploadedFile', file);
    },

    async removeFile() {
      await this.fileService.removeFile(this.get('uploadedFile.id'));
      this.set('uploadedFile', null);
    },
  },

  clearValues() {
    this.set('selectedPerson', null);
    this.set('name', null);
    this.set('function', null);
  },
});
