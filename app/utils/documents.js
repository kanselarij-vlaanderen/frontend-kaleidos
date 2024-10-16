import fetch from 'fetch';
import VRDocumentName,
{ compareFunction } from 'frontend-kaleidos/utils/vr-document-name';
import VrNotulenName,
{ compareFunction as compareNotulen } from 'frontend-kaleidos/utils/vr-notulen-name';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export const sortDocumentContainers = async (
  piecesOrPromise,
  containersOrPromise
) => {
  // Sorting is done in the frontend to work around a Virtuoso issue, where
  // FROM-statements for multiple graphs, combined with GROUP BY, ORDER BY results in
  // some items not being returned. By not having a sort parameter, this doesn't occur.
  const pieces = await piecesOrPromise;
  const containers = await containersOrPromise;

  const sortedPieces = pieces.slice().sort((pieceA, pieceB) =>
    compareFunction(
      new VRDocumentName(pieceA.get('name')),
      new VRDocumentName(pieceB.get('name'))
    )
  );
  // Load the pieces linked to container so we can access them later
  await Promise.all(
    containers.map(async (container) => await container.pieces)
  );
  /*
    Code below for compatibility towards mixin consumers.
    Since names are now on each piece
    we can sort on the pieces themselves instead of on containers
  */
  return containers.slice().sort((containerA, containerB) => {
    let matchingPieceA = null;
    let matchingPieceB = null;
    // Use .value() to get the value of a ManyArray, instead of working with the
    // deprecated PromiseManyArray. Because we loaded them earlier we're sure
    // there's data (if they were unloaded, they would be null here)
    let piecesA = containerA.hasMany('pieces').value();
    let piecesB = containerB.hasMany('pieces').value();
    for (let index = 0; index < piecesA.length; index++) {
      const piece = piecesA.slice().at(index);
      matchingPieceA = sortedPieces
        .filter((p) => p.id === piece.id)
        .slice()
        .sort((p1, p2) => p1.created - p2.created)
        .at(-1);
      if (matchingPieceA) {
        break;
      }
    }
    for (let index = 0; index < piecesB.length; index++) {
      const piece = piecesB.slice().at(index);
      matchingPieceB = sortedPieces
        .filter((p) => p.id === piece.id)
        .slice()
        .sort((p1, p2) => p1.created - p2.created)
        .at(-1);
      if (matchingPieceB) {
        break;
      }
    }
    return (
      sortedPieces.indexOf(matchingPieceA) -
      sortedPieces.indexOf(matchingPieceB)
    );
  });
};

export const sortPieceVersions = (pieces) => {
  // This function wraps sortPieces just so that the intent of calling it
  // is more obvious, i.e. when calling this function you're passing in all
  // the pieces that belong to a single document container.
  return sortPiecesByName(pieces, VRDocumentName, compareFunction);
};

export const sortPieces = async (
  pieces,
  { isApproval=false, isPreKaleidos=false }={},
) => {
  await Promise.all(pieces.map((piece) => piece.documentContainer));
  let positionsAvailable = !pieces.some(
    (piece) => piece.belongsTo('documentContainer').value().position === undefined
  );

  if (positionsAvailable) {
    return await sortPiecesByPosition(pieces);
  } else if (isApproval) {
    return sortPiecesByName(pieces, VrNotulenName, compareNotulen);
  } else if (isPreKaleidos) {
    return sortPiecesByName(pieces, VrLegacyDocumentName, compareLegacyDocuments);
  } else {
    return sortPiecesByName(pieces);
  }
}

const sortPiecesByName = (
  pieces,
  NameClass = VRDocumentName,
  sortingFunc = compareFunction
) => {
  const validNamedPieces = [];
  let invalidNamedPieces = [];
  for (const piece of pieces.slice()) {
    try {
      new NameClass(piece.name).parseMeta();
      validNamedPieces.push(piece);
    } catch {
      invalidNamedPieces.push(piece);
    }
  }
  validNamedPieces.sort((docA, docB) =>
    sortingFunc(new NameClass(docA.name), new NameClass(docB.name))
  );
  invalidNamedPieces = invalidNamedPieces.sort(
    (p1, p2) => p1.created - p2.created
  );
  invalidNamedPieces.reverse();

  return [...validNamedPieces, ...invalidNamedPieces];
};

const sortPiecesByPosition = async (pieces) => {
  await Promise.all(pieces.map((piece) => piece.documentContainer));

  return pieces.sort((p1, p2) => {
    const d1 = p1.belongsTo('documentContainer').value();
    const d2 = p2.belongsTo('documentContainer').value();

    return d1.position - d2.position || p1.created - p2.created;
  });
};

export const addPieceToAgendaitem = async function (agendaitem, piece) {
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
    throw new Error(
      `Failed to add document ${piece.get('id')} to agendaitem ${agendaitem.get(
        'id'
      )}`
    );
  }
};

export const restorePiecesFromPreviousAgendaitem = async function (
  agendaitem,
  documentContainer
) {
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
    throw new Error(
      `Failed to restore pieces from container ${documentContainer.get(
        'id'
      )} to agendaitem ${agendaitem.get('id')}`
    );
  }
};


export const containsConfidentialPieces = async function (pieces) {
  const piecesCopy = pieces?.slice();
  for (const piece of piecesCopy) {
    const pieceAccessLevel = await piece.accessLevel;
    if (pieceAccessLevel?.uri === CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK) {
      return true;
    }
  }
  return false;
}
