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
    dataTable: '[data-test-route-cases-overview-data-table]',
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
    title: '[data-test-route-search-title]',
    input: '[data-test-route-search-input]',
    from: '[data-test-route-search-date-from]',
    to: '[data-test-route-search-date-to]',
    trigger: '[data-test-route-search-trigger]',
    mandatee: '[data-test-route-search-mandatee-input]',
  },

  // search/agendaitems
  searchAgendaitems: {
    dataTable: '[data-test-route-search-agendaitems-data-table]',
  },

  // search/cases
  searchCases: {
    toggleDecisions: '[data-test-route-search-cases-toggle-decisions]',
    dataTable: '[data-test-route-search-cases-data-table]',
  },

  // search/newsletterInfos
  searchNewsletterInfos: {
    dataTable: '[data-test-route-search-newsletter-infos-data-table]',
    row: {
      title: '[data-test-route-search-newsletter-infos-row-title]',
      mandatees: '[data-test-route-search-newsletter-infos-row-mandatees]',
      decisionResult: '[data-test-route-search-newsletter-infos-row-decision-result]',
      goToAgendaitem: '[data-test-route-search-newsletter-infos-row-go-to-agendaitem]',
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

  /**
    ROUTE NEWSLETTER
  */

  // newsletter/template
  newsletter: {
    dataTable: '[data-test-route-newsletter-data-table]',
  },

  // newsletter/nota-updates/template
  notaUpdates: {
    dataTable: '[data-test-route-newsletter-nota-updates-data-table]',
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
