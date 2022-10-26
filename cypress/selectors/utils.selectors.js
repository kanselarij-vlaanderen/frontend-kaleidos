const selectors = {
  // This file is for reusable components that don't fit in with other categories (like agenda or documents)

  // m-header (application level)
  mHeader: {
    agendas: '[data-test-m-header-agendas]',
    cases: '[data-test-m-header-cases]',
    newsletters: '[data-test-m-header-newsletters]',
    search: '[data-test-m-header-search]',
    publications: '[data-test-m-header-publications]',
    settings: '[data-test-m-header-settings]',
    userActions: '[data-test-m-header-user-actions]',
    userAction: {
      logout: '[data-test-m-header-user-action-logout]',
    },
  },

  governmentAreaSelectorForm: {
    container: '[data-test-government-area-selector-form]',
    domain: '[data-test-government-area-selector-form-domain]~span',
    field: '[data-test-government-area-selector-form-field]~span',
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
    alert: '[data-test-changes-alert]',
    close: '[data-test-changes-alert-close]',
  },

  // number-pagination
  numberPagination: {
    container: '[data-test-number-pagination-container]',
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

  /** Section VL-components **/

  // vl-modal-footer
  vlModalFooter: {
    save: '[data-test-vl-modal-footer-save]',
    cancel: '[data-test-vl-modal-footer-cancel]',
  },

  // vl-datepicker
  vlDatepicker: '[data-test-vl-datepicker]',

  // vl-modal
  vlModal: {
    container: '[data-test-vl-modal-container]',
    dialogWindow: '[data-test-vl-modal-dialogwindow]',
    close: '[data-test-vl-modal-close]',
  },

  // vl-modal-verify
  vlModalVerify: {
    container: '[data-test-vl-modal-verify-container]',
    cancel: '[data-test-vl-modal-verify-cancel]',
    save: '[data-test-vl-modal-verify-save]',
  },

  // vl-alert
  vlAlert: {
    close: '[data-test-vl-alert-close]',
    container: '[data-test-vl-alert]',
    message: '[data-test-vl-alert-message]',
  },

  // case-search
  caseSearch: {
    input: '[data-test-utils-case-search-input]',
    row: '[data-test-utils-case-search-row]',
  },

  kindSelector: {
    kind: '[data-test-utils-kind-selector]',
  },
};
export default selectors;
