const selectors = {
  // route settings
  settings: {
    generalSettings: '[data-test-route-settings-general-settings]',
    manageMinisters: '[data-test-route-settings-manage-ministers]',
    manageUsers: '[data-test-route-settings-manage-users]',
  },

  // route settings/users/index
  usersIndex: {
    importCSV: '[data-test-route-settings-users-import-csv]',
    searchInput: '[data-test-route-settings-users-search-input]',
    searchButton: '[data-test-route-settings-users-search-button]',
    table: '[data-test-route-settings-users-table]',
    row: {
      firstname: '[data-test-route-settings-users-row-first-name]',
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

  // route settings/ministers
  ministers: {
    add: '[data-test-route-settings-ministers-add]',
    // TODO-selector unused selectors
    sortableGroup: '[data-test-route-settings-ministers-sortable-group]',
    sortableGroupRow: '[data-test-route-settings-ministers-sortable-group-row]',
    mandatee: {
      edit: '[data-test-route-settings-ministers-mandatee-edit]',
      delete: '[data-test-route-settings-ministers-mandatee-delete]',
      // TODO-selector unused selectors
      fullDisplayName: '[data-test-route-settings-ministers-mandatee-full-display-name]',
      nickname: '[data-test-route-settings-ministers-mandatee-nickname]',
      priority: '[data-test-route-settings-ministers-mandatee-priority]',
      resign: '[data-test-mandatee-route-settings-ministers-mandatee-resign]',
    },
  },

  // route settings/system-alerts/index/template
  systemAlertsIndex: {
    alerts: '[data-test-route-settings-system-alerts-index-alerts-dropdown]',
    add: '[data-test-route-settings-system-alerts-index-add]',
    remove: '[data-test-route-settings-system-alerts-index-remove]',
    // TODO-selector unused selector (remove?)
    edit: '[data-test-route-settings-system-alerts-index-edit]',
  },

  // component system-alert-form
  systemAlertForm: {
    title: '[data-test-system-alert-form-title] input',
    message: '[data-test-system-alert-form-message] textarea',
    // TODO-selector unused selectors (remove?)
    fromDate: '[data-test-system-alert-form-from-date] input',
    toDate: '[data-test-system-alert-form-to-date] input',
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

  // component model-manager
  modelManager: {
    add: '[data-test-vl-model-manager-add]',
    edit: '[data-test-vl-model-manager-edit]',
    delete: '[data-test-vl-model-manager-delete]',
  },

  // component manage-government-fields
  manageGovernmentFields: {
    add: '[data-test-manage-government-fields-add]',
    // TODO-selector unused selector
    edit: '[data-test-manage-government-fields-edit]',
    delete: '[data-test-manage-government-fields-delete]',
  },
};
export default selectors;
