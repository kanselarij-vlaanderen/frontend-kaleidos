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
      firstname: '[data-test-route-settings-users-row-first-name]',
      group: '[data-test-route-settings-users-row-group]',
    },
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

  // route settings/system-alerts/index/template
  systemAlertsIndex: {
    add: '[data-test-route-settings-system-alerts-index-add]',
    remove: '[data-test-route-settings-system-alerts-index-remove]',
    // TODO unused selector (remove?)
    edit: '[data-test-route-settings-system-alerts-index-edit]',
  },

  // component system-alert-form
  systemAlertForm: {
    title: '[data-test-system-alert-form-title] input',
    message: '[data-test-system-alert-form-message] textarea',
    // TODO unused selectors (remove?)
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
  // TODO this component is just a linkTo, refactor to au component
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
    // TODO unused selector
    edit: '[data-test-manage-government-fields-edit]',
    delete: '[data-test-manage-government-fields-delete]',
  },

  // component manage-ise-codes
  manageIseCodes: {
    add: '[data-test-manage-ise-code-add]',
    // TODO unused selector
    edit: '[data-test-manage-ise-code-edit]',
    delete: '[data-test-manage-ise-code-delete]',
  },
};
export default selectors;
