import Component from '@ember/component';

export default Component.extend({
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
