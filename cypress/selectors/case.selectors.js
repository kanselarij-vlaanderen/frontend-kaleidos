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
    shorttitleError: '[data-test-new-case-shorttitle-error]',
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
    createSubcase: '[data-test-subcase-overview-header-create-subcase]',
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

  // subcase-description
  subcaseDescription: {
    timelineItem: '[data-test-subcase-description-timeline-item]',
    decidedOn: '[data-test-subcase-description-decided-on]',
    requestedBy: '[data-test-subcase-description-requested-by]',
    meetingNumber: '[data-test-subcase-description-meeting-number]',
    meetingPlannedStart: '[data-test-subcase-description-meeting-planned-start]',
    agendaLink: '[data-test-subcase-description-agenda-link]',
    agendaLinkContainer: '[data-test-subcase-description-agenda-link-container]',
    // TODO-selector unused selector
    modified: '[data-test-subcase-description-modified]',
    edit: '[data-test-subcase-description-edit]',
    subcaseName: '[data-test-subcase-description-subcase-name]',
  },

  // subcase-description-edit
  subcaseDescriptionEdit: {
    type: '[data-test-subcase-description-edit-type]',
    save: '[data-test-subcase-description-edit-save]',
  },

  // subcase-item
  // TODO-selector better names
  subcaseItem: {
    container: '[data-test-subcase-item-container]',
    link: '[data-test-subcase-item-link]',
    approved: '[data-test-subcase-item-approved]',
    // TODO-selector unused selector
    notApproved: '[data-test-subcase-item-not-approved]',
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
      // TODO-selector unused selector
      cancel: '[data-test-subcase-titles-edit-cancel]',
    },
  },
};
export default selectors;
