import sortDocumentsByNameAndNumber from 'fe-redpencil/utils/sort-document-by-name-and-number';
import Mixin from '@ember/object/mixin';
import DS from "ember-data";
import { computed } from '@ember/object';

let { PromiseArray, PromiseObject } = DS;

export default Mixin.create({
  documents: computed('documentVersions.@each', function() {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.map((item) => item.get('id')).join(',');

          return this.store.query('document', {
            filter: {
              'document-versions': { id: documentVersionIds },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((documents) => {
            // Sorting is done in the frontend to work around a Virtuoso issue, where
            // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
            // some items not being returned. By not having a sort parameter, this doesn't occur.
            return sortDocumentsByNameAndNumber(documents);
          });
        }
      })
    });
  }),

  documentsLength: computed('documents', function() {
    return PromiseObject.create({
      promise: this.get('documents').then((documents) => {
        return documents ? documents.get('length') : 0;
      })
    });
  }),

});
