const selectors = {
  createNewAgendaButton: '[data-test-vlc-agenda-createnewagendabutton]',
  datepickerButton: '[data-test-vlc-vl-datepickerButton]',
  flatpickrCalendar: '.flatpickr-calendar',
  flatpickrMonthDropdownMonths: '.open  .flatpickr-monthDropdown-months',
  numInputWrapper: '.open  .numInputWrapper',
  inputNumInputCurYear: '.open  input.numInput.cur-year',
  flatpickrDay: '.open  .flatpickr-day',
  button: 'button',
  overviewTitle: '[data-test-agendas-title]',
  agendaitemKortBestekTab: '[data-test-agenda-agendaitem-tab="agendaitem-bestek"]',
  agendaitemDocumentsTab: '[data-test-agenda-agendaitem-tab="documents"]',
  agendaitemDossierTab: '[data-test-agenda-agendaitem-tab="agendaitem-case"]',
  printContainer: '[data-test-agenda-printContainer]',
  printHeaderTitle: '[data-test-agenda-print-header-title]',
  dataTable: '.auk-table',
  dataTableZebra: '.auk-table--striped',
  toProcedureStapLink: '.auk-panel-layout__main-content a',
  confidentialityIcon: '[data-test-icon-agenda-confidentiality-locked]',
  subcase: {
    agendaLink: '[data-test-subcase-agenda-link] a',
    confidentialyCheck: '[data-test-vl-subcase-titles-edit-confidentiality] input',
  },
  item: {
    checkBoxLabel: 'label.vl-toggle__label',
    actionButton: '.auk-toolbar-complex__item button',
    themes: '[data-test-agenda-news-item-themes]',
    news: {
      editLink: '[data-test-agenda-news-item-view] [data-test-newsletter-edit]',
      saveButton: '[data-test-newsletter-edit-save]',
      checkedThemes: '[data-test-themes-selector] input:checked',
      themesSelector: '[data-agenda-item-news-edit] [data-test-themes-selector]',
    },
  },

  agendaitemDecisionTab: '[data-test-agenda-agendaitem-tab="agendaitem-decision"]',
  agendaitemPersagendaTab: '[data-test-agenda-agendaitem-tab="agendaitem-press-agenda"]',
  addDecision: '[data-test-add-decision]',
  decisionContainer: '[data-test-decision-container]',
  deleteDecision: '[data-test-delete-decision]',
  uploadDecisionFile: '[data-test-upload-decision-file]',
  accessLevelPill: '[data-test-access-level-pill]',
  accessLevelSave: '[data-test-access-level-save]',

  approveDesignAgenda: '[data-test-approve-design-agenda]',
  agendaItemEditDocumentsList: '[data-test-agenda-item-edit-documents-list]',
  documentType: '[data-test-document-type]',
  documentAccessLevel: '[data-test-document-accesslevel]',
  agendaDetailSidebarSubitem: '[data-test-agenda-detail-sidebar-sub-item]',
  agendaOverviewSubitem: '[data-test-agenda-overview-sub-item]',
  decisionPowerSelectContainer: '[data-test-decision-edit-power-select-container]',

  deleteAgendaitemButton: '[data-test-delete-agendaitem]',
  postponeAgendaitemButton: '[data-test-postpone-agendaitem]',
  revertPostponeAgendaitemButton: '[data-test-revert-postpone-agendaitem]',
  agendaDetailSubItemContainer: '[data-test-agenda-detail-sidebar-sub-item-container]',
  agendaitemNumber: '[data-test-agendaitem-number]',

  agendaOverviewItemHeader: '[data-test-agenda-overview-agenda-item-header]',
  agendaOverviewItemFormallyok: '[data-test-agenda-overview-item-formallyok]',
  agendaSidenavElement: 'data-test-agenda-sidenav-element',

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
};
export default selectors;
