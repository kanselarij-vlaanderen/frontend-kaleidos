import Component from '@ember/component';

export default Component.extend({
  classNames: ['vlc-navbar vlc-navbar--no-padding'],
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
