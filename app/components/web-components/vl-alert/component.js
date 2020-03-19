import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-alert'],
  classNameBindings: ['getClassNames'],
  type: null,
  getClassNames: computed('type', function () {
    const type = this.type;
    if (type === 'danger') {
      return 'vl-alert--error';
    } else if (type === 'warning') {
      return 'vl-alert--warning';
    } else if (type === 'success') {
      return 'vl-alert--success';
    }
  }),

  iconClass: computed('small', function () {
    return 'vl-vi vl-vi-alert-circle';
  })
});
