const selectors = {
  casesOverviewTitle: '[data-test-cases-header-title]',
  casesHeaderAddCase: '[data-test-cases-header-add-case]',
  metadataForm: '[data-test-metadata-form]',

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

  subcaseTitlesView: {
    type: '[data-test-subcase-titles-type]',
    edit: '[data-test-subcase-titles-edit]',
  },

  // from agenda
  subcaseTitlesEditTitle: '[data-test-subcase-titles-edit-title]',
  subcaseTitlesEditShorttitle: '[data-test-subcase-titles-edit-shorttitle]',
  subcaseTitlesEditAccessLevel: '[data-test-subcase-titles-edit-accessLevel]',
  subcaseTitlesEditConfidential: '[data-test-subcase-titles-edit-confidential ]',
  subcaseTitlesEditSave: '[data-test-subcase-titles-edit-save]',

  createSubcaseButton: '[data-test-case-create-subcase-button]',
  clonePreviousSubcaseButton: '[data-test-clone-previous-subcase]',
  subcaseModified: '[data-test-subcase-modified]',
  subcaseDecidedOn: '[data-test-subcase-decided-on]',
  subcaseRequestedBy: '[data-test-subcase-requested-by]',
  subcaseMeetingNumber: '[data-test-meeting-number]',
  subcaseMeetingPlannedStart: '[data-test-meeting-plannedStart]',

  overviewSubcaseInfo: {
    approved: '[data-test-case-overview-subcase-approved]',
    notApproved: '[data-test-case-overview-subcase-not-approved]',
  },
};
export default selectors;
