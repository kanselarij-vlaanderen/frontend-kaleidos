// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-modal__footer auk-modal__footer--bordered'],
  isLoading: null,
  disableSave: false,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    cancelAction() {
      this.cancelAction();
    },

    saveAction() {
      this.saveAction();
    },
  },
});
