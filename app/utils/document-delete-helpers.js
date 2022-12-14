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
    for (let piece of pieces) {
      await deletePiece(piece);
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
    const file = await piece.file;
    await deleteFile(file);
    await piece.destroyRecord();
  }
  const allPieces = await documentContainer.pieces;
  if (allPieces.length === 0) {
    return documentContainer.destroyRecord();
  }
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
    return Promise.all([file.destroyRecord(), derivedFile?.destroyRecord]);
  }
}
