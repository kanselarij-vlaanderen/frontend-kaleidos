import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

let { Model, attr, belongsTo, hasMany, PromiseArray } = DS;

export default Model.extend({
  intl: inject(),
  agendaitem: belongsTo('agendaitem'),//{ inverse: null } ?
  report: belongsTo('document', { inverse: null }),
  newsletterInfo: belongsTo('newsletter-info'),
  decisionResultCode: belongsTo('decision-result-code', { inverse: null }),
  modified: attr('datetime'),
  created: attr('datetime'),

  // decisionApproval: computed('signedDocument', function () {
  //   return this.intl.t('signed-document-decision', { name: this.get('signedDocument.name') });
  // }),
  //
  // documents: computed('documentVersions.@each', function () {
  //   return PromiseArray.create({
  //     promise: this.get('documentVersions').then((documentVersions) => {
  //       if (documentVersions && documentVersions.length > 0) {
  //         const documentVersionIds = documentVersions.mapBy('id').join(',');
  //         return this.store.query('document', {
  //           filter: {
  //             'documents': { id: documentVersionIds },
  //           },
  //           include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
  //         }).then((documents) => {
  //           // Ignore sorting for the time being, as decisions only rarely contain more than one document
  //           return documents;
  //         });
  //       }
  //     }),
  //   });
  // }),
});
