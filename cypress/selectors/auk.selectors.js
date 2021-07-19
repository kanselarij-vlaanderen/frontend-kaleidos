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

  // TODO-selector na refactoring naar auk::Tab herbekijken
  // subcase-detail-nav
  subcaseDetailNav: {
    tabNavBack: '[data-test-auk-tab-hierarchical-back]',
  },

  // TODO-selector this component is basically a link-to, refactor to au-component
  // back-button
  backButton: '[data-test-auk-back-button]',

  /** Section multiple selector AUK components **/

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
      close: '.auk-modal__header .auk-button .auk-icon .ki-close',
      minimize: '.auk-modal__header .auk-button .auk-icon .ki-minimize',
      expand: '.auk-modal__header .auk-button .auk-icon .ki-expand',
    },
    footer: {
      cancel: '.auk-modal__footer .auk-toolbar-complex__left .auk-button-link',
      // there is no default footer-save available (yet), use a custom selector for your use case
    },
  },

  // TODO-selector unused selectors
  emptyState: {
    container: '.auk-empty-state',
    message: '.auk-empty-state__content',
  },

  tab: {
    active: '.auk-tabs__tab--active',
    activeHref: '.auk-tabs__tab--active > *',
  },

  /** Section single selector AUK components **/

  checkbox: '.auk-checkbox',
  loader: '.auk-loader',
  pill: '.auk-pill',
  // TODO-selector unused selectors
  input: '.auk-input',
  textarea: '.auk-textarea',
};
export default selectors;
