const selectors = {
  // component document-card
  documentCard: {
    card: '[data-test-document-card]',
    titleHeader: '[data-test-document-card-title-header]',
    versionHistory: '[data-test-document-card-version-history]',
    actions: '[data-test-document-card-actions]',
    delete: '[data-test-document-card-delete]',
    uploadPiece: '[data-test-document-upload-new-piece]',
  },

  // vl-document
  vlDocument: {
    piece: '[data-test-vl-document-piece]',
    delete: '[data-test-vl-document-delete-piece]',
  },

  // edit-document-row
  editDocumentRow: {
    type: '[data-test-edit-document-row-type]',
    accessLevel: '[data-test-edit-document-row-access-level]',
  },

  // vl-uploaded-document
  modalPieceDelete: '[data-test-vl-uploaded-document-deletepiece]',
  modalPieceUploadedFilename: '[data-test-vl-uploaded-document-filename]',

  // add-existing-piece
  searchForLinkedDocumentsInput: '[data-test-search-existing-document]',
  searchForLinkedDocumentsButton: '[data-test-search-existing-document-button]',

  // linked-documents
  addLinkedDocuments: '[data-test-add-linked-documents]',

  // linked-document-link
  linkeddocumentTypeLabel: '[data-test-linkeddocument-type-label]',
  // unused selector
  showLinkedPiecesHistory: '[data-test-linked-document-version-history]',

};
export default selectors;
