const selectors = {
  // component newsletter-header
  newsletterHeader: {
    title: '[data-test-newsletter-header-title]',
  },

  // route agenda/agendaitems/agendaitem/news-item
  newsItem: {
    fullscreenEdit: '[data-test-route-agenda---news-item-fullscreen-edit]',
    edit: '[data-test-route-agenda---news-item-edit]',
    create: '[data-test-route-agenda---news-item-create]',
    alert: '[data-test-route-agenda---news-item-alert]',
  },

  // component agendaitem-news-item
  agendaitemNewsItem: {
    title: '[data-test-agendaitem-news-item-title]',
    content: '[data-test-agendaitem-news-item-content]',
    themes: '[data-test-agendaitem-news-item-themes]',
  },

  // component edit-item
  editItem: {
    noNota: '[data-test-news-item-edit-item-no-nota]',
    nota: '[data-test-news-item-edit-item-nota]',
    // the property subtitle from news item is actually the long title (confusing)
    // we expect the subtitle from newletter info but we get the title from agendaitem
    longTitle: '[data-test-news-item-edit-item-long-title]',
    // the property title from news item is actually the short title (confusing)
    shortTitle: '[data-test-news-item-edit-item-short-title]',
    mandateeProposal: '[data-test-news-item-edit-item-mandatee-proposal]',
    rdfaEditor: '[data-test-news-item-edit-item-rdfa-editor]',
    remark: '[data-test-news-item-edit-item-remark]',
    toggleFinished: '[data-test-news-item-edit-item-toggle-finished]',
    save: '[data-test-news-item-edit-item-save]',
    cancel: '[data-test-news-item-edit-item-cancel]',
    checkedThemes: '[data-test-news-item-edit-item-themes-selector] input:checked',
    themesSelector: '[data-test-news-item-edit-item-themes-selector]',
  },

  // component newsletter-meeting
  newsletterMeeting: {
    title: '[data-test-newsletter-meeting-title]',
  },

  // component newsletter-header-overview
  newsletterHeaderOverview: {
    title: '[data-test-newsletter-header-overview-title]',
    newsletterActions: {
      optionsDropdown: '[data-test-newsletter-header-actions-dropdown]',
      publishMail: '[data-test-newsletter-header-actions-publish-mail]',
    },
  },

  // component table-row
  tableRow: {
    newsletterRow: '[data-test-table-row-news-item-row]',
    agendaitemNumber: '[data-test-table-row-news-item-row-agendaitem-number]',
    titleContent: '[data-test-table-row-news-item-row-title-content]',
    inNewsletterCheckbox: '[data-test-table-row-news-item-row-checkbox-in-newsletter]',
  },

  // component button-toolbar
  buttonToolbar: {
    edit: '[data-test-news-item-table-button-toolbar-edit]',
    openNota: '[data-test-news-item-table-button-toolbar-open-nota]',
    linkToAgendaitem: '[data-test-news-item-table-button-toolbar-link-to-agendaitem]',
  },

  // component item-content
  newsletterPrint: {
    container: '[data-test-news-item-print-container]',
    title: '[data-test-news-item-print-title]',
    edit: '[data-test-news-item-print-edit]',
    noContent: '[data-test-news-item-print-no-content]',
    printItemProposal: '[data-test-news-item-print-proposal]',
    htmlContent: '[data-test-news-item-print-htmlContent]',
    remark: '[data-test-news-item-print-remark]',
    theme: '[data-test-news-item-print-theme]',
  },

  // component newsletter-print-header
  newsletterPrintHeader: {
    publicationPlannedDate: '[data-test-newsletter-print-header-publication-planned-date]',
  },
};
export default selectors;
