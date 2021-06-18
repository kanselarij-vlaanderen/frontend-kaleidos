const selectors = {
  // This file is for reusable components that don't fit in with other categories (like agenda or documents)

  // simple-file-uploader
  simpleFileUploader: '[data-test-simple-file-uploader]',

  // utils/overviews-header-decision
  overviewsHeaderDecision: {
    title: '[data-test-overviews-header-decision-title]',
  },

  // changes-alert
  changesAlert: {
    alert: '[data-test-changes-alert]',
    close: '[data-test-changes-alert-close]',
  },

  /** Section VL-components **/

  // vl-checkbox
  vlCheckbox: {
    label: '[data-test-vl-checkbox-label]',
    // unused selector
    checkbox: '[data-test-vl-checkbox]',
  },

  // vl-form-input
  vlFormInput: '[data-test-vl-form-input]',

  // vl-modal-footer
  vlModalFooter: {
    save: '[data-test-vl-modal-footer-save]',
    cancel: '[data-test-vl-modal-footer-cancel]',
  },

  // vl-toggle
  vlToggle: '[data-test-vl-toggle]',

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
    close: '[data-test-vl-modal-verify-close]',
    cancel: '[data-test-vl-modal-verify-cancel]',
    save: '[data-test-vl-modal-verify-save]',
  },

  // vl-alert
  vlAlert: {
    close: '[data-test-vl-alert-close]',
    // TODO unused selectors
    container: '[data-test-vl-alert]',
    title: '[data-test-vl-alert-title]',
    message: '[data-test-vl-alert-message]',
  },

};
export default selectors;
