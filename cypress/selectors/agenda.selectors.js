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
  toProcedureStapLink: '.vlc-panel-layout__main-content a',
  confidentialityIcon: '[data-test-icon-agenda-confidentiality-locked]',
  subcase: {
    agendaLink: '[data-test-subcase-agenda-link] a',
    confidentialyCheck: '[data-test-vl-subcase-titles-edit-confidentiality] input'
  },
  item: {
    editLink: '[data-test-agendaitem-edit-link] a',
    showInNewsLetter: '[data-test-vl-subcase-titles-edit-show-in-newsletter]',
    checkBoxLabel: 'label.vl-checkbox--switch__label',
    actionButton: '.vl-action-group button'
  }
};
export default selectors;
