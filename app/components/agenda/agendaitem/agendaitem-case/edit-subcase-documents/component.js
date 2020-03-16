import Component from '@ember/component';
import UploadDocumentMixin from 'fe-redpencil/mixins/upload-document-mixin';

export default Component.extend(UploadDocumentMixin, {
  classNames: ['vl-form__group vl-u-bg-porcelain'],

  actions: {
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

    async cancelEditing() {
      const { documents } = this;
      documents.map(async (document) => {
        const version = await document.get('lastDocumentVersion');
        version.rollbackAttributes();
        version.belongsTo('accessLevel').reload();
        document.rollbackAttributes();
        document.belongsTo('type').reload();
      });
      this.cancelForm();
    },
  }
});
