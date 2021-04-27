const selectors = {
  casesOverviewTitle: '[data-test-cases-header-title]',
  casesHeaderAddCase: '[data-test-cases-header-add-case]',
  metadataForm: '[data-test-metadata-form]',
  deleteSubcase: '[data-test-delete-subcase]',
  createSubcaseButton: '[data-test-case-create-subcase-button]',
  clonePreviousSubcaseButton: '[data-test-clone-previous-subcase]',
  subcaseType: '[data-test-subcase-type]',
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
