const selectors = {
  // component document-card
  documentCard: {
    card: '[data-test-document-card]',
    type: '[data-test-document-card-type]',
    name: {
      value: '[data-test-document-card-name-value]',
    },
    primarySourceCreated: '[data-test-document-card-primary-source-created]',
    primarySourceLink: '[data-test-document-card-primary-source-link]',
    pubLink: '[data-test-document-card-publication-link]',
    versionHistory: '[data-test-document-card-version-history]',
    actions: '[data-test-document-card-actions]',
    signMarking: '[data-test-document-card-sign-marking]',
    delete: '[data-test-document-card-delete]',
    uploadPiece: '[data-test-document-upload-new-piece]',
    editPiece: '[data-test-document-edit-piece]',
    generateNewPiece: '[data-test-document-generate-new-version]',
  },

  // document-edit-modal
  documentEdit: {
    nameInput: '[data-test-document-edit-name-input]',
    sourceFileReplace: '[data-test-document-edit-source-file-replace]',
    sourceFileReplacer: '[data-test-document-edit-source-file-replacer]',
    derivedFileReplace: '[data-test-document-edit-derived-file-replace]',
    derivedFileReplacer: '[data-test-document-edit-derived-file-replacer]',
    derivedFileDelete: '[data-test-document-edit-derived-file-delete]',
    derivedFileUploader: '[data-test-document-edit-derived-file-uploader]',
  },

  // vl-document
  vlDocument: {
    piece: '[data-test-vl-document-piece]',
    name: '[data-test-vl-document-name]',
    // TODO-selector cleanup selectors and usage
    delete: '[data-test-vl-document-delete-piece]',
  },

  // New batch editing modal (agendaitem)
  // batch-documents-details-modal
  batchDocumentsDetails: {
    selectAll: '[data-test-batch-documents-details-select-all]',
    save: '[data-test-batch-documents-details-save]',
  },

  // batch-editing-row
  batchEditingRow: {
    type: '[data-test-batch-editing-row-type]',
    accesLevel: '[data-test-batch-editing-row-access-level]',
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
    container: '[data-test-uploaded-document-container]',
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
    name: '[data-test-linked-document-link-name]',
  },

  // document-preview-modal
  documentPreview: {
    title: '[data-test-document-preview-title]',
    downloadLink: '[data-test-document-preview-download-link]',
  },

  // document-preview-sidebar
  documentPreviewSidebar: {
    open: '[data-test-document-preview-sidebar-open]',
    tabs: {
      details: '[data-test-document-preview-sidebar-tab-details]',
      signatures: '[data-test-document-preview-sidebar-tab-signatures]',
      versions: '[data-test-document-preview-sidebar-tab-versions]',
    },
  },

  // document-preview/details-tab
  previewDetailsTab: {
    cancel: '[data-test-details-tab-cancel]',
    save: '[data-test-details-tab-save]',
    delete: '[data-test-details-tab-delete]',
    edit: '[data-test-details-tab-edit]',
    name: '[data-test-details-tab-name]',
    documentType: '[data-test-details-tab-document-type]',
    accessLevel: '[data-test-details-tab-access-level]',
    sourceFile: '[data-test-document-details-panel-source-file]',
    editing: {
      name: '[data-test-details-tab-edit-name]',
      documentType: '[data-test-details-tab-edit-document-type]',
      accessLevel: '[data-test-details-tab-edit-access-level]',
      upload: '[data-test-document-details-panel-upload]',
    },
  },

  // document-preview/signatures-tab
  previewSignaturesTab: {
    statusPill: '[data-test-signatures-tab-status-pill]',
    deleteSignFlow: '[data-test-signatures-tab-delete-signflow]',
    markForSignflow: '[data-test-signatures-tab-mark-for-signflow]',
  },

  // document-preview/version-card
  previewVersionCard: {
    container: '[data-test-version-card-container]',
    details: '[data-test-version-card-details]',
    name: '[data-test-version-card-name]',
  },

  // document-view
  documentView: {
    pdfView: '[data-test-document-view-pdfview]',
  },

  // document-badge
  documentBadge: {
    link: '[data-test-document-badge-link]',
    isNew: '[data-test-document-badge-isNew]',
  },

};
export default selectors;
