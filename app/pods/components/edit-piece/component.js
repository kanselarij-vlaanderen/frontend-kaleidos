import Component from '@ember/component';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  tagName: 'tr',
  myPieces: computed.alias('agendaitemOrSubcaseOrMeeting.pieces'),

  myLastPiece: computed('mySortedPieces.@each', function() {
    const mySortedPieces = this.get('mySortedPieces');
    return mySortedPieces.lastObject;
  }),

  myLastPieceName: computed('myLastPiece.name', function() {
    return this.get('myLastPiece.name');
  }),

  // TODO: DUPLICATE CODE IN agenda/agendaitem/agendaitem-case/subcase-document/document-link/component.js
  // TODO: DUPLICATE CODE IN agendaitem/agendaitem-case/subcase-document/linked-document-link/component.js
  // TODO: DUPLICATE CODE IN edit-piece/component.js
  // TODO: THIS CODE HAS BEEN REFACTORED TO USE BETTER VARIABLE NAMES
  mySortedPieces: computed('myPieces.@each', 'documentContainer.sortedPieces.@each', function() {
    return DS.PromiseArray.create({
      promise: (async() => {
        const pieceIds = {};
        const myPieces = await this.get('myPieces');
        if (myPieces) {
          myPieces.map((piece) => {
            pieceIds[piece.get('id')] = true;
          });
        }
        const piecesFromContainer = await this.get('documentContainer.sortedPieces');
        if (piecesFromContainer) {
          const matchingPieces = await piecesFromContainer.filter((piece) => pieceIds[piece.id]);
          return matchingPieces;
        }
      })(),
    });
  }),

  actions: {

    deleteRow(documentContainer) {
      documentContainer.set('deleted', true);
    },
    chooseDocumentContainerType(documentContainer, type) {
      documentContainer.set('type', type);
    },

    async chooseAccessLevel(piece, accessLevel) {
      piece.set('accessLevel', accessLevel);
    },
  },
});
