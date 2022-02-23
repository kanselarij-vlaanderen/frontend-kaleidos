const selectors = {
  // component newsletter-header
  newsletterHeader: {
    title: '[data-test-newsletter-header-title]',
  },

  // route agenda/agendaitems/agendaitem/news-item
  newsItem: {
    edit: '[data-test-route-agenda---news-item-edit]',
    create: '[data-test-route-agenda---news-item-create]',
  },

  // component agendaitem-news-item
  agendaitemNewsItem: {
    title: '[data-test-agendaitem-news-item-title]',
    themes: '[data-test-agendaitem-news-item-themes]',
  },

  // component edit-item
  editItem: {
    noNota: '[data-test-newsletter-edit-item-no-nota]',
    // the property subtitle from newsletter info is actually the long title (confusing)
    // we expect the subtitle from newletter info but we get the title from agendaitem
    longTitle: '[data-test-newsletter-edit-item-long-title]',
    // the property title from newsletter info is actually the short title (confusing)
    shortTitle: '[data-test-newsletter-edit-item-short-title]',
    rdfaEditor: '[data-test-newsletter-edit-item-rdfa-editor]',
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
    newsletterTitle: '[data-test-table-row-newsletter-row-title]',
    inNewsletterCheckbox: '[data-test-table-row-newsletter-row-checkbox-in-newsletter]',
  },

  // component button-toolbar
  buttonToolbar: {
    edit: '[data-test-newsletter-table-button-toolbar-edit]',
    linkToAgendaitem: '[data-test-newsletter-table-button-toolbar-link-to-agendaitem]',
  },

  // component item-content
  itemContent: {
    printItemProposal: '[data-test-newsletter-item-content-print-item-proposal]',
  },
};
export default selectors;
