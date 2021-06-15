export default {
  // route settings/system-alerts/index/template, move naar settings
  managementModal: {
    add: '[data-test-add-system-alert]',
    edit: '[data-test-edit-system-alert]',
    remove: '[data-test-remove-system-alert]',
  },

  // component system-alert-form, move naar settings
  formFields: {
    fromDate: '[data-test-system-alert-form-from-date] input',
    toDate: '[data-test-system-alert-form-to-date] input',
    title: '[data-test-system-alert-form-title] input',
    message: '[data-test-system-alert-form-message] textarea',
  },

  // component system-alert, move naar settings
  alert: '[data-test-system-alert]',
};
