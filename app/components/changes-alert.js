// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['vl-alert', 'vl-alert--warning'],

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    clearAction() {
      this.clearAction();
    },
  },
});
