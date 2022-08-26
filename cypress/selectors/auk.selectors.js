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
    container: '.auk-alert',
    title: '.auk-alert__title',
    message: '.auk-alert__message',
  },

  label: {
    error: '.auk-label-error',
  },

  modal: {
    container: '.auk-modal',
    body: '.auk-modal__body',
    header: {
      title: '.auk-modal__header .auk-toolbar__title',
      // TODO-selector unused selectors
      close: '.auk-modal__header .auk-button .auk-icon .ki-x',
      minimize: '.auk-modal__header .auk-button .auk-icon .ki-minimize',
      expand: '.auk-modal__header .auk-button .auk-icon .ki-expand',
    },
    footer: {
      cancel: '.auk-modal__footer .auk-toolbar-complex__left .auk-button-link',
      // there is no default footer-save available (yet), use a custom selector for your use case
    },
  },

  accordion: {
    header: {
      button: '.auk-accordion__header .auk-accordion__button',
    },
  },

  accordionPanel: {
    header: {
      title: '.auk-accordion-panel__header .auk-accordion__title',
    },
  },

  // TODO-selector unused selectors
  emptyState: {
    container: '.auk-empty-state',
    message: '.auk-empty-state__content',
  },

  tab: {
    tab: '.auk-tabs__tab',
    active: '.auk-tabs__tab--active',
    activeHref: '.auk-tabs__tab--active > *',
    hierarchicalBack: '.auk-tabs__hierarchical-back',
  },

  tabs: {
    reversed: '.auk-tabs--reversed',
  },

  pagination: {
    count: '.auk-pagination__element:nth-child(1) > p',
    previous: '.auk-pagination__element:nth-child(2) > .auk-button-link',
    next: '.auk-pagination__element:nth-child(3) > .auk-button-link',
  },

  /** Section single selector AUK components **/

  checkbox: {
    // TODO-selector unused selectors
    container: '.auk-checkbox',
    checkbox: '.auk-checkbox__toggle',
  },
  loader: '.auk-loader',
  // TODO-selector unused selectors
  input: '.auk-input',
  textarea: '.auk-textarea',

  datepicker: '[data-test-auk-datepickr]',
  icon: '.auk-icon',
  warningIcon: '.ki ki-alert-triangle auk-icon--warning',

  confidentialityPill: {
    locked: '[data-test-confidentiality-pill-icon-locked]',
    unlocked: '[data-test-confidentiality-pill-icon-unlocked]',
  },

  fileTypePill: '[data-test-file-type-pill]',
  formHelpText: '.auk-form-help-text',
  formGroup: '.auk-form-group',
};
export default selectors;
