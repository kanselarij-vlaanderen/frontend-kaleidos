import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  classNames: ['auk-u-mb-4'],

  actions: {
    modelChanged(value) {
      this.modelChanged(value);
    },
  },
});
