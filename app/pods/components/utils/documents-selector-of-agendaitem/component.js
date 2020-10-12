import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO this component is no longer used. It was used to link documents to a decision (agendaItemTreatment), might be broken as-is
export default Component.extend({
  agendaitem: null,
  decision: null,
  store: inject(),

  lastPieces: computed('agendaitem.pieces.@each', 'decision.pieces.@each', async function() {
    const {
      decision, agendaitem,
    } = this;
    const pieces = await agendaitem.get('pieces');
    const piecesAddedAlready = await decision.get('pieces');

    return Promise.all(pieces.map(async(piece) => {
      const typeLabel = await piece.get('type.label');
      const lastPiece = await piece.get('lastPiece');
      // Document is not updated for the piece.
      // Set diplay property for the type.
      lastPiece.set('typeLabel', typeLabel);
      const foundPiece = piecesAddedAlready.find((pieceToSearch) => pieceToSearch.get('id') === lastPiece.get('id'));
      if (foundPiece) {
        lastPiece.set('selected', true);
      }
      return lastPiece;
    }));
  }),

  actions: {
    async selectForPublication() {
      this.selectPiece(await this.get('lastPieces')); // TODO selectpiece() ? see comment at line 5
    },
  },
});
