const selectors = {
  // ember-power-select
  emberPowerSelect: {
    trigger: '.ember-power-select-trigger',
    option: '.ember-power-select-option',
    optionSearchMessage: '.ember-power-select-option--search-message',
    searchInput: '.ember-power-select-search-input',
    selectedItem: '.ember-power-select-selected-item',
  },

  // flatPickr
  flatPickr: {
    // including '.open' ensures you have the correct flatpickr if there are multiple on the page
    flatpickrMonthDropdownMonths: '.open  .flatpickr-monthDropdown-months',
    numInputWrapper: '.open  .numInputWrapper',
    inputNumInputCurYear: '.open  input.numInput.cur-year',
    // time
    time: '.open .flatpickr-time',
    hour: '.flatpickr-hour',
    minute: '.flatpickr-minute',
    // date
    days: '.open .flatpickr-days',
    day: '.flatpickr-day',
    prevMonthDay: '.prevMonthDay',
    nextMonthDay: '.nextMonthDay',
    yearInput: '.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > .numInputWrapper > input',
    monthSelect: '.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > select',
  },

  // RDFA editor
  rdfa: {
    editorInner: '.say-editor__inner',
  },

  // ember-tag-input
  emberTagInput: {
    tag: '.emberTagInput-tag',
    input: '.emberTagInput-input',
    remove: '.emberTagInput-remove',
  },
};
export default selectors;
