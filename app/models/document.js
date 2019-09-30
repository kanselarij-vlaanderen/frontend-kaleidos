import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
const { Model, attr, hasMany, belongsTo, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  store: inject(),
  agendaService: inject(),

  addedDocuments: alias('agendaService.addedDocuments'),
  uri:attr('string'),

  archived: attr('boolean'),
  title: attr('string'),
  description: attr('string'),
  confidential: attr('boolean'),
  created: attr('date'),
  numberVp: attr('string'),
  numberVr: attr('string'),
  numberVrOriginal: attr(),
  freezeAccessLevel: attr('boolean'),
  forCabinet: attr('boolean'),

  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version'),

	type: belongsTo('document-type'),
  accessLevel: belongsTo('access-level'),
  signedDecision: belongsTo('decision', { inverse: null }),
  signedMinutes: belongsTo('meeting-record', { inverse: null }),

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

  storeAccessLevel: async function(accessLevel){
    this.set('accessLevel', accessLevel);
    let versions = await this.get('documentVersions');
    let promises = versions.map((version) => {
      version.set('accessLevel', accessLevel);
      return version.save();
    });
    promises.push(this.save());
    return Promise.all(promises);
  },

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
