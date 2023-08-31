const selectors = {
  /* INFO: ROUTE TEST SELECTOR FORMAT
   *
   * for top level template of route :
   * 'data-test-route-{main route name}-{action or attribute}
   *
   * for indicating subroutes use triple dash '---' (1 or more levels between main route and subroute):
   * 'data-test-route-{main route name}---{subroute name}-{action or attribute}
   *
  */

  /**
    ROUTE AGENDAS
  */

  // agendas/template.hbs
  agendas: {
    title: '[data-test-route-agendas-title]',
    action: {
      newMeeting: '[data-test-route-agendas-new-meeting]',
    },
  },

  // agendas/overview/template.hbs
  agendasOverview: {
    dataTable: '[data-test-route-agendas-overview-data-table]',
    loader: '[data-test-route-agendas-overview-loader]',
    row: {
      title: '[data-test-route-agendas-overview-row-title]',
      kind: '[data-test-route-agendas-overview-row-kind]',
      navButton: '[data-test-route-agendas-overview-row-nav-button]',
    },
    filter: {
      container: '[data-test-route-agendas-overview-filter-container]',
      input: '[data-test-route-agendas-overview-filter-input]',
      warning: '[data-test-route-agendas-overview-filter-warning-no-results]',
    },
  },

  /**
    ROUTE AGENDA
  */

  // agenda/documents/template
  agendaDocuments: {
    addDocuments: '[data-test-route-agenda-documents-add-documents]',
    batchEdit: '[data-test-route-agenda-documents-batch-edit]',
  },

  // agenda/agendaitems/agendaitem/documents/template
  agendaitemDocuments: {
    batchEdit: '[data-test-route-agenda---agendaitem-documents-batch-edit]',
    openPublication: '[data-test-route-agenda---agendaitem-documents-open-publication]',
    add: '[data-test-route-agenda---agendaitem-documents-add]',
  },

  /**
    ROUTE CASES
  */

  // cases/overview/template
  casesOverview: {
    showArchived: '[data-test-route-cases-overview-show-archived]',
    dataTable: '[data-test-route-cases-overview-data-table]',
    row: {
      caseTitle: '[data-test-route-cases-overview-row-case-title]',
      actionsDropdown: '[data-test-route-cases-overview-row-actions-dropdown]',
      actions: {
        edit: '[data-test-route-cases-overview-row-actions-edit]',
        archive: '[data-test-route-cases-overview-row-actions-archive]',
      },
      goToCase: '[data-test-route-cases-overview-row-go-to-case]',
    },
  },

  // cases/case/subcase/subcase/overview/template
  subcaseOverview: {
    confidentialityCheckBox: '[data-test-cases---subcase-overview-confidentiality-checkbox]',
  },

  subcaseDocuments: {
    batchEdit: '[data-test-route-cases---subcase-documents-batch-edit]',
    add: '[data-test-route-cases---subcase-documents-add]',
  },

  /**
    ROUTE SEARCH
  */

  // search/template
  search: {
    input: '[data-test-route-search-input]',
    from: '[data-test-route-search-date-from]',
    to: '[data-test-route-search-date-to]',
    trigger: '[data-test-route-search-trigger]',
    mandatee: '[data-test-route-search-mandatee-input]',
  },

  // search/agendaitems
  searchAgendaitems: {
    filter: {
      type: '[data-test-route-search-agendaitems-type-filter]',
      finalAgenda: '[data-test-route-search-agendaitems-final-agenda-filter]',
    },
    dataTable: '[data-test-route-search-agendaitems-data-table]',
  },

  // search/cases
  searchCases: {
    removedCasesList: '[data-test-route-search-removed-cases-list]',
    dataTable: '[data-test-route-search-cases-data-table]',
    row: '[data-test-route-search-cases-data-table-row]',
  },

  // search/newsletters
  searchNewsletters: {
    dataTable: '[data-test-route-search-news-items-data-table]',
    row: {
      title: '[data-test-route-search-news-items-row-title]',
      mandatees: '[data-test-route-search-news-items-row-mandatees]',
      decisionResult: '[data-test-route-search-news-items-row-decision-result]',
      goToAgendaitem: '[data-test-route-search-news-items-row-go-to-agendaitem]',
    },
  },

  // search/publications
  searchPublications: {
    dateType: '[data-test-route-search-publication-date-type]',
    dataTable: '[data-test-route-search-publication-data-table]',
    row: {
      number: '[data-test-route-search-publication-row-number]',
    },
  },

  // search/documents
  searchDocuments: {
    row: '[data-test-route-search-documents-row]',
  },

  // search/decisions
  searchDecisions: {
    row: '[data-test-route-search-decisions-data-table-row]',
  },

  // components (?)

  // TODO This selector is removed but unused in this branch. Find a fix in KAS-4004 or KAS-4016
  // search/minister-filter
  searchMinisterFilter: {
    list: '[data-test-route-search-minister-filter-list]',
  },

  // search/confidential-only
  searchConfidentialOnly: {
    checkbox: '[data-test-route-search-confidential-only-checkbox]',
  },

  // search/document-type-filter
  searchDocumentTypeFilter: {
    list: '[data-test-route-search-document-type-filter]',
  },

  // search/result-cards/case
  caseResultCard: {
    date: '[data-test-route-search-result-cards-case-date]',
    shortTitleLink: '[data-test-route-search-result-cards-case-shorttitle]',
    foundSubcases: '[data-test-route-search-result-cards-case-found-subcases]',
  },

  // search/result-cards/agendaitem
  agendaitemResultCard: {
    type: '[data-test-route-search-result-cards-agendaitem-type]',
    date: '[data-test-route-search-result-cards-agendaitem-date]',
    shortTitleLink: '[data-test-route-search-result-cards-agendaitem-shorttitle]',
    title: '[data-test-route-search-result-cards-agendaitem-title]',
    agendaSerialNumber: '[data-test-route-search-result-cards-agendaitem-agenda-serial-number]',
    pastAgendaVersion: '[data-test-route-search-result-cards-agendaitem-past-agenda-version]',
  },

  // search/result-cards/document
  documentResultCard: {
    date: '[data-test-route-search-result-cards-document-date]',
    filename: '[data-test-route-search-result-cards-document-filename]',
    agendaItem: '[data-test-route-search-result-cards-document-agendaitem]',
  },

  // search/result-cards/document
  decisionResultCard: {
    date: '[data-test-route-search-result-cards-decision-date]',
    shortTitleLink: '[data-test-route-search-result-cards-decision-shorttitle]',
    result: '[data-test-route-search-result-cards-decision-result]',
  },

  // search/result-cards/document
  newsItemResultCard: {
    date: '[data-test-route-search-result-cards-news-item-date]',
    titleLink: '[data-test-route-search-result-cards-news-item-title]',
    text: '[data-test-route-search-result-cards-news-item-text]',
    mandatees: '[data-test-route-search-result-cards-news-item-mandatees]',
  },
  /**
    ROUTE NEWSLETTER
  */

  // newsletter/template
  newsletter: {
    dataTable: '[data-test-route-newsletter-data-table]',
    header: {
      number: '[data-test-route-newsletter-header-number]',
      inNewsletter: '[data-test-route-newsletter-header-show-in-newsletter]',
      latestModified: '[data-test-route-newsletter-header-latest-modified]',
    },
  },

  // newsletter/nota-updates/template
  notaUpdates: {
    dataTable: '[data-test-route-newsletter-nota-updates-data-table]',
    row: {
      showPieceViewer: '[data-test-route-newsletter-nota-updates-show-piece-viewer]',
      goToAgendaitemDocuments: '[data-test-route-newsletter-nota-updates-go-to-agendaitem-documents]',
    },
  },

  /**
    ROUTE NEWSLETTERS
  */

  // newsletters/template
  newsletters: {
    dataTable: '[data-test-route-newsletters-data-table]',
    row: {
      title: '[data-test-route-newsletters-data-table-row-title]',
    },
  },

  /**
    ROUTE PUBLICATIONS
  */

  /**
    ROUTE SIGNATURES
  */

  // signatures/template
  signatures: {
    openMinisterFilter: '[data-test-route-signatures-open-minister-filter]',
    applyFilter: '[data-test-route-signatures-apply-filter]',
    dataTable: '[data-test-route-signatures-data-table]',
    row: {
      checkbox: '[data-test-route-signatures-row-checkbox]',
      name: '[data-test-route-signatures-row-name]',
      mandatee: '[data-test-route-signatures-row-mandatee]',
      openSidebar: '[data-test-route-signatures-row-open-sidebar]',
    },
    sidebar: {
      close: '[data-test-route-signatures-sidebar-close]',
      info: '[data-test-route-signatures-sidebar-info]',
      preview: '[data-test-route-signatures-sidebar-preview]',
      lastAgendaitem: '[data-test-route-signatures-sidebar-last-agendaitem]',
      startSignflow: '[data-test-route-signatures-sidebar-start-signflow]',
      stopSignflow: '[data-test-route-signatures-sidebar-stop-signflow]',
    },
  },

  // signatures/ongoing

  ongoing: {
    row: {
      documentName: '[data-test-route-search-signatures-ongoing-row-document-name]',
    },
  },

  /**
    ROUTE LOGIN
  */

  // login/template
  login: {
    acmidmButton: '[data-test-route-login-acmidm-container] button',
  },

  /**
    ROUTE MOCK-LOGIN
   */

  // mock-login-route/template
  mockLogin: {
    list: '[data-test-mock-login-list]',
  },


  /**
    ROUTE ACCOUNTLESS-USERS
  */

  // accountless-users/template
  accountlessUsers: {
    title: '[data-test-route-accountless-users-title]',
    message: '[data-test-route-accountless-users-message]',
  },

};
export default selectors;
