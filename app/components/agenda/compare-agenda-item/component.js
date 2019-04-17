import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	changedSet: null,

  hasSecondAgenda: computed('changedSet', function () {
    return !!this.changedSet && !!this.changedSet.previous;
  }),

  hasFirstAgenda: computed('changedSet', function () {
    return !!this.changedSet && !!this.changedSet.current;
  }),

});
