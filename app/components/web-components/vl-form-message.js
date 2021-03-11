import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  messageType: null,
  message: null,
  classNameBindings: ['getClassNames'],
  tagName: 'p',

  getClassNames: computed('messageType', function() {
    const type = this.get('messageType');
    const defaultClass = 'vl-form';
    if (type) {
      return `${defaultClass}__${type}`;
    }
    return defaultClass;
  }),
});
