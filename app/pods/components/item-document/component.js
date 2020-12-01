import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
  isClickable: null,
  piece: null,
  agendaService: inject(),

  addedPieces: alias('agendaService.addedPieces'),

  checkAdded: computed('piece', async function() {
    // TODO this is dependant on documentContainer, ideally we want to get rid of this.
    // addedPieces is actually addedDocumentContainers..
    if (this.addedPieces && this.addedPieces.length > 0) {
      const container = await this.piece.get('documentContainer');
      try {
        return this.addedPieces.includes(container.get('uri'));
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // We hit his when showing less documents while the container call is pending
        return null;
      }
    }
    return null;
  }),

  actions: {
    async showPieceViewer(piece) {
      window.open(`/document/${(await piece).get('id')}`);
    },
  },
});
