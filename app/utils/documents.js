import { A } from '@ember/array';
import VRDocumentName, { compareFunction } from 'fe-redpencil/utils/vr-document-name';
import DS from 'ember-data';
import fetch from 'fetch';

const {
  PromiseObject,
} = DS;

export const sortDocuments = (documentVersions, containers) => {
  // Sorting is done in the frontend to work around a Virtuoso issue, where
  // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
  // some items not being returned. By not having a sort parameter, this doesn't occur.
  const sortedDocVers = A(documentVersions.toArray()).sort((documentVersionA, documentVersionB) => compareFunction(new VRDocumentName(documentVersionA.get('name')), new VRDocumentName(documentVersionB.get('name'))));
  /*
    Code below for compatibility towards mixin consumers.
    Since names are now on each document(version)
    we cans sort on the documents themselves instead of on containers
  */
  return A(containers.toArray()).sort((containerA, containerB) => {
    let matchingdocA = null;
    let matchingdocB = null;
    for (let index = 0; index < containerA.get('documents.length'); index++) {
      const document = containerA.get('documents').objectAt(index);
      matchingdocA = sortedDocVers.filterBy('id', document.id).sortBy('created').lastObject;
      if (matchingdocA) {
        break;
      }
    }
    for (let index = 0; index < containerB.get('documents.length'); index++) {
      const document = containerB.get('documents').objectAt(index);
      matchingdocB = sortedDocVers.filterBy('id', document.id).sortBy('created').lastObject;
      if (matchingdocB) {
        break;
      }
    }
    return sortedDocVers.indexOf(matchingdocA) - sortedDocVers.indexOf(matchingdocB);
  });
};

export const getDocumentsLength = (model, property) => PromiseObject.create({
  promise: model.get(property).then((documents) => (documents ? documents.get('length') : 0)),
});

export const addDocumentToAgendaitem = async function(agendaitem, document) {
  const endpoint = `/agendaitems/${agendaitem.get('id')}/document-versions`;
  const body = {
    data: {
      type: 'documents',
      id: document.get('id'),
    },
  };
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Failed to add document ${document.get('id')} to agendaitem ${agendaitem.get('id')}`);
  }
};
