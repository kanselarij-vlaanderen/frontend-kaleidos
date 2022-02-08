const selectors = {

  /**
    ROUTES
  */

  // publications\index\template
  publicationsIndex: {
    title: '[data-test-route-publications-index-title]',
    filterContent: '[data-test-route-publications-index-filter-content]',
    newPublication: '[data-test-route-publications-index-new-publication]',
    dataTable: '[data-test-route-publications-index-data-table]',
    loading: '[data-test-route-publications-index-loading]',
    columnHeader: 'data-test-route-publications-index-th=',
    configIcon: '[data-test-route-publications-index-config-modal-icon]',
    numberSelector: '.auk-form-group',
  },

  // publications\publication\template
  publicationHeader: {
    number: '[data-test-route-publications-publication-header-number]',
    shortTitle: '[data-test-route-publications-publication-header-short-title]',
  },

  // publications\publication\translations\template
  publicationTranslations: {
    documents: '[data-test-route-publications---translations-tab-documents]',
    finished: '[data-test-route-publications---translations-tab-finished]',
    // TODO-SELECTOR unused selector
    requests: '[data-test-route-publications---translations-tab-requests]',
  },

  // publications\publication\translations\documents\template
  translationsDocuments: {
    add: '[data-test-route-publications---translations-documents-add]',
    requestTranslation: '[data-test-route-publications---translations-documents-request-translation]',
    tableRow: '[data-test-route-publications---translations-documents-table-row]',
    row: {
      checkbox: '[data-test-route-publications---translations-documents-row-checkbox]',
      documentName: '[data-test-route-publications---translations-documents-row-document-name]',
      options: '[data-test-route-publications---translations-documents-row-options]',
      edit: '[data-test-route-publications---translations-documents-row-edit]',
      delete: '[data-test-route-publications---translations-documents-row-delete]',
    },
  },

  // publications\publication\proofs\documents\template
  proofsDocuments: {
    newRequest: '[data-test-route-publications---proofs-documents-new-request]',
    initialRequest: '[data-test-route-publications---proofs-documents-initial-request]',
    extraRequest: '[data-test-route-publications---proofs-documents-extra-request]',
    finalRequest: '[data-test-route-publications---proofs-documents-final-request]',
    add: '[data-test-route-publications---proofs-documents-add]',
    addSourceProof: '[data-test-route-publications---proofs-documents-add-source-proof]',
    addCorrectedProof: '[data-test-route-publications---proofs-documents-add-corrected-proof]',
    tableRow: '[data-test-route-publications---proofs-documents-table-row]',
    row: {
      checkbox: '[data-test-route-publications---proofs-documents-row-checkbox]',
      documentName: '[data-test-route-publications---proofs-documents-row-document-name]',
      corrected: '[data-test-route-publications---proofs-documents-row-corrected]',
      options: '[data-test-route-publications---proofs-documents-row-options]',
      edit: '[data-test-route-publications---proofs-documents-row-edit]',
      delete: '[data-test-route-publications---proofs-documents-row-delete]',
    },
  },

  // publications\publication\proofs\template
  publicationProofs: {
    documents: '[data-test-route-publications---proofs-tab-documents]',
    finished: '[data-test-route-publications---proofs-tab-finished]',
    // TODO-SELECTOR unused selectors
    requests: '[data-test-route-publications---proofs-tab-requests]',
  },

  // publications\publication\translations\requests
  translationsRequests: {
    request: {
      upload: '[data-test-route-publications---translations-requests-upload]',
      dueDate: '[data-test-route-publications---translations-requests-due-date]',
    },
  },

  // publications\publication\proofs\requests
  proofsRequests: {
    request: {
      container: '[data-test-route-publications---proofs-requests-container]',
      upload: '[data-test-route-publications---proofs-requests-upload]',
      emailSubject: '[data-test-route-publications---proofs-requests-email-subject]',
    },
  },

  /**
    COMPONENTS
  */

  // overview-table-display-config-modal
  tableDisplayConfig: {
    option: 'data-test-overview-table-display-config-option-checkbox=',
  },

  // publication-case-search
  publicationCaseSearch: {
    input: '[data-test-publication-case-search-input]',
    result: '[data-test-publication-case-search-result]',
    // TODO-SELECTOR unused selectors
    resultList: '[data-test-publication-case-search-result-list]',
  },

  // publications-filter-modal
  publicationsFilter: {
    minister: '[data-test-publications-filter-minister]',
    published: '[data-test-publications-filter-published]',
    paused: '[data-test-publications-filter-paused]',
    notMinister: '[data-test-publications-filter-not-minister]',
    toPublish: '[data-test-publications-filter-to-publish]',
    withdrawn: '[data-test-publications-filter-withdrawn]',
    save: '[data-test-publications-filter-save]',
    // TODO-SELECTOR unused selectors
    cancel: '[data-test-publications-filter-cancel]',
    reset: '[data-test-publications-filter-reset]',
  },

  // publication-navigation
  publicationNav: {
    goBack: '[data-test-publication-nav-go-back]',
    documents: '[data-test-publication-nav-documents]',
    translations: '[data-test-publication-nav-translations]',
    publishpreview: '[data-test-publication-nav-publishpreview]',
    // TODO-SELECTOR unused selectors
    case: '[data-test-publication-nav-case]',
  },

  // publication-table-row
  publicationTableRow: {
    rows: '[data-test-publication-table-row]',
    row: {
      shortTitle: '[data-test-publication-table-row-short-title]',
      remark: {
        column: '[data-test-publication-table-row-remark]',
        tooltip: '[data-test-publication-table-row-remark-tooltip]',
      },
      publicationNumber: '[data-test-publication-table-row-publication-number]',
      regulationType: '[data-test-publication-table-row-regulation-type]',
      proofPrintCorrector: '[data-test-publication-table-row-proof-print-corrector]',
      numacNumber: '[data-test-publication-table-row-numac-number]',
      openingDate: '[data-test-publication-table-row-opening-date]',
      decisionDate: '[data-test-publication-table-row-decision-date]',
      translationDueDate: '[data-test-publication-table-row-translation-due-date]',
      targetEndDate: '[data-test-publication-table-row-target-end-date]',
      publicationDueDate: '[data-test-publication-table-row-publication-due-date]',
      isUrgent: '[data-test-publication-table-row-is-urgent]',
      status: '[data-test-publication-table-row-status]',
      translationProgressBadge: '[data-test-publication-table-row-translation-progress-badge]',
      proofsProgressBadge: '[data-test-publication-table-row-proofs-progress-badge]',
      source: '[data-test-publication-table-row-source]',
      goToPublication: '[data-test-publication-table-row-go-to-publication]',
      // TODO-SELECTOR unused selectors
      publicationDate: '[data-test-publication-table-row-publication-date]',
    },
  },

  // new-publication-modal
  newPublication: {
    number: '[data-test-new-publication-number]',
    suffix: '[data-test-new-publication-suffix]',
    shortTitle: '[data-test-new-publication-short-title]',
    longTitle: '[data-test-new-publication-long-title]',
    alertInfo: '[data-test-new-publication-alert-info]',
    create: '[data-test-new-publication-create]',
  },

  // contact-persons-panel
  contactPersons: {
    add: '[data-test-contact-persons-view-add]',
    rows: '[data-test-contact-persons-row]',
    row: {
      delete: '[data-test-contact-persons-row-delete]',
      fullName: '[data-test-contact-persons-row-full-name]',
      organizationName: '[data-test-contact-persons-row-organization-name]',
      email: '[data-test-contact-persons-row-email]',
    },
  },

  // contact-person-add-modal
  contactPersonAdd: {
    firstName: '[data-test-contact-person-add-first-name]',
    lastName: '[data-test-contact-person-add-last-name]',
    email: '[data-test-contact-person-add-email]',
    selectOrganization: '[data-test-contact-person-select-organization]',
    addOrganization: '[data-test-contact-person-add-organization]',
    submit: '[data-test-contact-person-add-submit]',
  },

  // organization-add-modal
  organizationAdd: {
    name: '[data-test-organization-add-name]',
    cancel: '[data-test-organization-add-cancel]',
    submit: '[data-test-organization-add-submit]',
  },

  // inscription-panel
  inscription: {
    view: {
      shortTitle: '[data-test-inscription-view-short-title]',
      longTitle: '[data-test-inscription-view-long-title]',
      edit: '[data-test-inscription-view-edit]',
    },
    edit: {
      shortTitle: '[data-test-inscription-edit-short-title]',
      shortTitleError: '[data-test-inscription-edit-short-title-error]',
      longTitle: '[data-test-inscription-edit-long-title]',
      cancel: '[data-test-inscription-edit-cancel]',
      save: '[data-test-inscription-edit-save]',
    },
  },

  // mandatees-panel
  mandateesPanel: {
    add: '[data-test-mandatees-panel-add]',
    rows: '[data-test-mandatees-panel-row]',
    row: {
      fullName: '[data-test-mandatees-panel-row-full-name]',
      unlink: '[data-test-mandatees-panel-row-unlink]',
    },
    // TODO-SELECTORS unused selectors
    table: '[data-test-mandatees-panel-table]',
  },

  // sidebar
  sidebar: {
    open: '[data-test-publication-sidebar-open]',
    publicationNumber: '[data-test-publication-sidebar-publication-number]',
    publicationNumberSuffix: '[data-test-publication-sidebar-publication-number-suffix]',
    publicationNumberError: '[data-test-publication-sidebar-publication-number-error]',
    confirmWithdraw: '[data-test-publication-sidebar-confirm-withdraw]',
    statusChangeDate: '[data-test-publication-sidebar-status-change-date]',
    regulationType: '[data-test-publication-sidebar-regulation-type]',
    // publicationMode: '[data-test-publication-sidebar-publication-mode]',
    // proofPrintCorrector: '[data-test-publication-sidebar-proof-print-corrector]',
    numacNumber: '[data-test-publication-sidebar-numac-number]',
    openingDate: '[data-test-publication-sidebar-opening-date]',
    decisionDate: '[data-test-publication-sidebar-decision-date]',
    // translationDueDate: '[data-test-publication-sidebar-translation-due-date]',
    translationDate: '[data-test-publication-sidebar-translation-date]',
    // targetEndDate: '[data-test-publication-sidebar-target-end-date]',
    // publicationDueDate: '[data-test-publication-sidebar-publication-due-date]',
    publicationDate: '[data-test-publication-sidebar-publication-date]',
    remark: '[data-test-publication-sidebar-remark]',
    // TODO-SELECTORS unused selectors
    container: '[data-test-publication-sidebar-container]',
  },

  // publication-status-selector
  // statusSelector: '[data-test-publication-status-selector]',

  // urgency-level-checkbox
  urgencyLevelCheckbox: '[data-test-urgency-level-checkbox]',

  // documents-upload-modal
  // translation upload modal
  documentsUpload: {
    name: '[data-test-publication-documents-upload-name]',
    pages: '[data-test-publication-documents-upload-pages]',
    words: '[data-test-publication-documents-upload-words]',
    proofPrint: '[data-test-publication-documents-upload-proof-print]',
    save: '[data-test-publication-documents-upload-save]',
  },

  // translation-request-modal
  translationRequest: {
    message: '[data-test-publication-translation-request-message]',
    save: '[data-test-publication-translation-request-save]',
    // TODO-SELECTOR unused selectors
    documentsList: '[data-test-publication-translation-request-documents-list]',
  },

  // document-edit-modal
  documentEdit: {
    pages: '[data-test-publication-document-edit-pages]',
    words: '[data-test-publication-document-edit-words]',
    documentName: '[data-test-publication-document-edit-document-name]',
    save: '[data-test-publication-document-edit-save]',
    // TODO-SELECTOR unused selectors
    proofprint: '[data-test-publication-document-edit-proofprint]',
  },

  // translation-statuspill
  translationStatuspill: {
    done: '[data-test-translation-statuspill-done]',
    inProgress: '[data-test-translation-statuspill-in-progress]',
    notStarted: '[data-test-translation-statuspill-not-started]',
  },

  //  translation-upload-modal
  translationUpload: {
    name: '[data-test-translation-upload-name]',
    save: '[data-test-translation-upload-save]',
  },

  // proof-upload-modal
  proofUpload: {
    name: '[data-test-proof-upload-name]',
    save: '[data-test-proof-upload-save]',
  },

  // proof-edit-modal
  proofEdit: {
    name: '[data-test-proof-edit-name]',
    save: '[data-test-proof-edit-save]',
  },

  // proofs-statuspill
  proofsStatuspill: {
    done: '[data-test-proofs-statuspill-done]',
    inProgress: '[data-test-proofs-statuspill-in-progress]',
    notStarted: '[data-test-proofs-statuspill-not-started]',
  },

  // proof-request-modal
  proofRequest: {
    subject: '[data-test-proof-request-subject]',
    message: '[data-test-proof-request-message]',
    attachments: '[data-test-proof-request-attachments]',
    save: '[data-test-proof-request-save]',
  },
};
export default selectors;
