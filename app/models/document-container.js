import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { PromiseArray, PromiseObject } from '@ember-data/store/-private';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';
import { warn } from '@ember/debug';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  store: inject(),
  agendaService: inject(),

  addedPieces: alias('agendaService.addedPieces'),
  uri: attr('string'),

  created: attr('datetime'),

  pieces: hasMany('piece'),

  type: belongsTo('concept'),
  agendaItemTreatment: belongsTo('agenda-item-treatment'),

  // TODO this computed property is used in:
  // - Documents::LinkedDocumentLink
  // - document-container#lastPiece
  // Refactor these uses and remove this property
  sortedPieces: computed('pieces.[]', function() {
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

  // TODO this computed property is used in:
  // - Documents::LinkedDocumentList
  // - WebComponents::VlTableActions
  // - NewsletterItem::TableRow
  // - NewsletterItem::EditPanel
  // - cases.case.subcases.subcase.documents controller#setPreviousPiecesFromAgendaitem
  // - agenda.agendaitems.agendaitem.documents controller#setPreviousPiecesFromAgendaitem
  // Refactor these uses and remove this property
  lastPiece: computed(
    'sortedPieces.[]',
    'pieces.[]', // Why? TODO: Comment
    function() {
      return PromiseObject.create({
        promise: this.get('sortedPieces').then((sortedPieces) => sortedPieces.get('lastObject')),
      });
    }
  ),
});
