/**
 * Deletes the provided document container's pieces, and also itself.
 *
 * @param documentContainerOrPromise {DocumentContainer | Promise<DocumentContainer>}
 * @returns {Promise}
 */
export async function deleteDocumentContainer(documentContainerOrPromise) {
  const documentContainer = await documentContainerOrPromise;
  if (documentContainer) {
    const pieces = await documentContainer.pieces;
    let latestPiece = null;
    for (let piece of pieces.slice()) {
      const next = await piece.nextPiece;
      if (!next) {
        latestPiece = piece;
        break;
      }
    }
    let firstDeletedPieceModelName = latestPiece.constructor.modelName;
    while (latestPiece) {
      const previousPiece = await latestPiece.previousPiece;
      const modelName = latestPiece.constructor.modelName;
      if (modelName === firstDeletedPieceModelName) {
        if (modelName === 'piece' || modelName === 'draft-piece') {
          await deletePiece(latestPiece);
        } else if (modelName === 'report' || modelName === 'minutes') {
          await deletePieceWithPieceParts(latestPiece);
        } else {
          console.debug(
            'Piece subclass might not be removed propery, add override to document-delete-helpers.js'
          );
        }
        latestPiece = previousPiece;
      } else {
        latestPiece = null;
      }
    }
  }
}

/**
 * Deletes the provided piece and its file(s), and its document container if the
 * container would otherwise be orphaned.
 *
 * @param pieceOrPromise {Piece | Promise<Piece>}
 * @returns {Promise}
 */
export async function deletePiece(pieceOrPromise) {
  const piece = await pieceOrPromise;
  const documentContainer = await piece.documentContainer;
  if (piece) {
    const draftPiece = await piece.draftPiece;
    if (draftPiece) {
      await deletePiece(draftPiece);
    }

    const file = await piece.file;
    await deleteFile(file);
    await piece.destroyRecord();
  }
  if (documentContainer) {
    const allPieces = await documentContainer.pieces;
    if (allPieces.length === 0) {
      return documentContainer.destroyRecord();
    }
  }
}

/**
 * Deletes the provided piece, its pieceParts and its file(s), and its document container if the
 * container would otherwise be orphaned.
 *
 * @param pieceOrPromise {Report | Promise<Report>}
 * @returns {Promise}
 */
export async function deletePieceWithPieceParts(pieceOrPromise) {
  const piece = await pieceOrPromise;
  const pieceParts = await piece.pieceParts;
  for (const piecePart of pieceParts.slice()) {
    await piecePart.destroyRecord();
  }
  await deletePiece(piece);
}

/**
 * Deletes the provided file and its derived file if it exists.
 *
 * @param fileOrPromise {File | Promise<File>}
 * @returns {Promise}
 */
export async function deleteFile(fileOrPromise) {
  const file = await fileOrPromise;
  if (file) {
    const derivedFile = await file.derived;
    if (derivedFile) {
      file.derived = null;
      await file.save();
    }
    return Promise.all([file.destroyRecord(), derivedFile?.destroyRecord()]);
  }
}
