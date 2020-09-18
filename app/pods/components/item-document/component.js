import Component from '@ember/component';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  isClickable: null,
  documentContainer: null,
  myPieces: computed.alias('item.pieces'),

  lastPiece: computed('mySortedPieces.@each', function() {
    const sortedPieces = this.get('mySortedPieces');
    return sortedPieces.lastObject;
  }),

  lastPieceName: computed('lastPiece.name', function() {
    return this.get('lastPiece.name');
  }),

  mySortedPieces: computed('myPieces.@each', 'documentContainer.sortedPieces.@each', function() {
    return DS.PromiseArray.create({
      promise: (async() => {
        const itemPieceIds = {};
        const myPieces = await this.get('myPieces');
        if (myPieces) {
          myPieces.map((piece) => {
            itemPieceIds[piece.get('id')] = true;
          });
        }
        const containerPieces = await this.get('documentContainer.sortedPieces');
        if (containerPieces) {
          const matchingPieces = await containerPieces.filter((piece) => itemPieceIds[piece.id]);
          return matchingPieces;
        }
      })(),
    });
  }),

  actions: {
    async showPieceViewer(piece) {
      window.open(`/document/${(await piece).get('id')}`);
    },
  },
});
