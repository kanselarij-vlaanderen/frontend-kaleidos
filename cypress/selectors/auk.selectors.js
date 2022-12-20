const selectors = {
  /* IMPORTANT! README
   *
   * In the near future, AUK component will become a dependency we import
   * This will result in the loss of data-test-auk selectors we are currently using
   * We will have to work with a combination of css selectors and 'data-test-xyz' passed on via ...attributes
   * Take this into account when adding to this file
   *
   */

  /** Section for non AUK components (but have auk-like selectors) **/

  // TODO-selector this component is basically a link-to, refactor to au-component
  // back-button
  backButton: '[data-test-auk-back-button]',

  /** Section multiple selector AUK components **/

  alertStack: {
    container: '.auk-alert-stack',
  },

  alert: {
    message: '.auk-alert__message',
    error: '.auk-alert--error',
  },

  label: {
    error: '.auk-label-error',
  },

  modal: {
    container: '.auk-modal',
    body: '.auk-modal__body',
    header: {
      title: '.auk-modal__header .auk-toolbar__title',
      close: '.auk-modal__header .au-c-button .au-c-icon--x',
    },
    footer: {
      cancel: '.auk-modal__footer .auk-toolbar-complex__left .au-c-button',
      confirm: '[data-test-confirmation-modal-confirm]',
      // there is no default footer-save available (yet), use a custom selector for your use case
    },
  },

  auModal: {
    body: '.au-c-modal__body',
    header: {
      close: '.au-c-modal__close',
    },
  },

  accordion: {
    header: {
      button: '.auk-accordion__header .auk-accordion__button',
    },
  },

  emptyState: {
    message: '.auk-empty-state__content',
  },

  tab: {
    tab: '.auk-tabs__tab',
    activeHref: '.auk-tabs__tab--active > *',
    hierarchicalBack: '.auk-tabs__hierarchical-back',
  },

  tabs: {
    reversed: '.auk-tabs--reversed',
  },

  pagination: {
    count: '.auk-pagination__element:nth-child(1) > p',
    previous: '.auk-pagination__element:nth-child(2) > .au-c-button',
    next: '.auk-pagination__element:nth-child(3) > .au-c-button',
  },

  header: {
    title: '[data-test-modal-header-title]',
  },

  /** Section single selector AUK components **/

  checkbox: {
    checkbox: '.auk-checkbox__toggle',
    label: '.auk-checkbox__label ',
  },
  loader: '.auk-loader',

  datepicker: {
    datepicker: '[data-test-auk-datepickr]',
    clear: '[data-test-auk-datepickr-clear]',
  },

  formHelpText: '.auk-form-help-text',
  formGroup: '.auk-form-group',

  fileUpload: '.auk-file-upload',

  icon: {
    warning: '.auk-icon--warning',
  },
};
export default selectors;
