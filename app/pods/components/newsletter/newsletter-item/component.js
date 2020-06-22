import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom'],
  isEditing: false,

  allowEditing: computed('definite', function () {
    return this.definite === 'false';
  }),

});
