import Mixin from '@ember/object/mixin';
import DS from 'ember-data';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import VRDocumentName, { compareFunction } from 'fe-redpencil/utils/vr-document-name';

let { PromiseArray, PromiseObject } = DS;

export default Mixin.create({
  documents: computed('documentVersions.@each.name', function () {
    return PromiseArray.create({
      promise: this.get('documentVersions').then((documentVersions) => {
        if (documentVersions && documentVersions.get('length') > 0) {
          const documentVersionIds = documentVersions.mapBy('id').join(',');
          return this.store.query('document', {
            filter: {
              'documents': { id: documentVersionIds },
            },
            page: {
              size: documentVersions.get('length'), // # documents will always be <= # document versions
            },
            include: 'type,documents,documents.access-level,documents.next-version,documents.previous-version',
          }).then((containers) => {
            // Sorting is done in the frontend to work around a Virtuoso issue, where
            // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
            // some items not being returned. By not having a sort parameter, this doesn't occur.
            const sortedDocVers = A(documentVersions.toArray()).sort((a, b) => {
              return compareFunction(new VRDocumentName(a.get('name')), new VRDocumentName(b.get('name')));
            });
            /*
              Code below for compatibility towards mixin consumers. Since names are now on each document(version)
              we cans sort on the documents themselves instead of on containers
            */
            return A(containers.toArray()).sort(function (a, b) {
              let matchingdocA = null;
              let matchingdocB = null;
              for (let i = 0; i < a.get('documents.length'); i++) {
                const doc = a.get('documents').objectAt(i);
                matchingdocA = sortedDocVers.filterBy('id', doc.id).sortBy('created').lastObject;
                if (matchingdocA) {
                  break;
                }
              }
              for (let i = 0; i < b.get('documents.length'); i++) {
                const doc = b.get('documents').objectAt(i);
                matchingdocB = sortedDocVers.filterBy('id', doc.id).sortBy('created').lastObject;
                if (matchingdocB) {
                  break;
                }
              }
              return sortedDocVers.indexOf(matchingdocA) - sortedDocVers.indexOf(matchingdocB)
            });
          });
        }
      })
    });
  }),

  documentsLength: computed('documents', function () {
    return PromiseObject.create({
      promise: this.get('documents').then((documents) => {
        return documents ? documents.get('length') : 0;
      })
    });
  }),

});
