const selectors = {
  newAgendaButton: '[data-test-vlc-agenda-createnewagendabutton]',
  emberPowerSelectTrigger: '.ember-power-select-trigger',
  emberPowerSelectOption: '.ember-power-select-option',
  datepickerButton: '[data-test-vlc-vl-datepickerButton]',
  flatpickrCalendar: '.flatpickr-calendar',
  flatpickrMonthDropdownMonths: '.flatpickr-monthDropdown-months',
  numInputWrapper: '.numInputWrapper',
  inputNumInputCurYear: 'input.numInput.cur-year',
  flatpickrDay: '.flatpickr-day',
  button: 'button',
  overviewTitle: '[data-test-agendas-title]',
  agendaListListItemDocuments: '[data-test-agenda-list-list-item-documents]',
  agendaItemKortBestekTab: '[data-test-agenda-agendaitem-tab="agendaitem-bestek"]',
  agendaItemDocumentsTab: '[data-test-agenda-agendaitem-tab="documents"]',
  agendaItemDossierTab: '[data-test-agenda-agendaitem-tab="agendaitem-case"]',
  navigateToPrintableAgenda: '[data-test-agenda-header-navigateToPrintableAgenda]',
  printContainer: '[data-test-agenda-printContainer]',
  printHeaderTitle: '[data-test-agenda-print-header-title]',
  pillContainer: '.pill-container',
  dataTable: '.vl-data-table',
  dataTableZebra: '.vl-data-table--zebra',
  toProcedureStapLink: '.vlc-panel-layout__main-content a',
  subcase: {
    agendaLink: '[data-test-subcase-agenda-link] a',
  },
  item: {
    editLink: '[data-test-agendaitem-edit-link] a',
    showInNewsLetter: '[data-test-vl-subcase-titles-edit-show-in-newsletter]',
    checkBoxLabel: 'label.vl-checkbox--switch__label',
    actionButton: '.vl-action-group button',
    themes: '[data-test-agenda-news-item-themes]',
    news: {
      editLink: '[data-test-agenda-news-item-view] [data-test-newsletter-edit]',
      saveButton: '[data-test-newsletter-edit-save]',
      checkedThemes: '[data-test-themes-selector] input:checked',
      themesSelector: '[data-agenda-item-news-edit] [data-test-themes-selector]'
    }
  }
};
export default selectors;
