import { A } from '@ember/array';
import VRDocumentName, { compareFunction } from 'frontend-kaleidos/utils/vr-document-name';
import fetch from 'fetch';

export const sortDocumentContainers = (pieces, containers) => {
  // Sorting is done in the frontend to work around a Virtuoso issue, where
  // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
  // some items not being returned. By not having a sort parameter, this doesn't occur.
  const sortedPieces = A(pieces.slice()).sort((pieceA, pieceB) => compareFunction(new VRDocumentName(pieceA.get('name')), new VRDocumentName(pieceB.get('name'))));
  /*
    Code below for compatibility towards mixin consumers.
    Since names are now on each piece
    we can sort on the pieces themselves instead of on containers
  */
  return A(containers.slice()).sort((containerA, containerB) => {
    let matchingPieceA = null;
    let matchingPieceB = null;
    for (let index = 0; index < containerA.get('pieces.length'); index++) {
      const piece = containerA.get('pieces').slice().at(index);
      matchingPieceA = sortedPieces.filter((p) => p.id === piece.id).slice().sort((p1, p2) => p1.created - p2.created).at(-1);
      if (matchingPieceA) {
        break;
      }
    }
    for (let index = 0; index < containerB.get('pieces.length'); index++) {
      const piece = containerB.get('pieces').slice().at(index);
      matchingPieceB = sortedPieces.filter((p) => p.id === piece.id).slice().sort((p1, p2) => p1.created - p2.created).at(-1);
      if (matchingPieceB) {
        break;
      }
    }
    return sortedPieces.indexOf(matchingPieceA) - sortedPieces.indexOf(matchingPieceB);
  });
};

export const sortPieces = (pieces, NameClass = VRDocumentName, sortingFunc = compareFunction) => {
  const validNamedPieces = [];
  let invalidNamedPieces = A();
  for (const piece of pieces) {
    try {
      (new NameClass(piece.name)).parseMeta();
      validNamedPieces.push(piece);
    } catch {
      invalidNamedPieces.push(piece);
    }
  }
  validNamedPieces.sort((docA, docB) => sortingFunc(new NameClass(docA.name), new NameClass(docB.name)));
  invalidNamedPieces = invalidNamedPieces.sort((p1, p2) => p1.created - p2.created);
  invalidNamedPieces.reverse();

  return [...validNamedPieces, ...invalidNamedPieces];
};

export const addPieceToAgendaitem = async function(agendaitem, piece) {
  const endpoint = `/agendaitems/${agendaitem.get('id')}/pieces`;
  const body = {
    data: {
      type: 'pieces',
      id: piece.get('id'),
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
    throw new Error(`Failed to add document ${piece.get('id')} to agendaitem ${agendaitem.get('id')}`);
  }
};

export const restorePiecesFromPreviousAgendaitem = async function(agendaitem, documentContainer) {
  const endpoint = `/agendaitems/${agendaitem.get('id')}/pieces/restore`;
  const body = {
    data: {
      type: 'pieces',
      id: documentContainer.get('id'),
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
    throw new Error(`Failed to restore pieces from container ${documentContainer.get('id')} to agendaitem ${agendaitem.get('id')}`);
  }
};
