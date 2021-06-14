const selectors = {

  // TODO na refactoring naar auk::Tab herbekijken
  // subcase-detail-nav
  subcaseDetailNav: {
    tabNavBack: '[data-test-auk-tab-hierarchical-back]',
  },

  // TODO unused selectors
  // input
  input: '[data-test-auk-input]',
  // textarea
  textarea: '[data-test-auk-textarea]',

  // TODO this component is basically a link-to, refactor to au-component
  // back-button
  backButton: '[data-test-auk-back-button]',

  pillSpan: '[data-test-auk-pill-span]',
  alert: {
    container: '[data-test-auk-alert-container]',
    title: '[data-test-auk-alert-title]',
    message: '[data-test-auk-alert-message]',
    close: '[data-test-auk-alert-close]',
  },
  labelError: '[data-test-auk-label-error]',
  loader: '[data-test-auk-loader]',

  // TODO unused selectors:
  emptyState: {
    container: '[data-test-auk-empty-state]',
    text: '[data-test-auk-empty-state-text]',
  },
};
export default selectors;
