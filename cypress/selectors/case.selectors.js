const selectors = {
  // cases-header
  casesHeader: {
    title: '[data-test-cases-header-title]',
    addCase: '[data-test-cases-header-add-case]',
  },

  // new-case
  newCase: {
    shorttitle: '[data-test-new-case-shorttitle]',
    shorttitleError: '[data-test-new-case-shorttitle-error]',
    toggleConfidential: '[data-test-new-case-toggle-confidential]',
    cancel: '[data-test-new-case-cancel]',
    save: '[data-test-new-case-save]',
  },

  // subcase-overview-header
  subcaseOverviewHeader: {
    titleContainer: '[data-test-subcase-overview-header-title-container]',
    createSubcase: '[data-test-subcase-overview-header-create-subcase]',
  },

  // new-subcase
  newSubcase: {
    clonePreviousSubcase: '[data-test-new-subcase-clone-previous-subcase]',
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
  },

  // subcase-item
  // TODO-selector better names
  subcaseItem: {
    approved: '[data-test-subcase-item-approved]',
    // TODO-selector unused selector
    notApproved: '[data-test-subcase-item-not-approved]',
  },

  // subcase-header
  subcaseHeader: {
    actionsDropdown: '[data-test-subcase-header-actions-dropdown]',
    actions: {
      proposeForAgenda: '[data-test-subcase-header-action-propose-for-agenda]',
      // only after opening dropdown
      deleteSubcase: '[data-test-subcase-header-action-delete-subcase]',
      moveSubcase: '[data-test-subcase-header-action-move-subcase]',
    },
  },

  // subcase-titles
  subcaseTitlesView: {
    type: '[data-test-subcase-titles-type]',
    edit: '[data-test-subcase-titles-edit]',
  },

  // subcase-titles-edit
  subcaseTitlesEdit: {
    title: '[data-test-subcase-titles-edit-title]',
    shorttitle: '[data-test-subcase-titles-edit-shorttitle]',
    accessLevel: '[data-test-subcase-titles-edit-access-level]',
    confidential: '[data-test-subcase-titles-edit-confidential]',
    actions: {
      save: '[data-test-subcase-titles-edit-save]',
      // TODO-selector unused selector
      cancel: '[data-test-subcase-titles-edit-cancel]',
    },
  },

  // subcase ise-codes
  isecodes: {
    list: '[data-test-subcase-ise-codes-list]',
    listItem: '[data-test-subcase-ise-codes-list-item]',
  },
};
export default selectors;
