import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNameBindings: ['getClassNames'],
  width: null,
  id: null,
  value: null,

  getClassNames: computed('width', function () {
    const defaultClassName = 'vl-col--3-4';
    const width = this.get('width');
    if (width) {
      return `vl-col--${width}-4`;
    } else {
      return defaultClassName;
    }
  })
});
