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
    // TODO unused selectors
    container: '[data-test-agendaitem-decision-container]',
    delete: '[data-test-agendaitem-decision-delete]',
  },

  // agendaitem-decision-edit
  agendaitemDecisionEdit: {
    resultContainer: '[data-test-agendaitem-decision-edit-result-container]',
    save: '[data-test-agendaitem-decision-edit-save]',
  },

  // access-level-pill
  accessLevelPill: {
    // Clicking the pill in this component toggles edit mode
    pill: '[data-test-access-level-pill]',
    save: '[data-test-access-level-pill-save]',
    cancel: '[data-test-access-level-pill-cancel]',
  },

  // agenda-detail/sidebar
  agendaDetailSidebar: {
    // TODO subItem only works for nota's, not announcement
    subitem: '[data-test-agenda-detail-sidebar-sub-item]',
  },

  // agenda-detail/sidebar-item
  agendaDetailSidebarItem: {
    confidential: '[data-test-agenda-detail-sidebar-item-confidential]',
    status: '[data-test-agenda-detail-sidebar-item-status]',
    // Test tag is not possible, CSS is added conditionally
    retracted: '.vlc-u-opacity-lighter',
  },

  // agendaitem-group-header
  agendaitemGroupHeader: {
    section: '[data-test-agendaitem-group-header-section]',
  },

  // agenda-overview-item
  agendaOverviewItem: {
    subitem: '[data-test-agenda-overview-item-sub-item]',
    formallyOk: '[data-test-agenda-overview-item-formally-ok]',
    confidentialityIcon: '[data-test-agenda-overview-item-confidentiality-locked]',
    status: '[data-test-agenda-overview-item-status]',
  },

  // agenda-overview
  agendaOverview: {
    formallyOkEdit: '[data-test-agenda-overview-formally-ok-edit]',
  },

  // agenda-header
  agendaHeader: {
    showAgendaOptions: '[data-test-agenda-header-show-agenda-options]',
    agendaActions: {
      approveAgenda: '[data-test-agenda-header-approve-agenda]',
      approveAndCloseAgenda: '[data-test-agenda-header-approve-and-close-agenda]',
      lockAgenda: '[data-test-agenda-header-lock-agenda]',
      unlockAgenda: '[data-test-agenda-header-unlock-agenda]',
      reopenPreviousVersion: '[data-test-agenda-header-reopen-previous-version]',
      deleteAgenda: '[data-test-agenda-header-delete-agenda]',
    },
    confirm: {
      approveAgenda: '[data-test-agenda-header-approve-agenda-confirm]',
      approveAndCloseAgenda: '[data-test-agenda-header-approve-and-close-agenda-confirm]',
      lockAgenda: '[data-test-agenda-header-lock-agenda-confirm]',
      reopenPreviousVersion: '[data-test-agenda-header-reopen-previous-version-confirm]',
      deleteAgenda: '[data-test-agenda-header-delete-agenda-confirm]',
    },
    showActionOptions: '[data-test-agenda-header-show-action-options]',
    actions: {
      createNewDesignAgenda: '[data-test-agenda-header-create-new-design]',
      navigateToPrintableAgenda: '[data-test-agenda-header-navigate-to-printable-agenda]',
      addAgendaitems: '[data-test-agenda-header-add-agendaitems]',
      navigateToDecisions: '[data-test-agenda-header-navigate-to-decisions]',
      navigateToNewsletter: '[data-test-agenda-header-navigate-to-newsletter]',
      toggleEditingSession: '[data-test-agenda-header-toggle-editing-session]',
      downloadDocuments: '[data-test-agenda-header-download-documents]',
      releaseDecisions: '[data-test-agenda-header-release-decisions]',
      releaseDocuments: '[data-test-agenda-header-release-documents]',
      approveAllAgendaitems: '[data-test-agenda-header-approve-all-agendaitems]',
      // TODO unused selectors
      navigateToAgendaView: ['data-test-agenda-header-navigate-to-agenda-view'],
      navigateToPressagenda: '[data-test-agenda-header-navigate-to-pressagenda]',
      selectSignature: '[data-test-agenda-header-select-signature]',
      printAgenda: ['data-test-agenda-header-print-agenda'],
    },
    // TODO unused selector
    title: ['data-test-agenda-header-title'],
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
    numberRep: {
      edit: '[data-test-new-session-number-representation-edit]',
      input: '[data-test-new-session-number-representation-input]',
      save: '[data-test-new-session-number-representation-save]',
    },
  },
};
export default selectors;
