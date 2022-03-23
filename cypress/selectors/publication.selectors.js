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
  },

  // publications\publication\template
  publicationHeader: {
    number: '[data-test-route-publications-publication-header-number]',
    shortTitle: '[data-test-route-publications-publication-header-short-title]',
  },

  // publications\publication\translations\template
  // publicationTranslations: {
  //   documents: '[data-test-route-publications---translations-tab-documents]',
  //   // TODO-SELECTOR unused selector
  //   requests: '[data-test-route-publications---translations-tab-requests]',
  // },

  // publications\publication\translations\index\template
  // TODO KAS-3248 Rename to translationsIndex
  translationsIndex: {
    panelBody: '[data-test-route-publications---translations-panel-body]',
    upload: '[data-test-route-publications---translations-upload-translation]',
    requestTranslation: '[data-test-route-publications---translations-request-translation]',
  },

  // publications\publication\proofs\index\template
  proofsIndex: {
    panelBody: '[data-test-route-publications---proofs-panel-body]',
    upload: '[data-test-route-publications---proofs-upload]',
    newRequest: '[data-test-route-publications---proofs-new-request]',
  },

  // publications\publication\proofs\template
  publicationProofs: {
    documents: '[data-test-route-publications---proofs-tab-documents]',
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
    close: '[data-test-publications-table-display-config-close]',
    option: 'data-test-overview-table-display-config-option-checkbox=',
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
    decisions: '[data-test-publication-nav-decisions]',
    translations: '[data-test-publication-nav-translations]',
    // TODO KAS-2348 rename to proofs
    publishpreview: '[data-test-publication-nav-publishpreview]',
    // TODO-SELECTOR unused selectors
    case: '[data-test-publication-nav-case]',
    publications: '[data-test-publication-nav-publications]',
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
    cancel: '[data-test-new-publication-cancel]',
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
  // sidebar: {
  //   open: '[data-test-publication-sidebar-open]',
  //   publicationNumber: '[data-test-publication-sidebar-publication-number]',
  //   publicationNumberSuffix: '[data-test-publication-sidebar-publication-number-suffix]',
  //   publicationNumberError: '[data-test-publication-sidebar-publication-number-error]',
  //   confirmWithdraw: '[data-test-publication-sidebar-confirm-withdraw]',
  //   statusChangeDate: '[data-test-publication-sidebar-status-change-date]',
  //   regulationType: '[data-test-publication-sidebar-regulation-type]',
  // publicationMode: '[data-test-publication-sidebar-publication-mode]',
  // proofPrintCorrector: '[data-test-publication-sidebar-proof-print-corrector]',
  // numacNumber: '[data-test-publication-sidebar-numac-number]',
  // openingDate: '[data-test-publication-sidebar-opening-date]',
  // decisionDate: '[data-test-publication-sidebar-decision-date]',
  // translationDueDate: '[data-test-publication-sidebar-translation-due-date]',
  // translationDate: '[data-test-publication-sidebar-translation-date]',
  // targetEndDate: '[data-test-publication-sidebar-target-end-date]',
  // publicationDueDate: '[data-test-publication-sidebar-publication-due-date]',
  // publicationDate: '[data-test-publication-sidebar-publication-date]',
  // remark: '[data-test-publication-sidebar-remark]',
  //   container: '[data-test-publication-sidebar-container]',
  // },

  // publication-status-selector
  // statusSelector: '[data-test-publication-status-selector]',

  // urgency-level-checkbox
  urgencyLevelCheckbox: '[data-test-urgency-level-checkbox]',

  // documents-upload-modal
  // translation upload modal
  // documentsUpload: {
  //   name: '[data-test-publication-documents-upload-name]',
  //   numberOfPages: '[data-test-publication-documents-upload-number-of-pages]',
  //   numberOfWords: '[data-test-publication-documents-upload-number-of-words]',
  //   proofPrint: '[data-test-publication-documents-upload-proof-print]',
  //   save: '[data-test-publication-documents-upload-save]',
  // },

  // translation-request-modal
  translationRequest: {
    numberOfPages: '[data-test-publication-translation-request-number-of-pages]',
    numberOfWords: '[data-test-publication-translation-request-number-of-words]',
    updateStatus: '[data-test-publication-translation-request-update-status]',
    message: '[data-test-publication-translation-request-message]',
    save: '[data-test-publication-translation-request-save]',
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

  //  translation-upload-modal
  translationUpload: {
    piece: '[data-test-translation-upload-piece]',
    updateStatus: '[data-test-translation-upload-update-status]',
    save: '[data-test-translation-upload-save]',
  },

  // proof-upload-modal
  proofUpload: {
    name: '[data-test-proof-upload-name]',
    save: '[data-test-proof-upload-save]',
    updateStatus: '[data-test-proof-upload-update-status]',
  },

  // proof-request-modal
  proofRequest: {
    translationPieces: '[data-test-proof-request-translation-pieces]',
    updateStatus: '[data-test-proof-request-update-status]',
    subject: '[data-test-proof-request-subject]',
    message: '[data-test-proof-request-message]',
    save: '[data-test-proof-request-save]',
  },

  // publication-case-info-panel
  publicationCaseInfo: {
    edit: '[data-test-publication-case-info-panel-edit]',
    editView: {
      publicationNumber: '[data-test-publication-case-info-panel-edit-publication-number]',
      suffix: '[data-test-publication-case-info-panel-edit-publication-number-suffix]',
      numacNumber: '[data-test-publication-case-info-panel-edit-numac-number]',
      openingDate: '[data-test-publication-case-info-panel-edit-opening-date]',
      dueDate: '[data-test-publication-case-info-panel-edit-publication-due-date]',
      save: '[data-test-publication-case-info-panel-save]',
      cancel: '[data-test-publication-case-info-panel-cancel]',
    },
    publicationNumber: '[data-test-publication-case-info-panel-publication-number]',
    numacNumber: '[data-test-publication-case-info-panel-numac-number]',
    startDate: '[data-test-publication-case-info-panel-start-date]',
    openingDate: '[data-test-publication-case-info-panel-opening-date]',
    dueDate: '[data-test-publication-case-info-panel-due-date]',
  },

  // remark-panel
  remark: {
    edit: '[data-test-remark-panel-edit]',
    textarea: '[data-test-remark-panel-textarea]',
    save: '[data-test-remark-panel-save]',
  },

  // status-pill
  statusPill: {
    contentLabel: '[data-test-status-pill-content-label]',
    changeStatus: '[data-test-status-pill-change-status]',
  },

  // publication-status-modal
  publicationStatus: {
    select: '[data-test-publication-status-select]',
    save: '[data-test-publication-status-save]',
  },

  // publications-info-panel
  publicationsInfoPanel: {
    // TODO-SELECTOR unused selectors
    edit: '[data-test-publications-info-panel-edit]',
    targetEndDate: '[data-test-publications-info-panel-target-end-date]',
    save: '[data-test-publications-info-panel-save]',
  },

  // request-activity-panel
  requestActivityPanel: {
    dropdown: '[data-test-request-activity-panel-dropdown]',
    delete: '[data-test-request-activity-panel-delete]',
    message: '[data-test-request-activity-panel-message]',
  },

  // translation-received-panel
  translationReceivedPanel: {
    panel: '[data-test-translation-received-panel]',
    endDate: '[data-test-translation-received-panel-end-date]',
    dropdown: '[data-test-translation-received-panel-dropdown]',
    edit: '[data-test-translation-received-panel-edit]',
  },

  // translation-activity-edit
  translationActivityEdit: {
    save: '[data-test-translation-activity-edit-save]',
  },

  // batch-documents-publication-row
  batchDocumentsPublicationRow: {
    name: '[data-test-batch-documents-publication-row-name]',
    linkOption: '[data-test-batch-documents-publication-row-link-option]',
    new: '[data-test-batch-documents-publication-row-new]',
  },

  // publications-flow-selector
  publicationsFlowSelector: '[data-test-publication-flow-selector]',

  // document-card-step
  documentCardStep: {
    card: '[data-test-document-card-step]',
  },

  // publication-documents-list
  documentsList: {
    piece: '[data-test-document-list-piece]',
  },

  // proof-received-panel
  proofReceivedPanel: {
    panel: '[data-test-proof-received-panel]',
    edit: '[data-test-proof-received-panel-edit]',
    endDate: '[data-test-proof-received-panel-end-date]',
    corrector: '[data-test-proof-received-panel-edit-corrector]',
    dropdown: '[data-test-proof-received-panel-dropdown]',
    save: '[data-test-proof-received-panel-edit-save]',
  },

  // proof-info-panel
  proofInfoPanel: {
    edit: {
      corrector: '[data-test-proof-info-panel-corrector]',
    },
    view: {
      corrector: '[data-test-proof-info-panel-view-corrector]',
    },
  },

  // decisions-info-panel
  decisionsInfoPanel: {
    openEdit: '[data-test-decisions-info-panel-view-edit]',
    cancel: '[data-test-decisions-info-panel-edit-cancel]',
    save: '[data-test-decisions-info-panel-edit-save]',
    edit: {
      regulationType: '[data-test-decisions-info-panel-edit-regulation-type]',
      decisionDate: '[data-test-decisions-info-panel-edit-decision-date]',
      numberOfPages: '[data-test-decisions-info-panel-edit-number-of-pages]',
    },
    view: {
      regulationType: '[data-test-decisions-info-panel-view-regulation-type]',
      decisionDate: '[data-test-decisions-info-panel-view-decision-date]',
      decisionLink: '[data-test-decisions-info-panel-view-decision-link]',
      numberOfPages: '[data-test-decisions-info-panel-view-number-of-pages]',
    },
  },

};
export default selectors;
