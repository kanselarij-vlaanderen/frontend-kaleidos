import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
const { Model, attr, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;
import { deprecatingAlias } from '@ember/object/computed';
import { A } from '@ember/array';

export default Model.extend({
  store: inject(),
  agendaService: inject(),

  addedDocuments: alias('agendaService.addedDocuments'),
  uri:attr('string'),

  confidential: attr('boolean'),
  created: attr('datetime'),
  forCabinet: attr('boolean'),

  documents: hasMany('document-version'),
  documentVersions: deprecatingAlias('documents', {
    id: 'model-refactor.documents',
    until: '?'
  }),


	type: belongsTo('document-type'),
  signedDecision: belongsTo('decision', { inverse: null }),
  signedMinutes: belongsTo('meeting-record', { inverse: null }),

  sortedDocuments: computed('documents.@each', function() {
    return PromiseArray.create({
      promise: this.get('documents').then((docs) => {
        const head = docs.filter(function(doc) {
          const previousVersion = doc.get('previousVersion.content');
          return !previousVersion;
        }).get('firstObject');
        const l = [];
        let next = head;
        while (next) {
          l.push(next);
          next = next.get('nextVersion.content');
        }
        return A(l);
      }),
    });
  }),
  sortedDocumentVersions: deprecatingAlias('sortedDocuments', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  lastDocument: computed(
    'sortedDocuments.@each',
    'documents.@each', // Why? TODO: Comment
    function() {
      return PromiseObject.create({
        promise: this.get('sortedDocuments').then((sortedDocuments) => {
          return sortedDocuments.get('lastObject');
        }),
      });
    }
  ),
  lastDocumentVersion: deprecatingAlias('lastDocument', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  reverseSortedDocuments: computed('sortedDocuments', function() {
    return PromiseArray.create({
      promise: this.get('sortedDocuments').then((sortedDocuments) => {
        return sortedDocuments.reverse();
      }),
    });
  }),
  reverseSortedDocumentVersions: deprecatingAlias('reverseSortedDocuments', {
    id: 'model-refactor.documents',
    until: '?'
  }),

  checkAdded: computed('uri', 'addedDocuments.@each', function() {
    if (this.addedDocuments) return this.addedDocuments.includes(this.get('uri'));
  })
});
