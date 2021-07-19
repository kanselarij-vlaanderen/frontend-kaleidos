const selectors = {
  // component document-card
  documentCard: {
    card: '[data-test-document-card]',
    name: {
      value: '[data-test-document-card-name-value]',
      input: '[data-test-document-card-name-input]',
      save: '[data-test-document-card-name-save]',
      cancel: '[data-test-document-card-name-cancel]',
    },
    versionHistory: '[data-test-document-card-version-history]',
    actions: '[data-test-document-card-actions]',
    delete: '[data-test-document-card-delete]',
    uploadPiece: '[data-test-document-upload-new-piece]',
  },

  // vl-document
  vlDocument: {
    piece: '[data-test-vl-document-piece]',
    name: '[data-test-vl-document-name]',
    delete: '[data-test-vl-document-delete-piece]',
  },

  // batch-document-edit
  batchDocumentEdit: {
    cancel: '[data-test-batch-document-edit-cancel]',
    save: '[data-test-batch-document-edit-save]',
  },

  // edit-document-row
  editDocumentRow: {
    row: '[data-test-edit-document-row]',
    type: '[data-test-edit-document-row-type]',
    accessLevel: '[data-test-edit-document-row-access-level]',
  },

  // vl-uploaded-document
  vlUploadedDocument: {
    deletePiece: '[data-test-vl-uploaded-document-delete-piece]',
    filename: '[data-test-vl-uploaded-document-filename]',
  },

  // add-existing-piece
  addExistingPiece: {
    searchInput: '[data-test-add-existing-piece-search-input]',
    // TODO-selector unused selector
    searchButton: '[data-test-add-existing-piece-search-button]',
  },

  // access-level-pill (currently only used in 3 document related components)
  accessLevelPill: {
    // Clicking the pill in this component toggles edit mode
    pill: '[data-test-access-level-pill]',
    save: '[data-test-access-level-pill-save]',
    cancel: '[data-test-access-level-pill-cancel]',
  },

  // linked-documents
  linkedDocuments: {
    add: '[data-test-linked-documents-add]',
  },

  // linked-document-link
  linkedDocumentLink: {
    typeLabel: '[data-test-linked-document-link-type-label]',
    card: '[data-test-linked-document-link-card]',
    // TODO-selector unused selector
    versionHistory: '[data-test-linked-document-link-version-history]',
  },
};
export default selectors;
