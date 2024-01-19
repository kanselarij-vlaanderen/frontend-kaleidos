/**
* Groups an array of (submitted) pieces by their subcaseName property.
* if there is a subcaseCreated property, the subcases are sorted from new to old
*/
export function groupBySubcaseName (pieces) {
  let subcasesWithPieces = [];
  let subcasesObject = {};
  for (const piece of pieces) {
    if (piece.subcaseName) {
      if (!subcasesObject[piece.subcaseName]) {
        subcasesObject[piece.subcaseName] = {
          subcaseCreated: piece.subcaseCreated,
          pieces: []
        };
      }
      subcasesObject[piece.subcaseName].pieces.push(piece);
    } else {
      if (!subcasesObject.default) {
        subcasesObject.default = {
          subcaseCreated: piece.subcaseCreated,
          pieces: []
        };
      }
      subcasesObject.default.pieces.push(piece);
    }
  }
  for (const subcaseName in subcasesObject) {
    if (Object.prototype.hasOwnProperty.call(subcasesObject, subcaseName)) {
      subcasesWithPieces.push({
        subcaseName: subcaseName !== 'default' ? subcaseName : undefined,
        subcaseCreated: subcasesObject[subcaseName].subcaseCreated,
        pieces: subcasesObject[subcaseName].pieces
      })
    }
  }
  return subcasesWithPieces.sort((a, b) => {
    if (a.subcaseCreated > b.subcaseCreated) {
      return -1;
    } else if (b.subcaseCreated > a.subcaseCreated) {
      return 1;
    }
    return 0;
  });
}
