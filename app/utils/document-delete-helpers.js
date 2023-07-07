/**
 * Deletes the provided document container's pieces, and also itself.
 *
 * @param documentContainerOrPromise {DocumentContainer | Promise<DocumentContainer>}
 * @returns {Promise}
 */
export async function deleteDocumentContainer(documentContainerOrPromise) {
  const documentContainer = await documentContainerOrPromise;
  if (documentContainer) {
    const pieces = await documentContainer.pieces.toArray();
    let latestPiece = null;
    for (let piece of pieces) {
      const next = await piece.nextPiece;
      if (!next) {
        latestPiece = piece;
        break;
      }
    }
    while (latestPiece) {
      const previousPiece = await latestPiece.previousPiece;
      if (latestPiece.constructor.modelName === 'piece') {
        await deletePiece(latestPiece);
      } else if (latestPiece.constructor.modelName === 'report') {
        await deleteReport(latestPiece);
      } else {
        console.debug(
          'Piece subclass might not be removed propery, add override to document-delete-helpers.js'
        );
      }
      latestPiece = previousPiece;
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
  if (documentContainer) {
    const allPieces = await documentContainer.pieces;
    if (allPieces.length === 0) {
      return documentContainer.destroyRecord();
    }
  }
}

/**
 * Deletes the provided report and its file(s), and its document container if the
 * container would otherwise be orphaned.
 *
 * @param reportOrPromise {Report | Promise<Report>}
 * @returns {Promise}
 */
export async function deleteReport(reportOrPromise) {
  const report = await reportOrPromise;
  const pieceParts = await report.pieceParts;
  for (const piecePart of pieceParts.toArray()) {
    await piecePart.destroyRecord();
  }
  await deletePiece(report);
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
