const selectors = {

  /**
    ROUTES
  */

  // publications\index\template
  publicationsIndex: {
    title: '[data-test-route-publications-index-title]',
    tabs: {
      all: '[data-test-route-publications-index-tabs-all]',
      shortlist: '[data-test-route-publications-index-tabs-shortlist]',
      urgent: '[data-test-route-publications-index-tabs-urgent]',
      translations: '[data-test-route-publications-index-tabs-translation]',
      proof: '[data-test-route-publications-index-tabs-proof]',
      proofread: '[data-test-route-publications-index-tabs-proofread]',
      late: '[data-test-route-publications-index-tabs-late]',
      reports: '[data-test-route-publications-index-tabs-reports]',
      search: '[data-test-route-publications-index-tabs-search]',
    },
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

  // publications\publication\decisions\index\template
  decisionsIndex: {
    uploadReference: '[data-test-route-publications---decisions-upload-reference]',
  },

  // publications\publication\translations\index\template
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

  // publications\publication\publication-activities\index
  publicationActivities: {
    register: '[data-test-route-publications---publication-activities-register]',
    request: '[data-test-route-publications---publication-activities-request]',
  },

  // publications\overview\shortlist
  shortlist: {
    table: '[data-test-route-publications-overview-shortlist-table]',
    row: {
      documentName: '[data-test-route-publications-overview-shortlist-row-name]',
      documentType: '[data-test-route-publications-overview-shortlist-row-type]',
      openNewPublication: '[data-test-route-publications-overview-shortlist-row-open-new-publication]',
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

  // publication-navigation
  publicationNav: {
    goBack: '[data-test-publication-nav-go-back]',
    decisions: '[data-test-publication-nav-decisions]',
    translations: '[data-test-publication-nav-translations]',
    proofs: '[data-test-publication-nav-proofs]',
    case: '[data-test-publication-nav-case]',
    publications: '[data-test-publication-nav-publications]',
  },

  // publication-table-row
  publicationTableRow: {
    rows: '[data-test-publication-table-row]',
    row: {
      shortTitle: '[data-test-publication-table-row-short-title]',
      publicationNumber: '[data-test-publication-table-row-publication-number]',
      translationDueDate: '[data-test-publication-table-row-translation-due-date]',
      targetEndDate: '[data-test-publication-table-row-target-end-date]',
      decisionDate: '[data-test-publication-table-row-decision-date]',
      status: '[data-test-publication-table-row-status]',
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
      toSubcase: '[data-test-inscription-view-to-case]',
    },
    edit: {
      shortTitle: '[data-test-inscription-edit-short-title]',
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

  // reference-upload-modal
  referenceUpload: {
    save: '[data-test-reference-upload-save]',
  },

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

  // translations-info-panel
  translationsInfoPanel: {
    edit: '[data-test-publication-translations-info-panel-edit]',
    editView: {
      dueDate: '[data-test-publication-translations-info-panel-edit-due-date]',
    },
    dueDate: '[data-test-publication-translations-info-panel-due-date]',
    save: '[data-test-publication-translations-info-panel-save]',
  },

  // translation-request-modal
  translationRequest: {
    numberOfPages: '[data-test-publication-translation-request-number-of-pages]',
    numberOfWords: '[data-test-publication-translation-request-number-of-words]',
    updateStatus: '[data-test-publication-translation-request-update-status]',
    message: '[data-test-publication-translation-request-message]',
    save: '[data-test-publication-translation-request-save]',
  },

  //  translation-upload-modal
  translationUpload: {
    updateStatus: '[data-test-translation-upload-update-status]',
    save: '[data-test-translation-upload-save]',
  },

  // proof-upload-modal
  proofUpload: {
    save: '[data-test-proof-upload-save]',
    updateStatus: '[data-test-proof-upload-update-status]',
  },

  // proof-request-modal
  proofRequest: {
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
      threadId: '[data-test-publication-case-info-panel-edit-thread-id]',
      publicationMode: '[data-test-publication-case-info-panel-edit-publication-mode]',
      decisionDate: '[data-test-publication-case-info-panel-edit-decision-date]',
      openingDate: '[data-test-publication-case-info-panel-edit-opening-date]',
      dueDate: '[data-test-publication-case-info-panel-edit-publication-due-date]',
      save: '[data-test-publication-case-info-panel-save]',
      cancel: '[data-test-publication-case-info-panel-cancel]',
    },
    urgencyLevel: '[data-test-publication-case-info-panel-urgency-level]',
    publicationNumber: '[data-test-publication-case-info-panel-publication-number]',
    numacNumber: '[data-test-publication-case-info-panel-numac-number]',
    threadId: '[data-test-publication-case-info-panel-thread-id]',
    publicationMode: '[data-test-publication-case-info-panel-publication-mode]',
    decisionDate: '[data-test-publication-case-info-panel-decision-date]',
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
    edit: '[data-test-publications-info-panel-edit]',
    view: {
      targetEndDate: '[data-test-publications-info-panel-view-target-end-date]',
      publicationDate: '[data-test-publications-info-panel-view-publication-date]',
    },
    editView: {
      targetEndDate: '[data-test-publications-info-panel-edit-view-target-end-date]',
      save: '[data-test-publications-info-panel-save]',
    },
  },

  // request-activity-panel
  requestActivityPanel: {
    panel: '[data-test-request-activity-panel]',
    dropdown: '[data-test-request-activity-panel-dropdown]',
    delete: '[data-test-request-activity-panel-delete]',
    message: '[data-test-request-activity-panel-message]',
  },

  // translation-received-panel
  translationReceivedPanel: {
    panel: '[data-test-translation-received-panel]',
    endDate: '[data-test-translation-received-panel-end-date]',
    dropdown: '[data-test-translation-received-panel-dropdown]',
    proofRequest: '[data-test-translation-received-panel-proof-request]',
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
    piece: '[data-test-publication-document-list-piece]',
    deletePiece: '[data-test-publication-document-list-delete-piece]',
  },

  // proof-received-panel
  proofReceivedPanel: {
    panel: '[data-test-proof-received-panel]',
    publicationRequest: '[data-test-proof-received-panel-publication-request]',
    edit: '[data-test-proof-received-panel-edit]',
    endDate: '[data-test-proof-received-panel-end-date]',
    corrector: '[data-test-proof-received-panel-edit-corrector]',
    dropdown: '[data-test-proof-received-panel-dropdown]',
    save: '[data-test-proof-received-panel-edit-save]',
  },

  // proof-info-panel
  proofInfoPanel: {
    edit: '[data-test-proof-info-panel-edit]',
    view: {
      dueDate: '[data-test-publication-proof-info-panel-view-due-date]',
      corrector: '[data-test-proof-info-panel-view-corrector]',
    },
    editView: {
      dueDate: '[data-test-proof-info-panel-edit-due-date]',
    },
    save: '[data-test-publication-proof-info-panel-save]',
  },

  // decisions-info-panel
  decisionsInfoPanel: {
    openEdit: '[data-test-decisions-info-panel-view-edit]',
    cancel: '[data-test-decisions-info-panel-edit-cancel]',
    save: '[data-test-decisions-info-panel-edit-save]',
    edit: {
      regulationType: '[data-test-decisions-info-panel-edit-regulation-type]',
      numberOfPages: '[data-test-decisions-info-panel-edit-number-of-pages]',
      numberOfExtracts: '[data-test-decisions-info-panel-edit-number-of-extracts]',
    },
    view: {
      regulationType: '[data-test-decisions-info-panel-view-regulation-type]',
      decisionDate: '[data-test-decisions-info-panel-view-decision-date]',
      decisionLink: '[data-test-decisions-info-panel-view-decision-link]',
      numberOfPages: '[data-test-decisions-info-panel-view-number-of-pages]',
      numberOfExtracts: '[data-test-decisions-info-panel-view-number-of-extracts]',
    },
  },

  // publication-registration-modal
  publicationRegistration: {
    publicationDate: '[data-test-publication-registration-publication-date]',
    save: '[data-test-publication-registration-save]',
  },

  // publication-registered-panel
  publicationRegisteredPanel: {
    panel: '[data-test-publication-registered-panel]',
  },

  // publication-request-modal
  publicationRequest: {
    body: '[data-test-publication-request-body]',
    subject: '[data-test-publication-request-subject]',
    message: '[data-test-publication-request-message]',
    save: '[data-test-publication-request-save]',
  },

  // reports-panel-entry
  reportsPanelEntry: {
    title: '[data-test-reports-panel-entry-title]',
    lastRequest: '[data-test-reports-panel-entry-last-request]',
    downloadLink: '[data-test-reports-panel-entry-download-link]',
    create: '[data-test-reports-panel-entry-create]',
  },

  // generate-report-modal
  generateReport: {
    selectMandatee: '[data-test-mandatee-person-selector]',
    confirm: '[data-test-generate-report-confirm]',
  },
};
export default selectors;
