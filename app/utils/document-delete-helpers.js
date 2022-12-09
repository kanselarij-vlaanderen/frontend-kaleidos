export async function deleteDocumentContainer(documentContainerOrPromise) {
  const documentContainer = await documentContainerOrPromise;
  if (documentContainer) {
    const pieces = await documentContainer.pieces;
    for (let piece of pieces) {
      await deletePiece(piece);
    }
    return documentContainer.destroyRecord();
  }
}

export async function deletePiece(pieceOrPromise) {
  const piece = await pieceOrPromise;
  if (piece) {
    const file = await piece.file;
    await deleteFile(file);
    return piece.destroyRecord();
  }
}

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
