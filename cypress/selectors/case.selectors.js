const selectors = {
  // TODO rename imports of this file from 'cases' to 'case'

  // cases-header
  casesHeader: {
    title: '[data-test-cases-header-title]',
    addCase: '[data-test-cases-header-add-case]',
  },

  // new-case
  newCase: {
    shorttitle: '[data-test-new-case-shorttitle]',
    cancel: '[data-test-new-case-cancel]',
    shorttitleError: '[data-test-new-case-shorttitle-error]',
  },

  // subcase-overview-header
  subcaseOverviewHeader: {
    createSubcase: '[data-test-subcase-overview-header-create-subcase]',
  },

  // new-subcase
  newSubcase: {
    clonePreviousSubcase: '[data-test-new-subcase-clone-previous-subcase]',
  },

  // subcase-description
  subcaseDescription: {
    decidedOn: '[data-test-subcase-description-decided-on]',
    requestedBy: '[data-test-subcase-description-requested-by]',
    meetingNumber: '[data-test-subcase-description-meeting-number]',
    meetingPlannedStart: '[data-test-subcase-description-meeting-planned-start]',
    // TODO make selector for link and different selector for the whole field?
    agendaLink: '[data-test-subcase-description-agenda-link] a',
    // TODO unused selector
    modified: '[data-test-subcase-description-modified]',
  },

  // subcase-item
  // TODO better names
  subcaseItem: {
    approved: '[data-test-subcase-item-approved]',
    // TODO unused selector
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
      // TODO unused selector
      cancel: '[data-test-subcase-titles-edit-cancel]',
    },
  },
};
export default selectors;
