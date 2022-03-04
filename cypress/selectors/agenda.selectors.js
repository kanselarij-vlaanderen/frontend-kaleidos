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
    edit: '[data-test-agendaitem-decision-edit]',
    delete: '[data-test-agendaitem-decision-delete]',
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
  },

  // agenda-detail/sidebar
  agendaDetailSidebar: {
    // TODO-selector subItem only works for nota's, not announcement
    subitem: '[data-test-agenda-detail-sidebar-sub-item]',
    announcementSubitem: '[data-test-agenda-detail-sidebar-announcement-sub-item]',
  },

  // agenda-detail/sidebar-item
  agendaDetailSidebarItem: {
    shortTitle: '[data-test-agenda-detail-sidebar-item-short-title]',
    confidential: '[data-test-agenda-detail-sidebar-item-confidential]',
    status: '[data-test-agenda-detail-sidebar-item-status]',
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
    formallyOk: '[data-test-agenda-overview-item-formally-ok]',
    confidentialityIcon: '[data-test-agenda-overview-item-confidentiality-locked]',
    status: '[data-test-agenda-overview-item-status]',
  },

  // agenda-overview
  agendaOverview: {
    notesSectionTitle: '[data-test-agenda-overview-section-title-notes]',
    showChanges: '[data-test-agenda-overview-show-changes]',
    formallyOkEdit: '[data-test-agenda-overview-formally-ok-edit]',
  },

  // agenda-header
  agendaHeader: {
    showOptions: '[data-test-agenda-header-show-options]',
    actions: {
      navigateToPrintableAgenda: '[data-test-agenda-header-navigate-to-printable-agenda]',
      addAgendaitems: '[data-test-agenda-header-add-agendaitems]',
      navigateToDecisions: '[data-test-agenda-header-navigate-to-decisions]',
      navigateToNewsletter: '[data-test-agenda-header-navigate-to-newsletter]',
      toggleEditingSession: '[data-test-agenda-header-toggle-editing-session]',
      downloadDocuments: '[data-test-agenda-header-download-documents]',
      releaseDecisions: '[data-test-agenda-header-release-decisions]',
      releaseDocuments: '[data-test-agenda-header-release-documents]',
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
    explanation: '[data-test-agendaitem-titles-explanation]',
    confidential: '[data-test-agendaitem-titles-confidential]',
    linkToSubcase: '[data-test-agendaitem-titles-link-to-subcase]',
    edit: '[data-test-agendaitem-titles-edit]',
  },

  // agendaitem-titles-edit
  agendaitemTitlesEdit: {
    title: '[data-test-agendaitem-titles-edit-title]',
    shorttitle: '[data-test-agendaitem-titles-edit-shorttitle]',
    explanation: '[data-test-agendaitem-titles-edit-explanation]',
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

  // new-session
  newSession: {
    kind: '[data-test-new-session-kind]',
    relatedMainMeeting: '[data-test-new-session-related-main-meeting]',
    meetingNumber: '[data-test-new-session-meeting-number]',
    meetingLocation: '[data-test-new-session-meeting-location]',
    datepicker: '[data-test-new-session-datepicker]',
    numberRep: {
      view: '[data-test-new-session-number-representation-view]',
      edit: '[data-test-new-session-number-representation-edit]',
      input: '[data-test-new-session-number-representation-input]',
      save: '[data-test-new-session-number-representation-save]',
    },
  },

  // edit-session
  editSession: {
    meetingNumber: '[data-test-edit-session-meeting-number]',
    numberRep: '[data-test-edit-session-number-representation]',
  },

  // create-agendaitem
  createAgendaitem: {
    input: '[data-test-create-agendaitem-input]',
    postponedCheckbox: '[data-test-create-agendaitem-postponed-checkbox]',
    dataTable: '[data-test-create-agendaitem-data-table]',
    row: {
      checkBox: '[data-test-create-agendaitem-row-subcase-checkbox]',
    },
  },
};
export default selectors;
