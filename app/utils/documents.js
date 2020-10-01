import { A } from '@ember/array';
import VRDocumentName, { compareFunction } from 'fe-redpencil/utils/vr-document-name';
import DS from 'ember-data';
import fetch from 'fetch';

const {
  PromiseObject,
} = DS;

export const sortDocumentContainers = (pieces, containers) => {
  // Sorting is done in the frontend to work around a Virtuoso issue, where
  // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
  // some items not being returned. By not having a sort parameter, this doesn't occur.
  const sortedPieces = A(pieces.toArray()).sort((pieceA, pieceB) => compareFunction(new VRDocumentName(pieceA.get('name')), new VRDocumentName(pieceB.get('name'))));
  /*
    Code below for compatibility towards mixin consumers.
    Since names are now on each piece
    we can sort on the pieces themselves instead of on containers
  */
  return A(containers.toArray()).sort((containerA, containerB) => {
    let matchingPieceA = null;
    let matchingPieceB = null;
    for (let index = 0; index < containerA.get('pieces.length'); index++) {
      const piece = containerA.get('pieces').objectAt(index);
      matchingPieceA = sortedPieces.filterBy('id', piece.id).sortBy('created').lastObject;
      if (matchingPieceA) {
        break;
      }
    }
    for (let index = 0; index < containerB.get('pieces.length'); index++) {
      const piece = containerB.get('pieces').objectAt(index);
      matchingPieceB = sortedPieces.filterBy('id', piece.id).sortBy('created').lastObject;
      if (matchingPieceB) {
        break;
      }
    }
    return sortedPieces.indexOf(matchingPieceA) - sortedPieces.indexOf(matchingPieceB);
  });
};

export const getPropertyLength = (model, property) => PromiseObject.create({
  promise: model.get(property).then((property) => (property ? property.get('length') : 0)),
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
