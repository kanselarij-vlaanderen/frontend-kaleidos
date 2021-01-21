import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';
import { warn } from '@ember/debug';

const {
  Model, attr, hasMany, belongsTo, PromiseArray, PromiseObject,
} = DS;

export default Model.extend({
  store: inject(),
  agendaService: inject(),

  addedPieces: alias('agendaService.addedPieces'),
  uri: attr('string'),

  created: attr('datetime'),

  pieces: hasMany('piece'),

  type: belongsTo('document-type'),
  agendaItemTreatment: belongsTo('agenda-item-treatment'),

  sortedPieces: computed('pieces.@each', function() {
    return PromiseArray.create({
      promise: this.get('pieces').then(async(pieces) => {
        const heads = pieces.filter(async(piece) => {
          const previousPiece = await piece.get('previousPiece');
          return !previousPiece;
        });
        if (heads.length <= 1) {
          const head = heads.get('firstObject');
          const sortedHeads = [];
          let next = head;
          while (next) {
            sortedHeads.push(next);
            next = await next.get('nextPiece');
          }
          return A(sortedHeads);
        }
        warn('More than 1 possible head for linked list. Linked list data possibly is broken. Falling back to sorting by piece creation date', heads.length > 1, {
          id: 'multiple-possible-linked-list-heads',
        });
        return pieces.sortBy('created');
      }),
    });
  }),

  lastPiece: computed(
    'sortedPieces.@each',
    'pieces.@each', // Why? TODO: Comment
    function() {
      return PromiseObject.create({
        promise: this.get('sortedPieces').then((sortedPieces) => sortedPieces.get('lastObject')),
      });
    }
  ),

  reverseSortedPieces: computed('pieces.@each', function() {
    return PromiseArray.create({
      promise: this.get('pieces').then((pieces) => pieces.sortBy('created').reverse()),
    });
  }),

  checkAdded: computed('uri', 'addedPieces.@each', function() {
    if (this.addedPieces) {
      return this.addedPieces.includes(this.get('uri'));
    }
    return null;
  }),
});
