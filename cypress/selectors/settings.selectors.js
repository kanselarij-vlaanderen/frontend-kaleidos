const selectors = {
  // route settings
  settings: {
    generalSettings: '[data-test-route-settings-general-settings]',
    manageMinisters: '[data-test-route-settings-manage-ministers]',
    manageUsers: '[data-test-route-settings-manage-users]',
    manageOrganizations: '[data-test-route-settings-manage-organizations]',
  },

  // route settings/users/index
  usersIndex: {
    searchInput: '[data-test-route-settings-users-search-input]',
    searchButton: '[data-test-route-settings-users-search-button]',
    dateFilterFrom: '[data-test-route-settings-user-date-from]',
    dateFilterTo: '[data-test-route-settings-user-date-to]',
    table: '[data-test-route-settings-users-table]',
    tableContent: {
      name: '[data-test-route-settings-users-table-content-name]',
      lastSeen: '[data-test-route-settings-users-table-content-last-seen]',
    },
    row: {
      name: '[data-test-route-settings-users-row-name]',
      group: '[data-test-route-settings-users-row-group]',
      person: '[data-test-route-settings-users-row-person]',
      actions: '[data-test-route-settings-users-row-actions]',
      actionsDropdown: '[data-test-route-settings-users-row-actions-dropdown]',
      action: {
        unblockMembership: 'data-test-route-settings-users-row-action-unblock-membership',
        blockMembership: 'data-test-route-settings-users-row-action-block-membership',
        unblockUser: 'data-test-route-settings-users-row-action-unblock-user',
        blockUser: 'data-test-route-settings-users-row-action-block-user',
      },
    },
  },

  // route settings/organizations/index
  organizationsIndex: {
    filterBlocked: '[data-test-route-settings-organizations-filter-blocked]',
    table: '[data-test-route-settings-organizations-table]',
    tableContent: {
      organization: '[data-test-route-settings-organizations-tablecontent-organization]',
      organizationId: '[data-test-route-settings-organizations-tablecontent-organization-id]',
    },
    row: {
      name: '[data-test-route-settings-organizations-row-name]',
      organizationId: '[data-test-route-settings-organizations-row-organization-id]',
      actions: '[data-test-route-settings-organizations-row-actions]',
      actionsDropdown: '[data-test-route-settings-organizations-row-actions-dropdown]',
      action: {
        unblockOrganization: '[data-test-route-settings-organizations-unblock-organization]',
        blockOrganization: '[data-test-route-settings-organizations-block-organization]',
      },
      organizationDetail: '[data-test-route-settings-organizations-detail]',
    },
  },

  // route settings/users/user/index
  user: {
    generalInfo: '[data-test-route-settings---user-general-info]',
    unblock: '[data-test-route-settings---user-unblock]',
    block: '[data-test-route-settings---user-block]',
    unblockMembership: '[data-test-route-settings---user-unblock-membership]',
    blockMembership: '[data-test-route-settings---user-block-membership]',
    technicalInfo: '[data-test-route-settings---user-technical-info]',
    unlinkPerson: '[data-test-route-settings---user-unlink-person]',
    linkPerson: '[data-test-route-settings---user-link-person]',
    confirm: {
      blockMembership: '[data-test-route-settings---user-confirm-block-membership]',
      unblockMembership: '[data-test-route-settings---user-confirm-unblock-membership]',
      blockUser: '[data-test-route-settings---user-confirm-block-user]',
      unblockUser: '[data-test-route-settings---user-confirm-unblock-user]',
    },
  },

  // route settings/organizations/organization/index
  organization: {
    generalInfo: '[data-test-route-settings---organization-general-info]',
    unblock: '[data-test-route-settings---organization-unblock]',
    block: '[data-test-route-settings---organization-block]',
    technicalInfo: {
      header: '[data-test-route-settings---organization-technical-info-header]',
      row: {
        mandatee: '[data-test-route-settings---organization-technical-info-row-mandatee]',
        unlinkMandatee: '[data-test-route-settings---organization-technical-info-row-unlink-mandatee]',
        linkMandatee: '[data-test-route-settings---organization-technical-info-row-link-mandatee]',
      },
    },
    confirm: {
      blockOrganization: '[data-test-route-settings---organization-confirm-block-organization]',
      unBlockOrganization: '[data-test-route-settings---organization-confirm-unblock-organization]',
      unlinkMandatee: '[data-test-route-settings---organization-confirm-unlink-mandatee]',
    },
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
  goToUserDetail: '[data-test-button-user-detail]',

  // component organization-filter
  organizationFilter: {
    filter: '[data-test-settings-organization-filter]',
    search: '.ember-power-select-search > input',
    ovoListLink: '[data-test-settings-organization-filter-OVO-list-link]',
    clearFilter: '[data-test-settings-organization-clear-filter]',
  },
};
export default selectors;
