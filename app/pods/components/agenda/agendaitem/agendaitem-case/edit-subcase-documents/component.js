import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

  classNames: ['vl-form__group vl-u-bg-porcelain'],
  fileService: service(),
  agendaitemOrSubcaseOrMeeting: null,

  async deleteDocumentContainer(documentContainer) {
    await this.fileService.deleteDocumentContainer(documentContainer);
  },

  actions: {
    async saveChanges() {
      this.set('isLoading', true);
      const {
        documentContainers,
      } = this;
      await Promise.all(
        documentContainers.map((documentContainer) => {
          if (documentContainer.get('deleted')) {
            return this.deleteDocumentContainer(documentContainer);
          }
          return documentContainer.save()
            .then((savedDocumentContainer) => savedDocumentContainer.get('pieces'))
            .then((pieces) => Promise.all(pieces.map((piece) => piece.save())));
        })
      );
      this.set('isLoading', false);
      this.cancelForm();
    },

    async cancelEditing() {
      const {
        documentContainers,
      } = this;
      documentContainers.map(async(documentContainer) => {
        const piece = await documentContainer.get('lastPiece');
        piece.rollbackAttributes();
        piece.belongsTo('accessLevel').reload();
        documentContainer.rollbackAttributes();
        documentContainer.belongsTo('type').reload();
      });
      this.cancelForm();
    },
  },
});
