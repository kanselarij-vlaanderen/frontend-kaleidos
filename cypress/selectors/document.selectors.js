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
    showPieceViewer: '[data-test-vl-document-showPieceViewer]',
    delete: '[data-test-vl-document-delete-piece]',
  },

  // Old batch editing modal (meeting and subcase)
  // batch-document-edit
  batchDocumentEdit: {
    // TODO-selector unused selectors, no tests for subcase and agenda
    cancel: '[data-test-batch-document-edit-cancel]',
    save: '[data-test-batch-document-edit-save]',
  },

  // edit-document-row
  editDocumentRow: {
    // TODO-selector unused selectors
    row: '[data-test-edit-document-row]',
    type: '[data-test-edit-document-row-type]',
    accessLevel: '[data-test-edit-document-row-access-level]',
  },

  // New batch editing modal (agendaitem)
  // batch-documents-details-modal
  batchDocumentsDetails: {
    save: '[data-test-batch-documents-details-save]',
  },

  // batch-document-details-modal
  batchEditingRow: {
    // TODO-batchEdit new modal can select multiple documents and set the same value, new tests needed
    // TODO-selector unused selector
    row: '[data-test-batch-editing-row]',
  },

  // edit-document-row
  documentDetailsRow: {
    row: '[data-test-document-details-row]',
    type: '[data-test-document-details-row-type]',
    accessLevel: '[data-test-document-details-row-access-level]',
    undoDelete: '[data-test-document-details-row-undo-delete]',
    delete: '[data-test-document-details-row-delete]',
  },

  // vl-uploaded-document
  vlUploadedDocument: {
    deletePiece: '[data-test-vl-uploaded-document-delete-piece]',
    filename: '[data-test-vl-uploaded-document-filename]',
  },

  uploadedDocument: {
    nameInput: '[data-test-uploaded-document-name-input]',
    documentTypes: '[data-test-uploaded-document-types]',
  },

  // add-existing-piece
  addExistingPiece: {
    searchInput: '[data-test-add-existing-piece-search-input]',
    checkbox: '[data-test-add-existing-piece-checkbox]',
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

  // document-preview-sidebar
  documentPreviewSidebar: {
    sidebar: '[data-test-document-preview-sidebar-sidebar]',
    signatures: '[data-test-document-preview-sidebar-tabs-signatures]',
    versions: '[data-test-document-preview-sidebar-tabs-versions]',
    toggle: '[data-test-document-preview-sidebar-toggle]',
    tabs: {
      details: '[data-test-document-preview-sidebar-tabs-details]',
    },
  },

  // document-preview-details
  documentPreviewDetails: {
    cancel: '[data-test-document-preview-details-cancel]',
    save: '[data-test-document-preview-details-save]',
    edit: '[data-test-document-preview-details-edit]',
    name: '[data-test-document-preview-details-name]',
    documentType: '[data-test-document-preview-details-document-type]',
    accesLevel: '[data-test-document-preview-details-acces-level]',
    confidentiality: '[data-test-document-preview-details-confidentiality]',
    filetype: '[data-test-document-preview-details-filetype]',
    editor: {
      name: '[data-test-document-preview-details-editor-name]',
      documentType: '[data-test-document-preview-details-editor-document-type]',
      accesLevel: '[data-test-document-preview-details-editor-acces-level]',
      confidentiality: '[data-test-document-preview-details-editor-confidentiality]',
    },
  },

  // document-preview-versions-tab
  documentPreviewVersionsTab: {
    list: '[data-test-document-preview-versions-tab-list]',
  },

  // document-preview-version-card
  documentPreviewVersionCard: {
    container: '[data-test-document-preview-version-card-container]',
    details: '[data-test-document-preview-version-card-details]',
    name: '[data-test-document-preview-versions-card-name]',
    open: '[data-test-document-preview-version-card-open]',
  },

  // document-view
  documentView: {
    pdfView: '[data-test-document-view-pdfview]',
    text: '.textLayer > span',
  },

  // document-badge
  documentBadge: {
    link: '[data-test-document-badge-link]',
  },

};
export default selectors;
