const selectors = {
  // component newsletter-header
  newsletterHeader: {
    title: '[data-test-newsletter-header-title]',
  },

  // route agenda/agendaitems/agendaitem/news-item
  newsItem: {
    edit: '[data-test-route-agenda---news-item-edit]',
    create: '[data-test-route-agenda---news-item-create]',
    alert: '[data-test-route-agenda---news-item-alert]',
  },

  // component agendaitem-news-item
  agendaitemNewsItem: {
    title: '[data-test-agendaitem-news-item-title]',
    themes: '[data-test-agendaitem-news-item-themes]',
  },

  // component edit-item
  editItem: {
    noNota: '[data-test-newsletter-edit-item-no-nota]',
    nota: '[data-test-newsletter-edit-item-nota]',
    // the property subtitle from newsletter info is actually the long title (confusing)
    // we expect the subtitle from newletter info but we get the title from agendaitem
    longTitle: '[data-test-newsletter-edit-item-long-title]',
    // the property title from newsletter info is actually the short title (confusing)
    shortTitle: '[data-test-newsletter-edit-item-short-title]',
    mandateeProposal: '[data-test-newsletter-edit-item-mandatee-proposal]',
    rdfaEditor: '[data-test-newsletter-edit-item-rdfa-editor]',
    remark: '[data-test-newsletter-edit-item-remark]',
    toggleFinished: '[data-test-newsletter-edit-item-toggle-finished]',
    save: '[data-test-newsletter-edit-item-save]',
    cancel: '[data-test-newsletter-edit-item-cancel]',
    checkedThemes: '[data-test-newsletter-edit-item-themes-selector] input:checked',
    themesSelector: '[data-test-newsletter-edit-item-themes-selector]',
  },

  // component newsletter-meeting
  newsletterMeeting: {
    title: '[data-test-newsletter-meeting-title]',
  },

  // component newsletter-header-overview
  newsletterHeaderOverview: {
    title: '[data-test-newsletter-header-overview-title]',
    notaUpdates: '[data-test-newsletter-header-overview-nota-updates]',
  },

  // component table-row
  tableRow: {
    newsletterRow: '[data-test-table-row-newsletter-row]',
    agendaitemNumber: '[data-test-table-row-newsletter-row-agendaitem-number]',
    // TODO-selector this div contains more than just the title, rename
    newsletterTitle: '[data-test-table-row-newsletter-row-title]',
    inNewsletterCheckbox: '[data-test-table-row-newsletter-row-checkbox-in-newsletter]',
  },

  // component button-toolbar
  buttonToolbar: {
    edit: '[data-test-newsletter-table-button-toolbar-edit]',
    openNota: '[data-test-newsletter-table-button-toolbar-open-nota]',
    linkToAgendaitem: '[data-test-newsletter-table-button-toolbar-link-to-agendaitem]',
  },

  // component item-content
  itemContent: {
    container: '[data-test-newsletter-item-content-container]',
    title: '[data-test-newsletter-item-content-title]',
    edit: '[data-test-newsletter-item-content-edit]',
    noContent: '[data-test-newsletter-item-content-no-content]',
    printItemProposal: '[data-test-newsletter-item-content-print-item-proposal]',
    richtext: '[data-test-newsletter-item-content-richtext]',
    remark: '[data-test-newsletter-item-content-remark]',
    theme: '[data-test-newsletter-item-content-theme]',
  },

  // component newsletter-print-header
  newsletterPrintHeader: {
    publicationPlannedDate: '[data-test-newsletter-print-header-publication-planned-date]',
  },
};
export default selectors;
