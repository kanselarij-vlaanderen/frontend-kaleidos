const selectors = {
  // ember-power-select
  emberPowerSelect: {
    trigger: '.ember-power-select-trigger',
    option: '.ember-power-select-option',
    optionLoadingMessage: '.ember-power-select-option--loading-message',
    optionTypeToSearchMessage: '.ember-power-select-option--search-message',
    searchInput: '.ember-power-select-search-input',
  },

  // flatPickr
  flatPickr: {
    // including '.open' ensures you have the correct flatpickr if there are multiple on the page
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
    input: '.emberTagInput-input',
  },

  // ember-data table
  emberDataTable: {
    isLoading: '.is-loading-data',
  },

  // ember-tooltip
  emberTooltip: {
    target: '.ember-tooltip-target',
    inner: '.ember-tooltip-inner',
  },
};
export default selectors;
