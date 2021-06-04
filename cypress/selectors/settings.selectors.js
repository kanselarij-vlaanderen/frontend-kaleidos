const selectors = {
  // route settings
  generalSettings: '[data-test-settings-generalSettings]',
  manageMinisters: '[data-test-settings-manageMinisters]',
  manageUsers: '[data-test-settings-manageUsers]',

  // route settings/users/index
  userSearchInput: '[data-test-user-search-input]',
  userSearchButton: '[data-test-user-search-button]',
  settingsUserTable: '[data-test-settings-user-table]',

  // route settings/overview
  manageEmails: '[data-test-manage-emails]',
  manageGovermentDomains: '[data-test-manage-government-domains]',
  manageGovermentFields: '[data-test-manage-government-fields]',
  manageIseCodes: '[data-test-manage-ise-codes]',
  manageAlerts: '[data-test-manage-alerts]',
  manageDocumentTypes: '[data-test-manage-document-types]',
  manageCaseTypes: '[data-test-manage-case-types]',
  manageSubcaseTypes: '[data-test-manage-subcase-types]',
  manageSignatures: '[data-test-manage-signatures]',

  // route settings/ministers
  addMinister: '[data-test-minister-add]',
  sortableGroup: '[data-test-ministers-sortable-group]',
  sortableGroupRow: '[data-test-ministers-sortable-group-row]',
  mandateeFullDisplayName: '[data-test-mandatee-fulldisplayname]',
  mandateeNickname: '[data-test-mandatee-nickname]',
  mandateePriority: '[data-test-mandatee-priority]',
  mandateeEdit: '[data-test-mandatee-edit]',
  mandateeResign: '[data-test-mandatee-resign]',
  mandateeDelete: '[data-test-mandatee-delete]',

  // component vl-delete-user
  deleteUser: '[data-test-delete-user]',

  // component next-button
  // TODO this component is just a linkTo, refactor to au component
  goToUserDetail: '[data-test-next-button-user-detail]',
};
export default selectors;
