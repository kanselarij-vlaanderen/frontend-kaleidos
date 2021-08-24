// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  store: inject(),
  classNames: ['auk-u-mb-4'],

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    modelChanged(value) {
      this.modelChanged(value);
    },
  },
});
