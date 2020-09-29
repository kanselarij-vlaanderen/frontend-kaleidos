import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import {
  alias, deprecatingAlias
} from '@ember/object/computed';

import { A } from '@ember/array';
import { warn } from '@ember/debug';

const {
  Model, attr, hasMany, belongsTo, PromiseArray, PromiseObject,
} = DS;

export default Model.extend({
  store: inject(),
  agendaService: inject(),

  addedDocuments: alias('agendaService.addedDocuments'),
  uri: attr('string'),

  created: attr('datetime'),

  documents: hasMany('document-version'),
  documentVersions: deprecatingAlias('documents', {
    id: 'model-refactor.documents',
    until: '?',
  }),

  type: belongsTo('document-type'),
  signedMinutes: belongsTo('meeting-record', {
    inverse: null,
  }),

  sortedDocuments: computed('documents.@each', function() {
    return PromiseArray.create({
      promise: this.get('documents').then(async(docs) => {
        const heads = docs.filter(async(doc) => {
          const previousVersion = await doc.get('previousVersion');
          return !previousVersion;
        });
        if (heads.length <= 1) {
          const head = heads.get('firstObject');
          const sortedHeads = [];
          let next = head;
          while (next) {
            sortedHeads.push(next);
            next = await next.get('nextVersion');
          }
          return A(sortedHeads);
        }
        warn('More than 1 possible head for linked list. Linked list data possibly is broken. Falling back to sorting by document creation date', heads.length > 1, {
          id: 'multiple-possible-linked-list-heads',
        });
        return docs.sortBy('created');
      }),
    });
  }),
  sortedDocumentVersions: deprecatingAlias('sortedDocuments', {
    id: 'model-refactor.documents',
    until: '?',
  }),

  lastDocument: computed(
    'sortedDocuments.@each',
    'documents.@each', // Why? TODO: Comment
    function() {
      return PromiseObject.create({
        promise: this.get('sortedDocuments').then((sortedDocuments) => sortedDocuments.get('lastObject')),
      });
    }
  ),
  lastDocumentVersion: deprecatingAlias('lastDocument', {
    id: 'model-refactor.documents',
    until: '?',
  }),

  reverseSortedDocuments: computed('sortedDocuments', function() {
    return PromiseArray.create({
      promise: this.get('sortedDocuments').then((sortedDocuments) => sortedDocuments.reverse()),
    });
  }),
  reverseSortedDocumentVersions: deprecatingAlias('reverseSortedDocuments', {
    id: 'model-refactor.documents',
    until: '?',
  }),

  checkAdded: computed('uri', 'addedDocuments.@each', function() {
    if (this.addedDocuments) {
      return this.addedDocuments.includes(this.get('uri'));
    }
    return null;
  }),
});
