const selectors = {
  // datepickr (met css)
  datepickerButton: '[data-test-vlc-vl-datepickerButton]',
  flatpickrCalendar: '.flatpickr-calendar',
  flatpickrMonthDropdownMonths: '.open  .flatpickr-monthDropdown-months',
  numInputWrapper: '.open  .numInputWrapper',
  inputNumInputCurYear: '.open  input.numInput.cur-year',
  flatpickrDay: '.open  .flatpickr-day',

  // data table (met css)
  dataTable: '.auk-table',
  dataTableZebra: '.auk-table--striped',

  // 2x agenda-detail/sidebar-item, agenda-overview/agenda-overview-item
  confidentialityIcon: '[data-test-icon-agenda-confidentiality-locked]',

  // TODO unused selector, do we want to use this one ?
  agendaSidenavElement: 'data-test-agenda-sidenav-element',

  subcase: {
    // TODO this is in route cases/case/subcases/subcase/overview
    confidentialyCheck: '[data-test-vl-subcase-titles-edit-confidentiality] input',
  },
  item: {
    // TODO don't use css
    checkBoxLabel: 'label.vl-toggle__label',
    actionButton: '.auk-toolbar-complex__item button',
    // route agendaitem/news-item // component news-item/edit-item / agendaitem-news-item
    themes: '[data-test-agenda-news-item-themes]',
    news: {
      editLink: '[data-test-agenda-news-item-view] [data-test-newsletter-edit]',
      saveButton: '[data-test-newsletter-edit-save]',
      checkedThemes: '[data-test-themes-selector] input:checked',
      themesSelector: '[data-agenda-item-news-edit] [data-test-themes-selector]',
    },
  },

  // printable-agenda
  printableAgenda: {
    container: '[data-test-printable-agenda-container]',
    headerTitle: '[data-test-printable-agenda-header-title]',
  },

  // route agendas
  // TODO welke naam gebruiken bij route templates?
  // TODO rename selectors
  overviewTitle: '[data-test-agendas-title]',
  createNewAgendaButton: '[data-test-vlc-agenda-createnewagendabutton]',

  // agendaitem-nav
  agendaitemNav: {
    caseTab: '[data-test-agendaitem-nav-case-tab]',
    documentsTab: '[data-test-agendaitem-nav-documents-tab]',
    decisionTab: '[data-test-agendaitem-nav-decision-tab]',
    newsletterTab: '[data-test-agendaitem-nav-newsletter-tab]',
    pressAgendaTab: '[data-test-agendaitem-nav-press-agenda-tab]',
    activeTab: '[data-test-agendaitem-nav-tabs] .active',
  },

  // route agenda/agendaitems/agendaitem/decisions
  addDecision: '[data-test-add-decision]',

  // agendaitem-decision
  agendaitemDecision: {
    uploadFile: '[data-test-agendaitem-decision-upload-file]',
    // TODO unused selectors
    container: '[data-test-agendaitem-decision-container]',
    delete: '[data-test-agendaitem-decision-delete]',
  },

  // access-level-pill
  accessLevelPill: {
    // Clicking the pill in this component toggles edit mode
    pill: '[data-test-access-level-pill]',
    save: '[data-test-access-level-pill-save]',
    cancel: '[data-test-access-level-pill-cancel]',
  },

  // 3x agendaitem/documents, subcase/documents, agenda/documents
  // rename data-test-documents-route-open-batch-edit
  subcaseDocumentsEdit: '[data-test-subcase-documents-edit]',

  // edit-document-row
  // TODO move naar document.selectors
  documentType: '[data-test-document-type]',
  documentAccessLevel: '[data-test-document-accesslevel]',

  // agenda-detail/sidebar
  agendaDetailSidebarSubitem: '[data-test-agenda-detail-sidebar-sub-item]',

  // agendaitem-decision-edit
  decisionPowerSelectContainer: '[data-test-decision-edit-power-select-container]',

  // agendaitem-group-header
  agendaOverviewItemHeader: '[data-test-agenda-overview-agenda-item-header]',

  // agenda-overview-item
  agendaOverviewSubitem: '[data-test-agenda-overview-sub-item]',
  agendaOverviewItemFormallyok: '[data-test-agenda-overview-item-formallyok]',

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
