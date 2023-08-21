const selectors = {
  // cases-header
  casesHeader: {
    title: '[data-test-cases-header-title]',
    addCase: '[data-test-cases-header-add-case]',
  },

  // new-case
  newCase: {
    shorttitle: '[data-test-new-case-shorttitle]',
    form: '[data-test-new-case-form]',
    cancel: '[data-test-new-case-cancel]',
    save: '[data-test-new-case-save]',
  },

  // subcase-detail-nav
  subcaseDetailNav: {
    overview: '[data-test-subcase-detail-nav-overview]',
    documents: '[data-test-subcase-detail-nav-documents]',
    decisions: '[data-test-subcase-detail-nav-decisions]',
  },

  // subcase-overview-header
  subcaseOverviewHeader: {
    titleContainer: '[data-test-subcase-overview-header-title-container]',
    publicationFlowLink: '[data-test-subcase-overview-header-publication-flow-link]',
    editCase: '[data-test-subcase-overview-header-edit-case]',
    createSubcase: '[data-test-subcase-overview-header-create-subcase]',
  },

  // subcase-process
  subcaseProcess: {
    shorttitle: '[data-test-subcases-process-shorttitle]',
  },

  // new-subcase
  newSubcase: {
    clonePreviousSubcase: '[data-test-new-subcase-clone-previous-subcase]',
    type: '[data-test-new-subcase-type]',
    shorttitle: '[data-test-new-subcase-shorttitle]',
    longtitle: '[data-test-new-subcase-longtitle]',
    procedureStep: '[data-test-new-subcase-procedure-step]',
    procedureName: '[data-test-new-subcase-procedure-name]',
    save: '[data-test-new-subcase-save]',
  },

  subcaseTimeline: {
    item: '[data-test-subcase-timeline-item]',
  },

  // subcase-description
  subcaseDescription: {
    panel: '[data-test-subcase-description-panel]',
    decidedOn: '[data-test-subcase-description-decided-on]',
    requestedBy: '[data-test-subcase-description-requested-by]',
    meetingNumber: '[data-test-subcase-description-meeting-number]',
    meetingPlannedStart: '[data-test-subcase-description-meeting-planned-start]',
    agendaLink: '[data-test-subcase-description-agenda-link]',
    edit: '[data-test-subcase-description-edit]',
    subcaseName: '[data-test-subcase-description-subcase-name]',
  },

  // subcase-description-edit
  subcaseDescriptionEdit: {
    type: '[data-test-subcase-description-edit-type]',
    save: '[data-test-subcase-description-edit-save]',
  },

  // subcase-item
  subcaseItem: {
    container: '[data-test-subcase-item-container]',
    link: '[data-test-subcase-item-link]',
    approved: '[data-test-subcase-item-approved]',
    pending: '[data-test-subcase-item-pending]',
    showDocuments: '[data-test-subcase-item-show-documents]',
  },

  // subcase-header
  subcaseHeader: {
    actionsDropdown: '[data-test-subcase-header-actions-dropdown]',
    showProposedAgendas: '[data-test-subcase-header-show-proposed-agendas]',
    actions: {
      proposeForAgenda: '[data-test-subcase-header-propose-for-agenda]',
      deleteSubcase: '[data-test-subcase-header-action-delete-subcase]',
      moveSubcase: '[data-test-subcase-header-action-move-subcase]',
    },
  },

  // subcase-titles
  subcaseTitlesView: {
    type: '[data-test-subcase-titles-type]',
    edit: '[data-test-subcase-titles-edit]',
    subcaseName: '[data-test-subcase-titles-panel-subcase-name]',
  },

  // subcase-titles-edit
  subcaseTitlesEdit: {
    title: '[data-test-subcase-titles-edit-title]',
    shorttitle: '[data-test-subcase-titles-edit-shorttitle]',
    confidential: '[data-test-subcase-titles-edit-confidential]',
    actions: {
      save: '[data-test-subcase-titles-edit-save]',
    },
  },
};
export default selectors;
