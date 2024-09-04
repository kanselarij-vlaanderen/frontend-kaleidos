const selectors = {
  // This file is for reusable components that don't fit in with other categories (like agenda or documents)

  // m-header (application level)
  mHeader: {
    agendas: '[data-test-m-header-agendas]',
    cases: '[data-test-m-header-cases]',
    newsletters: '[data-test-m-header-newsletters]',
    search: '[data-test-m-header-search]',
    publications: '[data-test-m-header-publications]',
    signatures: '[data-test-m-header-signatures]',
    settings: '[data-test-m-header-settings]',
    userActions: '[data-test-m-header-user-actions]',
    userAction: {
      logout: '[data-test-m-header-user-action-logout]',
    },
  },

  governmentAreaSelectorForm: {
    container: '[data-test-government-area-selector-form]',
    // domain: '[data-test-government-area-selector-form-domain]~span',
    domainList: '[data-test-government-area-selector-form-domain-list]',
    // field: '[data-test-government-area-selector-form-field]~span',
  },

  // utils/overviews-header-decision
  overviewsHeaderDecision: {
    title: '[data-test-overviews-header-decision-title]',
  },

  // utils/overviews-header-print
  overviewsHeaderPrint: {
    title: '[data-test-overviews-header-print-title]',
  },

  // changes-alert
  changesAlert: {
    container: '[data-test-changes-alert]',
    message: '[data-test-changes-alert-message]',
    confirm: '[data-test-changes-alert-confirm]',
    cancel: '[data-test-changes-alert-cancel]',
  },

  // number-pagination
  numberPagination: {
    container: '[data-test-number-pagination-container]',
    size: '[data-test-number-pagination-size]',
  },

  // radio-dropdown
  radioDropdown: {
    input: '[data-test-radio-dropdown-input]',
  },

  // mandatee-selector
  mandateeSelector: {
    container: '[data-test-mandatee-selector-container]',
  },

  // mandatees-selector-modal
  mandateesSelector: {
    openSearch: '[data-test-mandatees-selector-open-search]',
    add: '[data-test-mandatees-selector-add]',
  },

  // mandatee-person-selector
  mandateePersonSelector: '[data-test-mandatee-person-selector]',

  // government-fields-panel
  governmentAreasPanel: {
    edit: '[data-test-government-areas-panel-edit]',
    rows: '[data-test-government-areas-panel-row]',
    row: {
      label: '[data-test-government-areas-panel-row-label]',
      fields: '[data-test-government-areas-panel-row-fields]',
    },
    emptyState: '[data-test-government-areas-empty-state]',
  },

  // edit-government-fields-modal
  editGovernmentFieldsModal: {
    save: '[data-test-edit-government-fields-modal-save]',
  },

  alertDialog: {
    confirm: '[data-test-alert-dialog-confirm]',
  },

  formallyOkPill: {
    pill: '[data-test-formally-ok-pill]',
  },

  formallyOkEdit: {
    selector: '[data-test-formally-ok-edit-selector]',
    // unused selectors, we would start changing commands to use these now and make new tests
    save: '[data-test-formally-ok-edit-save]',
    cancel: '[data-test-formally-ok-edit-cancel]',
  },

  /** Section VL-components **/

  // vl-modal-verify
  vlModalVerify: {
    container: '[data-test-vl-modal-verify-container]',
    save: '[data-test-vl-modal-verify-save]',
  },

  // case-search
  caseSearch: {
    input: '[data-test-utils-case-search-input]',
    row: '[data-test-utils-case-search-row]',
    rows:  {
      radio: '[data-test-utils-case-search-row-radio]',
      titleLink: '[data-test-utils-case-search-row-title-link]',
    },
  },

  kindSelector: {
    kind: '[data-test-utils-kind-selector]',
  },

  downloadFileToast: {
    message: '[data-test-download-file-toast-message]',
    link: '[data-test-download-file-toast-link]',
  },

  // results-header
  resultsHeader: {
    type: '[data-test-results-header-type]',
  },

  // date-range-filter
  dateRangeFilter: {
    // more ideal selectors, but would break current tests
    // from: '[data-test-date-range-filter-from]',
    // to: '[data-test-date-range-filter-to]',
    from: '[data-test-route-search-date-from]',
    to: '[data-test-route-search-date-to]',
  },

  // ministerFilter
  ministerFilter: {
    pastMinisters: '[data-test-search-minister-filter-past-ministers]',
  },

  rdfaEditor: '[data-test-rdfa-editor]',
};
export default selectors;
