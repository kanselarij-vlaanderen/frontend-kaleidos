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
    navigationButton: '[data-test-route-agendas-overview-navigation-button]',
    filter: {
      container: '[data-test-route-agendas-overview-filter-container]',
      input: '[data-test-route-agendas-overview-filter-input]',
      button: '[data-test-route-agendas-overview-filter-button]',
    },
  },

  /**
    ROUTE AGENDA
  */

  // agenda/documents/template
  agendaDocuments: {
    addDocuments: '[data-test-route-agenda-documents-add-documents]',
  },

  // agenda/agendaitems/agendaitem/decisions/template.hbs
  agendaitemDecisions: {
    // TODO-selector unused selector
    addTreatment: '[data-test-route-agenda---decisions-add-treatment]',
  },

  // agenda/agendaitems/agendaitem/documents/template
  agendaitemDocuments: {
    batchEdit: '[data-test-route-agenda---agendaitem-documents-batch-edit]',
    add: '[data-test-route-agenda---agendaitem-documents-add]',
  },

  // agenda/agendaitems/agendaitem/index/template.hbs
  agendaitemIndex: {
    confidential: '[data-test-route-agenda---agendaitem-index-confidential]',
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
    confidentialityCheckBox: '[data-test-cases---subcase-overview-confidentiality-checkbox] input',
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
    trigger: '[data-test-route-search-trigger]',
    // TODO-selector unused selector:
    datepickerButton: '[data-test-route-search-datepicker-button]',
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

  // publications/template
  publications: {
    title: '[data-test-route-publications-title]',
    // TODO-selector: there are more selectors in this route
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
