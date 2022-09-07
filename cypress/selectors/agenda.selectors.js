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
    pressAgendaTab: '[data-test-agendaitem-nav-press-agenda-tab]',
    activeTab: '[data-test-agendaitem-nav-tabs] .auk-tabs__tab--active > *',
  },

  // agendaitem-decision
  agendaitemDecision: {
    uploadFile: '[data-test-agendaitem-decision-upload-file]',
    // TODO-selector unused selector
    container: '[data-test-agendaitem-decision-container]',
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
    shortTitle: '[data-test-agenda-detail-sidebar-item-short-title]',
    confidential: '[data-test-agenda-detail-sidebar-item-confidential]',
    status: {
      formallyOk: '[data-test-agenda-detail-sidebar-item-status-pill] > .au-c-icon--check',
      notYetFormallyOk: '[data-test-agenda-detail-sidebar-item-status-pill] > .au-c-icon--circle-question',
    },
    // Test tag is not possible, CSS is added conditionally
    retracted: '.auk-u-opacity--1\\/3',
  },

  // agendaitem-group-header
  agendaitemGroupHeader: {
    section: '[data-test-agendaitem-group-header-section]',
  },

  // agenda-overview-item
  agendaOverviewItem: {
    container: '[data-test-agenda-overview-item-container]',
    subitem: '[data-test-agenda-overview-item-sub-item]', // this contains short title
    title: '[data-test-agenda-overview-item-title]',
    subcaseName: '[data-test-agenda-overview-item-subcase-name]',
    formallyOk: '[data-test-agenda-overview-item-formally-ok]',
    status: '[data-test-agenda-overview-item-status]',
  },

  // agenda-overview
  agendaOverview: {
    notesSectionTitle: '[data-test-agenda-overview-section-title-notes]',
    showChanges: '[data-test-agenda-overview-show-changes]',
    formallyOkEdit: '[data-test-agenda-overview-formally-ok-edit]',
  },

  // TODO-selector rename, some of there are in other modals
  // agenda-header
  agendaHeader: {
    showOptions: '[data-test-agenda-header-show-options]',
    actions: {
      navigateToPrintableAgenda: '[data-test-agenda-header-navigate-to-printable-agenda]',
      addAgendaitems: '[data-test-agenda-header-add-agendaitems]',
      navigateToDecisions: '[data-test-agenda-header-navigate-to-decisions]',
      navigateToNewsletter: '[data-test-agenda-header-navigate-to-newsletter]',
      toggleEditingMeeting: '[data-test-agenda-header-toggle-editing-meeting]',
      downloadDocuments: '[data-test-agenda-header-download-documents]',
      releaseDecisions: '[data-test-agenda-header-release-decisions]',
      releaseDocuments: '[data-test-agenda-header-release-documents]',
      releaseDocumentsNow: '[data-test-agenda-header-release-documents-now]',
      approveAllAgendaitems: '[data-test-agenda-header-approve-all-agendaitems]',
      // TODO-selector unused selectors
      navigateToAgendaView: ['data-test-agenda-header-navigate-to-agenda-view'],
      navigateToPressagenda: '[data-test-agenda-header-navigate-to-pressagenda]',
      printAgenda: ['data-test-agenda-header-print-agenda'],
    },
    confirm: {
      releaseDocuments: '[data-test-agenda-header-release-documents-confirm]',
      releaseDecisions: '[data-test-agenda-header-release-decisions-confirm]',
      approveAllAgendaitems: '[data-test-agenda-header-approve-all-agendaitems-confirm]',
    },
    kind: '[data-test-agenda-header-kind]',
    // TODO-selector unused selector
    title: '[data-test-agenda-header-title]',
  },

  // publication-pills
  publicationPills: {
    container: '[data-test-publication-pills-container]',
  },

  // agenda-actions
  agendaActions: {
    showOptions: '[data-test-agenda-actions-show-options]',
    actions: {
      approveAgenda: '[data-test-agenda-actions-approve-agenda]',
      approveAndCloseAgenda: '[data-test-agenda-actions-approve-and-close-agenda]',
      lockAgenda: '[data-test-agenda-actions-lock-agenda]',
      unlockAgenda: '[data-test-agenda-actions-unlock-agenda]',
      reopenPreviousVersion: '[data-test-agenda-actions-reopen-previous-version]',
      deleteAgenda: '[data-test-agenda-actions-delete-agenda]',
      createNewDesignAgenda: '[data-test-agenda-actions-create-new-design]',
    },
    confirm: {
      approveAgenda: '[data-test-agenda-actions-approve-agenda-confirm]',
      approveAndCloseAgenda: '[data-test-agenda-actions-approve-and-close-agenda-confirm]',
      lockAgenda: '[data-test-agenda-actions-lock-agenda-confirm]',
      reopenPreviousVersion: '[data-test-agenda-actions-reopen-previous-version-confirm]',
      deleteAgenda: '[data-test-agenda-actions-delete-agenda-confirm]',
    },
    messages: {
      approveAgenda: {
        rollbackItems: '[data-test-agenda-actions-approve-agenda-rollback-message]',
        moveItems: '[data-test-agenda-actions-approve-agenda-move-message]',
      },
      approveAndCloseAgenda: {
        rollbackItems: '[data-test-agenda-actions-approve-and-close-agenda-rollback-message]',
        deleteItems: '[data-test-agenda-actions-approve-and-close-agenda-delete-message]',
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

  // compare-agenda-list
  compareAgenda: {
    showChanges: '[data-test-compare-show-changes]',
    agendaLeft: '[data-test-compare-agenda-left]',
    agendaRight: '[data-test-compare-agenda-right]',
    agendaitemLeft: '[data-test-compare-agendaitem-left]',
    agendaitemRight: '[data-test-compare-agendaitem-right]',
    announcementLeft: '[data-test-compare-announcement-left]',
    announcementRight: '[data-test-compare-announcement-right]',
  },

  // agendaitem-titles-view
  agendaitemTitlesView: {
    title: '[data-test-agendaitem-titles-title]',
    shortTitle: '[data-test-agendaitem-titles-short-title]',
    subcaseName: '[data-test-agendaitem-subcase-name]',
    comment: '[data-test-agendaitem-titles-comment]',
    privateComment: '[data-test-agendaitem-titles-private-comment]',
    confidential: '[data-test-agendaitem-titles-confidential]',
    linkToSubcase: '[data-test-agendaitem-titles-link-to-subcase]',
    edit: '[data-test-agendaitem-titles-edit]',
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
      advance: '[data-test-agendaitem-controls-action-advance]',
      postpone: '[data-test-agendaitem-controls-action-postpone]',
    },
  },

  // agendaitem-search
  agendaitemSearch: {
    input: '[data-test-agendaitem-search-input]',
  },

  // new-meeting
  // TODO-selectors cleanup unused selectors
  newMeeting: {
    kind: '[data-test-utils-kind-selector]',
    relatedMainMeeting: '[data-test-new-meeting-related-main-meeting]',
    meetingNumber: '[data-test-new-meeting-meeting-number]',
    meetingLocation: '[data-test-new-meeting-meeting-location]',
    datepicker: '[data-test-new-meeting-datepicker]',
    numberRep: {
      view: '[data-test-new-meeting-number-representation-view]',
      edit: '[data-test-new-meeting-number-representation-edit]',
      input: '[data-test-new-meeting-number-representation-input]',
      save: '[data-test-new-meeting-number-representation-save]',
    },
    save: '[data-test-new-meeting-save]',
  },

  // edit-meeting
  editMeeting: {
    kind: '[data-test-utils-kind-selector]',
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
    save: '[data-test-edit-meeting-save]',
  },

  // create-agendaitem
  createAgendaitem: {
    input: '[data-test-create-agendaitem-input]',
    postponedCheckbox: '[data-test-create-agendaitem-postponed-checkbox]',
    dataTable: '[data-test-create-agendaitem-data-table]',
    row: {
      checkBox: '[data-test-create-agendaitem-row-subcase-checkbox]',
      subcaseName: '[data-test-create-agendaitem-row-subcase-name]',
    },
  },
};
export default selectors;
