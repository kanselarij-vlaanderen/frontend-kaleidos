const managementModal = {
  add: '[data-test-add-system-alert]',
  edit: '[data-test-edit-system-alert]',
  remove: '[data-test-remove-system-alert]'
};

const formFields = {
  fromDate: '[data-test-system-alert-form-from-date] input',
  toDate: '[data-test-system-alert-form-to-date] input',
  title: '[data-test-system-alert-form-title] input',
  message: '[data-test-system-alert-form-message] textarea',
};

const alert = '[data-test-system-alert]';

export {
  managementModal,
  formFields,
  alert
};
