const selectors = {
  // route settings
  settings: {
    generalSettings: '[data-test-route-settings-general-settings]',
    manageMinisters: '[data-test-route-settings-manage-ministers]',
    manageUsers: '[data-test-route-settings-manage-users]',
  },

  // route settings/users/index
  usersIndex: {
    searchInput: '[data-test-route-settings-users-search-input]',
    searchButton: '[data-test-route-settings-users-search-button]',
    table: '[data-test-route-settings-users-table]',
    row: {
      name: '[data-test-route-settings-users-row-name]',
      group: '[data-test-route-settings-users-row-group]',
    },
  },

  // route settings/users/user/index
  user: {
    generalInfo: '[data-test-route-settings---user-general-info]',
    technicalInfo: '[data-test-route-settings---user-technical-info]',
  },

  // component settings-header (only used for users route headers)
  settingsHeader: {
    title: '[data-test-settings-header-title]',
  },

  // route settings/overview
  overview: {
    manageEmails: '[data-test-route-settings-overview-manage-emails]',
    manageAlerts: '[data-test-route-settings-overview-manage-alerts]',
    manageDocumentTypes: '[data-test-route-settings-overview-manage-document-types]',
    manageCaseTypes: '[data-test-route-settings-overview-manage-case-types]',
    manageSubcaseTypes: '[data-test-route-settings-overview-manage-subcase-types]',
  },

  // route settings/system-alerts/index/template
  systemAlertsIndex: {
    alerts: '[data-test-route-settings-system-alerts-index-alerts-dropdown]',
    add: '[data-test-route-settings-system-alerts-index-add]',
    remove: '[data-test-route-settings-system-alerts-index-remove]',
  },

  // component system-alert-form
  systemAlertForm: {
    title: '[data-test-system-alert-form-title] input',
    message: '[data-test-system-alert-form-message] textarea',
  },

  // component system-alert
  systemAlert: '[data-test-system-alert]',

  // component vl-delete-user
  vlDeleteUser: {
    delete: '[data-test-vl-delete-user]',
  },

  // component next-button
  // TODO-selector this component is just a linkTo, refactor to au component
  goToUserDetail: '[data-test-next-button-user-detail]',
};
export default selectors;
