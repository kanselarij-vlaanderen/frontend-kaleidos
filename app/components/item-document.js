// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  isClickable: null,
  piece: null,
  agendaService: inject(),

  addedPieces: alias('agendaService.addedPieces'),

  checkAdded: computed('addedPieces.length', 'piece', async function() {
    // TODO this is dependant on documentContainer, ideally we want to get rid of this.
    // addedPieces is actually addedDocumentContainers..
    if (this.addedPieces && this.addedPieces.length > 0) {
      const container = await this.piece.get('documentContainer');
      try {
        return this.addedPieces.includes(container.get('uri'));
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // We hit his when showing less documents while the container call is pending
        return false;
      }
    }
    return false;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async showPieceViewer(piece) {
      window.open(`/document/${(await piece).get('id')}`);
    },
  },
});
