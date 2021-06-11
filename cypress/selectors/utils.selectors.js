const selectors = {
  // This file is for reusable components that don't fit in with other categories (like agenda or documents)

  /** Section VL-components **/

  // vl-checkbox
  vlCheckbox: {
    label: '[data-test-vl-checkbox-label]',
    // unused selector
    checkbox: '[data-test-vl-checkbox]',
  },

  // subcase-detail-nav
  // TODO KAS-2647 deze moet naar au-component selectors, na refactoring naar auk::Tab herbekijken
  aukTabNavBack: '[data-test-auk-tab-hierarchical-back]',

  // TODO KAS-2647 move to Au-components
  // auk-input
  aukInput: '[data-test-auk-input]',
  // auk-textarea
  aukTextarea: '[data-test-auk-textarea]',

  // back-button
  // TODO this component is basically a link-to, refactor to au-component
  generalBackButton: '[data-test-general-back-button]',
};
export default selectors;
