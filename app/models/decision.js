import DS from 'ember-data';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import sortDocumentsByNameAndNumber from 'fe-redpencil/utils/sort-document-by-name-and-number';

let { Model, attr, belongsTo, hasMany, PromiseArray } = DS;

export default Model.extend({
  intl: inject(),
  richtext: attr("string"),
  shortTitle: attr("string"),
  approved: attr('boolean'),
  archived: attr('boolean'),
  title: attr('string'),
  numberVp: attr('string'),
  numberVr: attr('string'),

  subcase: belongsTo('subcase', { inverse: null }),
  publication: belongsTo('publication'),
  documentType: belongsTo('document-type'),
  documentVersions: hasMany('document-version', { inverse: null }),
  signedDocument: belongsTo('document'),

  decisionApproval: computed('signedDocument', function() {
    return this.intl.t('signed-document-decision', { name: this.get('signedDocument.name') });
  }),

  documents: computed('documentVersions.@each', function() {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.length > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              'documents': { id: documentVersionIds },
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((documents) => {
            // Sorting is done in the frontend to work around a Virtuoso issue, where
            // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
            // some items not being returned. By not having a sort parameter, this doesn't occur.
            return sortDocumentsByNameAndNumber(documents);
          });
        }
      }),
    });
  }),
});
