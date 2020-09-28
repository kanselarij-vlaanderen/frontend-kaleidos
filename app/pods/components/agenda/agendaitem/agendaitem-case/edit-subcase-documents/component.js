import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

  classNames: ['vl-form__group vl-u-bg-porcelain'],
  fileService: service(),
  agendaitemOrSubcaseOrMeeting: null,

  async deleteDocument(document) {
    await this.fileService.deleteDocument(document);
  },

  actions: {
    async saveChanges() {
      this.set('isLoading', true);
      const {
        documents,
      } = this;
      await Promise.all(
        documents.map((document) => {
          if (document.get('deleted')) {
            return this.deleteDocument(document);
          }
          return document.save()
            .then((savedDocument) => savedDocument.get('documentVersions'))
            .then((versions) => Promise.all(versions.map((version) => version.save())));
        })
      );
      this.set('isLoading', false);
      this.cancelForm();
    },

    async cancelEditing() {
      const {
        documents,
      } = this;
      documents.map(async(document) => {
        const version = await document.get('lastDocumentVersion');
        version.rollbackAttributes();
        version.belongsTo('accessLevel').reload();
        document.rollbackAttributes();
        document.belongsTo('type').reload();
      });
      this.cancelForm();
    },
  },
});
