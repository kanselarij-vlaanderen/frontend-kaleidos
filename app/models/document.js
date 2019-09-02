import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
const { Model, attr, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  store: inject(),
  agendaService: inject(),
  addedDocuments: alias('agendaService.addedDocuments'),
  uri: attr('string'),
  created: attr('date'),
  title: attr('string'),
  numberVp: attr('string'),
  numberVr: attr('string'),
  description: attr('string'),
  numberVrOriginal: attr(),
  freezeAccessLevel: attr('boolean'),
  forCabinet: attr('boolean'),

  documentVersions: hasMany('document-version'),
  remarks: hasMany('remark'),

  type: belongsTo('document-type'),
  signedDecision: belongsTo('decision', { inverse: null }),
  signedMinutes: belongsTo('meeting-record', { inverse: null }),
  accessLevel: belongsTo('access-level'),

  sortedDocumentVersions: computed('documentVersions.@each', function() {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((versions) => {
        return versions.sortBy('versionNumber');
      }),
    });
  }),

  lastDocumentVersion: computed(
    'sortedDocumentVersions.@each',
    'documentVersions.@each',
    function() {
      return PromiseObject.create({
        promise: this.get('sortedDocumentVersions').then((documentVersions) => {
          return documentVersions.get('lastObject');
        }),
      });
    }
  ),

  reverseSortedDocumentVersions: computed('sortedDocumentVersions', function() {
    return PromiseArray.create({
      promise: this.get('sortedDocumentVersions').then((documentVersions) => {
        return documentVersions.reverse();
      }),
    });
  }),

  checkAdded: computed('uri', 'addedDocuments.@each', function() {
    if (this.addedDocuments) return this.addedDocuments.includes(this.get('uri'));
  }),

  name: computed('title', 'numberVr', 'numberVrOriginal', {
    get() {
      if (this.get('numberVr')) {
        return this.get('numberVr');
      } else if (this.get('numberVrOriginal')) {
        return this.get('numberVrOriginal');
      } else {
        return this.get('title');
      }
    },
    set(key, value) {
      if (this.get('numberVrOriginal')) {
        return this.set('numberVr', value);
      } else {
        return this.set('title', value);
      }
    }
  }),
});
