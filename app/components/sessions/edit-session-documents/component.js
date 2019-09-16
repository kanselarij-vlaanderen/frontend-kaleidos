import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin, {
  classNames: ["vl-form__group vl-u-bg-porcelain"],

  actions: {
    deleteRow(document) {
      document.set('deleted', true);
    },

    chooseDocumentType(document, type) {
      document.set('type', type);
    },

    async chooseAccessLevel(document, accessLevel) {
      document.set('accessLevel', accessLevel);
      let documentVersions = await document.get('documentVersions');
      documentVersions.forEach(documentVersion => documentVersion.set('accessLevel', accessLevel))
    },

    async saveChanges() {
      this.set('isLoading', true);
      const { documents } = this;
      await Promise.all(
        documents.map((document) => {
          if (document.get('deleted')) {
            return this.deleteDocument(document);
          } else {
            return document.save()
              .then(document => document.get('documentVersions'))
              .then(versions => Promise.all(versions.map(version => version.save())));
          }
        }));
      this.set('isLoading', false);
      this.cancelForm();
    },

    cancelEditing() {
      this.cancelForm();
    },
  }
});
