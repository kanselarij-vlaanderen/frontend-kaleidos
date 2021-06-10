const selectors = {
  // component document-card
  documentCard: {
    card: '[data-test-document-card]',
    titleHeader: '[data-test-document-card-title-header]',
    actions: '[data-test-document-card-actions]',
    delete: '[data-test-document-card-delete]',
  },

  modalPieceDelete: '[data-test-vl-uploaded-document-deletepiece]',
  modalPieceUploadedFilename: '[data-test-vl-uploaded-document-filename]',
  documentUploadNewPiece: '[data-test-document-upload-new-piece]',
  showPiecesHistory: '[data-test-show-pieces-history]',
  singlePieceHistory: '[data-test-single-piece-history]',
  deletePieceFromhistory: '[data-test-delete-piece-from-history]',
  documentUploadShowMore: '[data-test-documents-show-more]',
  addLinkedDocuments: '[data-test-add-linked-documents]',
  searchForLinkedDocumentsInput: '[data-test-search-existing-document]',
  searchForLinkedDocumentsButton: '[data-test-search-existing-document-button]',
  searchForLinkedDocumentsLoader: '[data-test-search-loader]',
  linkeddocumentTypeLabel: '[data-test-linkeddocument-type-label]',

  editDocumentRow: {
    type: '[data-test-edit-document-row-type]',
    accessLevel: '[data-test-edit-document-row-access-level]',
  },
};
export default selectors;
