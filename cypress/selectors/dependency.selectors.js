const selectors = {
  // ember-power-select
  emberPowerSelect: {
    trigger: '.ember-power-select-trigger',
    option: '.ember-power-select-option',
    optionSearchMessage: '.ember-power-select-option--search-message',
    searchInput: '.ember-power-select-search-input',
  },

  // flatPickr
  flatPickr: {
    // including '.open' ensures you have the correct flatpickr if there are multiple on the page
    flatpickrMonthDropdownMonths: '.open  .flatpickr-monthDropdown-months',
    numInputWrapper: '.open  .numInputWrapper',
    inputNumInputCurYear: '.open  input.numInput.cur-year',
    flatpickrDay: '.open  .flatpickr-day',
  },

  // RDFA editor
  rdfa: {
    editorInner: '.say-editor__inner',
  },
};
export default selectors;
