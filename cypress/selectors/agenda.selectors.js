const selectors = {
  // printable-agenda
  printableAgenda: {
    container: '[data-test-printable-agenda-container]',
    headerTitle: '[data-test-printable-agenda-header-title]',
  },

  // agendaitem-nav
  agendaitemNav: {
    caseTab: '[data-test-agendaitem-nav-case-tab]',
    documentsTab: '[data-test-agendaitem-nav-documents-tab]',
    decisionTab: '[data-test-agendaitem-nav-decision-tab]',
    newsletterTab: '[data-test-agendaitem-nav-newsletter-tab]',
    tabs: '[data-test-agendaitem-nav-tabs]',
  },

  // agendaitem-decision
  agendaitemDecision: {
    uploadFile: '[data-test-agendaitem-decision-upload-file]',
    create: '[data-test-agendaitem-decision-create]',
    save: '[data-test-agendaitem-decision-save]',
  },

  // agendaitem-decision-edit
  agendaitemDecisionEdit: {
    resultContainer: '[data-test-agendaitem-decision-edit-result-container]',
    save: '[data-test-agendaitem-decision-edit-save]',
  },

  // decision-result-pill
  decisionResultPill: {
    pill: '[data-test-decision-result-pill]',
    edit: '[data-test-decision-result-pill] + button',
  },

  // agenda-detail/sidebar
  agendaDetailSidebar: {
    // notes and announcements use same selector
    subitem: '[data-test-agenda-detail-sidebar-sub-item]',
  },

  // agenda-detail/sidebar-item
  agendaDetailSidebarItem: {
    container: '[data-test-agenda-detail-sidebar-item-container]',
    shortTitle: '[data-test-agenda-detail-sidebar-item-short-title]',
    inNewsletter: '[data-test-agenda-detail-sidebar-item-in-newsletter]',
    confidential: '[data-test-agenda-detail-sidebar-item-confidential]',
    status: {
      formallyOk: '[data-test-agenda-detail-sidebar-item-status-pill] > .au-c-icon--check',
      notYetFormallyOk: '[data-test-agenda-detail-sidebar-item-status-pill] > .au-c-icon--circle-question',
    },
    // Test tag is not possible, CSS is added conditionally
    postponed: '.auk-u-opacity--1\\/3',
  },

  // agendaitem-group-header
  agendaitemGroupHeader: {
    section: '[data-test-agendaitem-group-header-section]',
  },

  // agenda-overview-item
  agendaOverviewItem: {
    container: '[data-test-agenda-overview-item-container]',
    subitem: '[data-test-agenda-overview-item-sub-item]', // this contains short title
    isNew: '[data-test-agenda-overview-item-is-new]',
    title: '[data-test-agenda-overview-item-title]',
    subcaseName: '[data-test-agenda-overview-item-subcase-name]',
    formallyOk: '[data-test-agenda-overview-item-formally-ok]',
    status: '[data-test-agenda-overview-item-status]',
    dragging: '[data-test-agenda-overview-item-dragging]',
    moveUp: '[data-test-agenda-overview-item-move-up]',
    moveDown: '[data-test-agenda-overview-item-move-down]',
    numbering: '[data-test-agenda-overview-item-numbering]',
  },

  // agenda-overview
  agendaOverview: {
    notesSectionTitle: '[data-test-agenda-overview-section-title-notes]',
    showChanges: '[data-test-agenda-overview-show-changes]',
  },

  // agenda-header
  agendaHeader: {
    kind: '[data-test-agenda-header-kind]',
    isFinalPillClosed: '[data-test-agenda-header-is-final-pill-closed]',
    isFinalPillOpened: '[data-test-agenda-header-is-final-pill-opened]',
    title: '[data-test-agenda-header-title]',
  },

  // agenda-actions
  agendaActions: {
    optionsDropdown: '[data-test-agenda-actions-options-dropdown]',
    addAgendaitems: '[data-test-agenda-actions-add-agendaitems]',
    navigateToNewsletter: '[data-test-agenda-actions-navigate-to-newsletter]',
    navigateToPrintableAgenda: '[data-test-agenda-actions-navigate-to-printable-agenda]',
    downloadDocuments: '[data-test-agenda-actions-download-documents]',
    downloadDecisions: '[data-test-agenda-actions-download-decisions]',
    generateSignedDecisionsBundle: '[data-test-agenda-actions-generate-signed-decisions-bundle]',
    toggleEditingMeeting: '[data-test-agenda-actions-toggle-editing-meeting]',
    markDecisionsForSigning: '[data-test-agenda-actions-mark-decisions-sor-signing]',
    releaseDecisions: '[data-test-agenda-actions-release-decisions]',
    planReleaseDocuments: '[data-test-agenda-actions-release-documents-planning]',
    approveAllAgendaitems: '[data-test-agenda-actions-approve-all-agendaitems]',
    publishToWeb: '[data-test-agenda-actions-publish-to-web]',
    unpublishFromWeb: '[data-test-agenda-actions-unpublish-from-web]',
    confirm: {
      releaseDecisions: '[data-test-agenda-actions-release-decisions-confirm]',
      approveAllAgendaitems: '[data-test-agenda-actions-approve-all-agendaitems-confirm]',
    },
    downloadDocumentsFiletypeSelector: '[data-test-agenda-actions-download-documents-filetype-selector]',
  },

  // publication-planning-modal
  publicationPlanning: {
    actions: {
      releaseDocumentsNow: '[data-test-publication-planning-release-documents-now]',
    },
    confirm: {
      releaseDocuments: '[data-test-publication-planning-release-documents-confirm]',
    },
  },

  // publication-pills
  publicationPills: {
    container: '[data-test-publication-pills-container]',
  },

  // agenda-version-actions
  agendaVersionActions: {
    optionsDropdown: '[data-test-agenda-version-actions-options-dropdown]',
    actions: {
      approveAgenda: '[data-test-agenda-version-actions-approve-agenda]',
      approveAndCloseAgenda: '[data-test-agenda-version-actions-approve-and-close-agenda]',
      lockAgenda: '[data-test-agenda-version-actions-lock-agenda]',
      unlockAgenda: '[data-test-agenda-version-actions-unlock-agenda]',
      reopenPreviousVersion: '[data-test-agenda-version-actions-reopen-previous-version]',
      deleteAgenda: '[data-test-agenda-version-actions-delete-agenda]',
    },
    confirm: {
      approveAgenda: '[data-test-agenda-version-actions-approve-agenda-confirm]',
      approveAndCloseAgenda: '[data-test-agenda-version-actions-approve-and-close-agenda-confirm]',
      lockAgenda: '[data-test-agenda-version-actions-lock-agenda-confirm]',
      reopenPreviousVersion: '[data-test-agenda-version-actions-reopen-previous-version-confirm]',
      deleteAgenda: '[data-test-agenda-version-actions-delete-agenda-confirm]',
    },
    messages: {
      approveAgenda: {
        rollbackItems: '[data-test-agenda-version-actions-approve-agenda-rollback-message]',
        moveItems: '[data-test-agenda-version-actions-approve-agenda-move-message]',
      },
      approveAndCloseAgenda: {
        rollbackItems: '[data-test-agenda-version-actions-approve-and-close-agenda-rollback-message]',
        deleteItems: '[data-test-agenda-version-actions-approve-and-close-agenda-delete-message]',
      },
    },
    reopenModal: {
      error: '[data-test-agenda-version-actions-reopen-modal-error]',
      warning: '[data-test-agenda-version-actions-reopen-modal-warning]',
      piece: '[data-test-agenda-version-actions-reopen-modal-piece]',
      pieceName: '[data-test-agenda-version-actions-reopen-modal-piece-name]',
    },
  },

  // agenda-tabs
  agendaTabs: {
    tabs: '[data-test-agenda-nav-tabs]',
  },

  // agenda-side-nav
  agendaSideNav: {
    agenda: '[data-test-agenda-side-nav-agenda]',
    agendaName: '[data-test-agenda-side-nav-agenda-name]',
  },

  // agendaitem-titles-view
  agendaitemTitlesView: {
    type: '[data-test-agendaitem-titles-type]',
    title: '[data-test-agendaitem-titles-title]',
    shortTitle: '[data-test-agendaitem-titles-short-title]',
    formallyOk: '[data-test-agendaitem-titles-formally-ok]',
    subcaseName: '[data-test-agendaitem-subcase-name]',
    comment: '[data-test-agendaitem-titles-comment]',
    privateComment: '[data-test-agendaitem-titles-private-comment]',
    confidential: '[data-test-agendaitem-titles-confidential]',
    linkToSubcase: '[data-test-agendaitem-titles-link-to-subcase]',
    edit: '[data-test-agendaitem-titles-edit]',
    newsItem: '[data-test-agendaitem-titles-news-item]',
    onTheWebsite: '[data-test-agendaitem-titles-on-the-website]',
    notOnTheWebsite: '[data-test-agendaitem-titles-not-on-the-website]',
  },

  // agendaitem-titles-edit
  agendaitemTitlesEdit: {
    title: '[data-test-agendaitem-titles-edit-title]',
    shorttitle: '[data-test-agendaitem-titles-edit-shorttitle]',
    comment: '[data-test-agendaitem-titles-edit-comment]',
    privateComment: '[data-test-agendaitem-titles-edit-private-comment]',
    showInNewsletter: '[data-test-agendaitem-titles-edit-showInNewsletter]',
    confidential: '[data-test-agendaitem-titles-edit-confidential]',
    actions: {
      cancel: '[data-test-agendaitem-titles-edit-cancel]',
      save: '[data-test-agendaitem-titles-edit-save]',
    },
  },

  // agendaitem-controls
  agendaitemControls: {
    actions: '[data-test-agendaitem-controls-actions]',
    action: {
      delete: '[data-test-agendaitem-controls-action-delete]',
      postponeRevert: '[data-test-agendaitem-controls-action-postpone-revert]',
      postpone: '[data-test-agendaitem-controls-action-postpone]',
    },
  },

  // agendaitem-search
  agendaitemSearch: {
    input: '[data-test-agendaitem-search-input]',
    formallyReorderEdit: '[data-test-agendaitem-search-formally-reorder-edit]',
  },

  // edit-meeting
  editMeeting: {
    relatedMainMeeting: '[data-test-edit-meeting-related-main-meeting]',
    meetingNumber: '[data-test-edit-meeting-meeting-number]',
    meetingLocation: '[data-test-edit-meeting-meeting-location]',
    datepicker: '[data-test-edit-meeting-datepicker]',
    documentPublicationDate: '[data-test-edit-meeting-document-publication-date]',
    numberRep: {
      view: '[data-test-edit-meeting-number-representation-view]',
      edit: '[data-test-edit-meeting-number-representation-edit]',
      input: '[data-test-edit-meeting-number-representation-input]',
      save: '[data-test-edit-meeting-number-representation-save]',
    },
    secretary: '[data-test-edit-meeting-secretary]',
    save: '[data-test-edit-meeting-save]',
  },

  // create-agendaitem
  createAgendaitem: {
    input: '[data-test-create-agendaitem-input]',
    dataTable: '[data-test-create-agendaitem-data-table]',
    save: '[data-test-create-agendaitem-save]',
    rows: '[data-test-create-agendaitem-row]',
    row: {
      checkBox: '[data-test-create-agendaitem-row-subcase-checkbox]',
      subcaseName: '[data-test-create-agendaitem-row-subcase-name]',
    },
  },

  // agendaitem-postponed
  agendaitemPostponed: {
    latestMeeting: '[data-test-agendaitem-postponed-latest-meeting]',
    repropose: '[data-test-agendaitem-postponed-repropose]',
    proposableMeeting: '[data-test-agendaitem-postponed-proposable-meeting]',
  },
};
export default selectors;
