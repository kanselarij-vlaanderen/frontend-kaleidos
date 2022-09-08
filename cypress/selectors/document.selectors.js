const selectors = {
  // component document-card
  documentCard: {
    card: '[data-test-document-card]',
    type: '[data-test-document-card-type]',
    name: {
      value: '[data-test-document-card-name-value]',
      input: '[data-test-document-card-name-input]',
    },
    pubLink: '[data-test-document-card-publication-link]',
    versionHistory: '[data-test-document-card-version-history]',
    actions: '[data-test-document-card-actions]',
    delete: '[data-test-document-card-delete]',
    uploadPiece: '[data-test-document-upload-new-piece]',
    editPiece: '[data-test-document-edit-piece]',
  },

  // vl-document
  vlDocument: {
    piece: '[data-test-vl-document-piece]',
    name: '[data-test-vl-document-name]',
    // TODO-selector cleanup selectors and usage
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
    input: '[data-test-document-details-input]',
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
    selector: '[data-test-access-level-pill-selector]',
    edit: '[data-test-access-level-pill] + button',
    save: '[data-test-access-level-pill-save]',
    cancel: '[data-test-access-level-pill-cancel]',
  },

  // linked-documents
  linkedDocuments: {
    add: '[data-test-linked-documents-add]',
  },

  // linked-document-link
  linkedDocumentLink: {
    card: '[data-test-linked-document-link-card]',
    typeLabel: '[data-test-linked-document-link-type-label]',
    name: '[data-test-linked-document-link-name]',
    // TODO-selector unused selector
    versionHistory: '[data-test-linked-document-link-version-history]',
  },

  // document-preview-sidebar
  documentPreviewSidebar: {
    open: '[data-test-document-preview-sidebar-open]',
    close: '[data-test-document-preview-sidebar-close]',
    tabs: {
      details: '[data-test-document-preview-sidebar-tab-details]',
      versions: '[data-test-document-preview-sidebar-tab-versions]',
      // TODO-selector unused selector
      signatures: '[data-test-document-preview-sidebar-tab-signatures]',
    },
  },

  // document-preview/details-tab
  previewDetailsTab: {
    cancel: '[data-test-details-tab-cancel]',
    save: '[data-test-details-tab-save]',
    edit: '[data-test-details-tab-edit]',
    name: '[data-test-details-tab-name]',
    documentType: '[data-test-details-tab-document-type]',
    accessLevel: '[data-test-details-tab-access-level]',
    confidentiality: '[data-test-details-tab-confidentiality]',
    filetype: '[data-test-details-tab-filetype]',
    editing: {
      name: '[data-test-details-tab-edit-name]',
      documentType: '[data-test-details-tab-edit-document-type]',
      accessLevel: '[data-test-details-tab-edit-access-level]',
    },
  },

  // document-preview/versions-tab
  previewVersionsTab: {
    // TODO-selector unused selector
    list: '[data-test-versions-tab-list]',
  },

  // document-preview/version-card
  previewVersionCard: {
    container: '[data-test-version-card-container]',
    details: '[data-test-version-card-details]',
    name: '[data-test-version-card-name]',
    open: '[data-test-version-card-open]',
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
