import Component from '@ember/component';

export default Component.extend({
  classNames: ['auk-modal__footer auk-modal__footer--bordered'],
  isLoading: null,
  disableSave: false,

  actions: {
    cancelAction() {
      this.cancelAction();
    },

    saveAction() {
      this.saveAction();
    },
  },
});
