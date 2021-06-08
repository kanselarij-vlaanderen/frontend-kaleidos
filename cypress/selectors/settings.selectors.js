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
  overview: {
    manageEmails: '[data-test-route-settings-overview-manage-emails]',
    manageGovermentDomains: '[data-test-route-settings-overview-manage-government-domains]',
    manageGovermentFields: '[data-test-route-settings-overview-manage-government-fields]',
    manageIseCodes: '[data-test-route-settings-overview-manage-ise-codes]',
    manageAlerts: '[data-test-route-settings-overview-manage-alerts]',
    manageDocumentTypes: '[data-test-route-settings-overview-manage-document-types]',
    manageCaseTypes: '[data-test-route-settings-overview-manage-case-types]',
    manageSubcaseTypes: '[data-test-route-settings-overview-manage-subcase-types]',
    manageSignatures: '[data-test-route-settings-overview-manage-signatures]',
  },

  // route settings/ministers
  ministers: {
    add: '[data-test-route-settings-ministers-add]',
    // TODO unused selectors
    sortableGroup: '[data-test-route-settings-ministers-sortable-group]',
    sortableGroupRow: '[data-test-route-settings-ministers-sortable-group-row]',
    mandatee: {
      edit: '[data-test-route-settings-ministers-mandatee-edit]',
      delete: '[data-test-route-settings-ministers-mandatee-delete]',
      // TODO unused selectors
      fullDisplayName: '[data-test-route-settings-ministers-mandatee-full-display-name]',
      nickname: '[data-test-route-settings-ministers-mandatee-nickname]',
      priority: '[data-test-route-settings-ministers-mandatee-priority]',
      resign: '[data-test-mandatee-route-settings-ministers-mandatee-resign]',
    },
  },

  // component vl-delete-user
  vlDeleteUser: {
    delete: '[data-test-vl-delete-user]',
  },

  // component next-button
  // TODO this component is just a linkTo, refactor to au component
  goToUserDetail: '[data-test-next-button-user-detail]',
};
export default selectors;
