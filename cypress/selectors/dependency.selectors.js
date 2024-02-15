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
    hourUp: '.open .flatpickr-time > .numInputWrapper:nth-child(1) > .arrowUp',
    hourDown: '.open .flatpickr-time > .numInputWrapper:nth-child(1) > .arrowDown',
    minute: '.flatpickr-minute',
    minuteUp: '.open .flatpickr-time > .numInputWrapper:nth-child(3) > .arrowUp',
    minuteDown: '.open .flatpickr-time > .numInputWrapper:nth-child(3) > .arrowDown',
    // date
    days: '.open .flatpickr-days',
    day: '.flatpickr-day',
    prevMonthDay: '.prevMonthDay',
    nextMonthDay: '.nextMonthDay',
    prevMonth: '.open .flatpickr-months > .flatpickr-prev-month',
    nextMonth: '.open .flatpickr-months > .flatpickr-next-month',
    yearInput: '.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > .numInputWrapper > input',
    yearUp: '.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > .numInputWrapper > .arrowUp',
    yearDown: '.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > .numInputWrapper > .arrowDown',
    monthSelect: '.open .flatpickr-months > .flatpickr-month > .flatpickr-current-month > select',
  },

  // RDFA editor
  rdfaEditor: {
    inner: '.say-editor__inner',
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
