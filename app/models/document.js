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
  created: attr('datetime'),
  forCabinet: attr('boolean'),

  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version'),

	type: belongsTo('document-type'),
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

  toggleConfidential: async function(){
    this.toggleProperty('confidential');
    await this.save();
    let documentVersions = await this.get('documentVersions');
    await Promise.all(documentVersions.map(documentVersion => {
      documentVersion.set('confidential', this.get('confidential'));
      documentVersion.save();
    }));
  },

  checkAdded: computed('uri', 'addedDocuments.@each', function() {
    if (this.addedDocuments) return this.addedDocuments.includes(this.get('uri'));
  }),

  name: alias('title')
});
