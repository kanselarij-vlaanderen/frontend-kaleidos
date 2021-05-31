const selectors = {
  // cases-header
  casesHeader: {
    overviewTitle: '[data-test-cases-header-title]',
    addCase: '[data-test-cases-header-add-case]',
  },

  // new-case
  newCase: {
    shorttitle: '[data-test-new-case-shorttitle]',
  },

  // subcase-overview-header
  createSubcaseButton: '[data-test-case-create-subcase-button]',

  // new-subcase
  clonePreviousSubcaseButton: '[data-test-clone-previous-subcase]',

  // subcase-description
  // TODO 1 in agenda.selectors
  subcaseModified: '[data-test-subcase-modified]',
  subcaseDecidedOn: '[data-test-subcase-decided-on]',
  subcaseRequestedBy: '[data-test-subcase-requested-by]',
  subcaseMeetingNumber: '[data-test-meeting-number]',
  subcaseMeetingPlannedStart: '[data-test-meeting-plannedStart]',

  // subcase-item
  // TODO better names
  overviewSubcaseInfo: {
    approved: '[data-test-case-overview-subcase-approved]',
    notApproved: '[data-test-case-overview-subcase-not-approved]',
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
    confidential: '[data-test-subcase-titles-edit-confidential ]',
    actions: {
      save: '[data-test-subcase-titles-edit-save]',
      // TODO unused selector
      cancel: '[data-test-subcase-titles-edit-cancel]',
    },
  },
};
export default selectors;
