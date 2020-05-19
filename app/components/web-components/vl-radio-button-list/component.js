import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  classNames: ['vl-u-spacer'],

  actions: {
    modelChanged(event) {
      this.modelChanged(event.target.value);
    },
  },
});
