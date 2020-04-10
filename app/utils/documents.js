import {A} from '@ember/array';
import VRDocumentName, {compareFunction} from 'fe-redpencil/utils/vr-document-name';
import DS from "ember-data";

let {PromiseObject} = DS;

export const sortDocuments = (model, containers) => {
  // Sorting is done in the frontend to work around a Virtuoso issue, where
  // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
  // some items not being returned. By not having a sort parameter, this doesn't occur.
  const sortedDocVers = A(model.get('documentVersions').toArray()).sort((a, b) => {
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
};

export const getDocumentsLength = (model, property) => {
  return PromiseObject.create({
    promise: model.get(property).then((documents) => {
      return documents ? documents.get('length') : 0;
    })
  });
};




