const selectors = {
  // This file is for reusable components that don't fit in with other categories (like agenda or documents)

  // simple-file-uploader
  simpleFileUploader: '[data-test-simple-file-uploader]',

  // overviews-header-decision
  overviewsHeaderDecision: {
    title: '[data-test-overviews-header-decision-title]',
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
};
export default selectors;
