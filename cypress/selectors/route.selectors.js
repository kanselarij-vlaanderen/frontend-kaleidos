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
    addDocuments: '[data-test-agenda-documents-add-documents]',
  },

  // agenda/agendaitems/agendaitem/decisions/template.hbs
  agendaitemDecisions: {
    // TODO unused selector
    addTreatment: '[data-test-route-agenda---decisions-add-treatment]',
  },

};
export default selectors;
