const selectors = {
  // route settings
  settings: {
    generalSettings: '[data-test-route-settings-general-settings]',
    manageMinisters: '[data-test-route-settings-manage-ministers]',
    manageUsers: '[data-test-route-settings-manage-users]',
  },

  // route settings/users/index
  usersIndex: {
    searchInput: '[data-test-route-settings-user-search-input]',
    searchButton: '[data-test-route-settings-user-search-button]',
    settingsUserTable: '[data-test-route-settings-settings-user-table]',
  },

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
