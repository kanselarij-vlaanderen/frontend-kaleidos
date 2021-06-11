const selectors = {
  // TODO KAS-2647 move to util.selectors
  // vl-form-input
  formInput: '[data-test-vl-input]',

  // vl-modal-footer
  // TODO KAS-2647 duplicate met modal.modalFooterSaveButton: '[data-test-vl-modal-footer-save]'
  formSave: '[data-test-vl-save]',
  formCancelButton: '[data-test-vl-modal-footer-cancel]',

  // vl-toggle
  formVlToggle: '[data-test-vl-toggle]',

  // vl-datepicker
  datepickerInput: '[data-test-vl-datepicker-input]',

  // simple-file-uploader
  fileUploadButton: '[data-test-file-upload-button]',

  // TODO KAS-2647 move to agenda.selectors
  // new-session
  meeting: {
    formattedMeetingIdentifier: '[data-test-meeting-formattedMeetingIdentifier]',
    meetingEditIdentifierButton: '[data-test-meeting-edit-identifier-button]',
    save: '[data-test-new-session-save]',
  },
};
export default selectors;
