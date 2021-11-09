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
    configIcon: '[data-test-publications-index-config-modal-icon]',
    numberSelector: '.auk-form-group',
  },

  // publications\publication\template
  publicationHeader: {
    number: '[data-test-route-publications-publication-header-number]',
    shortTitle: '[data-test-route-publications-publication-header-short-title]',
  },

  // publications\publication\translations\template
  publicationTranslations: {
    documents: '[data-test-route-publications-publication-translations-documents]',
    requests: '[data-test-route-publications-publication-translations-requests]',
    finished: '[data-test-route-publications-publication-translations-finished]',
  },

  // publications\publication\translations\documents\template
  translationsDocuments: {
    add: '[data-test-route-publications-publication-translations-documents-add]',
    requestTranslation: '[data-test-route-publications-publication-translations-documents-request-translation]',
    tableRow: '[data-test-route-publications-publication-translations-documents-table-row]',
    row: {
      checkbox: '[data-test-route-publications-publication-translations-documents-table-checkbox]',
      documentName: '[data-test-route-publications-publication-translations-documents-document-name]',
      options: '[data-test-route-publications-publication-translations-options]',
      edit: '[data-test-route-publications-publication-translations-edit]',
      delete: '[data-test-route-publications-publication-translations-delete]',
    },
  },

  // publications\publication\proofs\documents\template
  proofsDocuments: {
    newRequest: '[data-test-route-publications-publication-proofs-documents-new-request]',
    initialRequest: '[data-test-route-publications-publication-proofs-documents-initial-request]',
    extraRequest: '[data-test-route-publications-publication-proofs-documents-extra-request]',
    finalRequest: '[data-test-route-publications-publication-proofs-documents-final-request]',
    add: '[data-test-route-publications-publication-proofs-documents-add]',
    addSourceProof: '[data-test-route-publications-publication-proofs-documents-add-source-proof]',
    addCorrectedProof: '[data-test-route-publications-publication-proofs-documents-add-corrected-proof]',
    tableRow: '[data-test-route-publications-publication-proofs-documents-table-row]',
    row: {
      checkbox: '[data-test-route-publications-publication-proofs-documents-table-checkbox]',
      documentName: '[data-test-route-publications-publication-proofs-documents-document-name]',
      proofsCorrected: '[data-test-route-publications-publication-proofs-corrected]',
      options: '[data-test-route-publications-publication-proofs-options]',
      edit: '[data-test-route-publications-publication-proofs-edit]',
      delete: '[data-test-route-publications-publication-proofs-delete]',
    },
  },

  // publications\publication\proofs\template
  publicationProofs: {
    documents: '[data-test-route-publications-publication-proofs-documents]',
    requests: '[data-test-route-publications-publication-proofs-requests]',
    finished: '[data-test-route-publications-publication-proofs-finished]',
  },

  // publications\publication\translations\requests
  translationsRequests: {
    request: {
      title: '.auk-toolbar-complex__item > h4',
      upload: '[data-test-publications---translations-requests-upload]',
      dueDate: '[data-test-publications---translations-requests-due-date]',
    },
  },

  // publications\publication\translations\requests
  proofsRequests: {
    request: {
      container: '[data-test-publications---proofs-requests-container]',
      title: '.auk-toolbar-complex__item > h4',
      upload: '[data-test-publications---proofs-requests-upload]',
      emailSubject: '[data-test-publications---proofs-requests-email-subject]',
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
    resultList: '[data-test-publication-case-search-result-list]',
    result: '[data-test-publication-case-search-result]',
  },

  // publications-filter-modal
  publicationsFilter: {
    minister: '[data-test-publications-filter-minister]',
    published: '[data-test-publications-filter-published]',
    paused: '[data-test-publications-filter-paused]',
    notMinister: '[data-test-publications-filter-not-minister]',
    toPublish: '[data-test-publications-filter-to-publish]',
    withdrawn: '[data-test-publications-filter-withdrawn]',
    // TODO-SELECTOR unused selectors
    cancel: '[data-test-publications-filter-cancel]',
    reset: '[data-test-publications-filter-reset]',
    save: '[data-test-publications-filter-save]',
  },

  // publication-navigation
  publicationNav: {
    goBack: '[data-test-publication-nav-go-back]',
    case: '[data-test-publication-nav-case]',
    documents: '[data-test-publication-nav-documents]',
    translations: '[data-test-publication-nav-translations]',
    publishpreview: '[data-test-publication-nav-publishpreview]',
  },

  // publication-table-row
  publicationTableRow: {
    rows: '[data-test-publication-table-row]',
    row: {
      shortTitle: '[data-test-publication-table-row-short-title]',
      remark: {
        column: '[data-test-publication-table-row-remark-column]',
        tooltip: '[data-test-publication-table-row-remark-tooltip]',
      },
      number: '[data-test-publication-table-row-number]',
      regulationType: '[data-test-publication-table-row-regulation-type]',
      proofPrintCorrector: '[data-test-publication-table-row-proof-print-corrector]',
      numacNumber: '[data-test-publication-table-row-numac-number]',
      openingDate: '[data-test-publication-table-row-opening-date]',
      decisionDate: '[data-test-publication-table-row-decision-date]',
      translationDueDate: '[data-test-publication-table-row-translation-due-date]',
      targetEndDate: '[data-test-publication-table-row-target-end-date]',
      publicationDueDate: '[data-test-publication-table-row-publication-due-date]',
      publicationDate: '[data-test-publication-table-row-publication-date]',
      urgencyLevel: '[data-test-publication-table-row-urgency-level]',
      status: '[data-test-publication-table-row-status]',
      translationProgressBadge: '[data-test-publication-table-row-translation-progress-badge]',
      proofsProgressBadge: '[data-test-publication-table-row-proofs-progress-badge]',
      source: '[data-test-publication-table-row-source]',
      goToPublication: '[data-test-publication-table-row-go-to-publication]',
    },
  },

  // new-publication-modal
  newPublication: {
    number: '[data-test-new-publication-number]',
    suffix: '[data-test-new-publication-suffix]',
    shortTitle: '[data-test-new-publication-short-title]',
    longTitle: '[data-test-new-publication-long-title]',
    alertInfo: '[data-test-new-publication-alert-info]',
    alertError: '[data-test-new-publication-alert-error]',
    numberError: '[data-test-new-publication-number-error]',
    shortTitleError: '[data-test-new-publication-short-title-error]',
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
    // TODO-SELECTORS unused selectors
    table: '[data-test-mandatees-panel-table]',
    add: '[data-test-mandatees-panel-add]',
    rows: '[data-test-mandatees-panel-row]',
    row: {
      fullName: '[data-test-mandatees-panel-row-full-name]',
      unlink: '[data-test-mandatees-panel-row-unlink]',
    },
  },

  // link-mandatees-modal
  linkMandatees: {
    cancel: '[data-test-link-mandatees-cancel]',
    add: '[data-test-link-mandatees-add]',
  },

  // government-fields-panel
  governmentFieldsPanel: {
    edit: '[data-test-government-fields-panel-edit]',
    rows: '[data-test-government-fields-panel-row]',
    row: {
      label: '[data-test-government-fields-panel-row-label]',
      fields: '[data-test-government-fields-panel-row-fields]',
    },
  },

  // edit-government-fields-modal
  editGovernmentFieldsModal: {
    selectorForm: '[data-test-edit-government-fields-modal-selector-form]',
    save: '[data-test-edit-government-fields-modal-save]',
  },

  // sidebar
  sidebar: {
    container: '[data-test-publication-sidebar-container]',
    open: '[data-test-publication-sidebar-open]',
    publicationNumber: '[data-test-publication-sidebar-publication-number]',
    publicationNumberSuffix: '[data-test-publication-sidebar-publication-number-suffix]',
    publicationNumberError: '[data-test-publication-sidebar-publication-number-error]',
    confirmWithdraw: '[data-test-publication-sidebar-confirm-withdraw]',
    statusChangeDate: '[data-test-publication-sidebar-status-change-date]',
    regulationType: '[data-test-publication-sidebar-regulation-type]',
    publicationMode: '[data-test-publication-sidebar-publication-mode]',
    proofPrintCorrector: '[data-test-publication-sidebar-proof-print-corrector]',
    numacNumber: '[data-test-publication-sidebar-numac-number]',
    openingDate: '[data-test-publication-sidebar-opening-date]',
    decisionDate: '[data-test-publication-sidebar-decision-date]',
    translationDueDate: '[data-test-publication-sidebar-translation-due-date]',
    translationDate: '[data-test-publication-sidebar-translation-date]',
    targetEndDate: '[data-test-publication-sidebar-target-end-date]',
    publicationDueDate: '[data-test-publication-sidebar-publication-due-date]',
    publicationDate: '[data-test-publication-sidebar-publication-date]',
    remark: '[data-test-publication-sidebar-remark]',
  },

  // publication-status-selector
  statusSelector: '[data-test-publication-status-selector]',

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
    documentsList: '[data-test-publication-translation-request-documents-list]',
    save: '[data-test-publication-translation-request-save]',
  },

  // document-edit-modal
  documentEdit: {
    pages: '[data-test-publication-document-edit-pages]',
    words: '[data-test-publication-document-edit-words]',
    proofprint: '[data-test-publication-document-edit-proofprint]',
    documentName: '[data-test-publication-document-edit-document-name]',
    save: '[data-test-publication-document-edit-save]',
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

  // upload-proof-modal
  uploadProof: {
    name: '[data-test-upload-proof-name]',
    save: '[data-test-upload-proof-save]',
  },

  // proof-edit-modal
  proofEdit: {
    name: '[data-test-publication-proof-edit-name]',
    save: '[data-test-publication-proof-edit-save]',
  },

  // proofs-statuspill
  proofsStatuspill: {
    done: '[data-test-proofs-statuspill-done]',
    inProgress: '[data-test-proofs-statuspill-in-progress]',
    notStarted: '[data-test-proofs-statuspill-not-started]',
  },

  // proof-request-modal
  proofRequest: {
    subject: '[data-test-publication-proof-request-subject]',
    message: '[data-test-publication-proof-request-message]',
    attachments: '[data-test-publication-proof-request-attachments]',
    save: '[data-test-publication-proof-request-save]',
  },
};
export default selectors;
